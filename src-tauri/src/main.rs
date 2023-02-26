#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod errors;

use std::{
    fs::{read_dir, File},
    io::BufReader,
    path::{Path, PathBuf},
};

use anyhow::{anyhow, Context, Error};
use errors::CommandResult;
use quick_xml::{
    events::{BytesStart, Event},
    Reader,
};
use rayon::prelude::*;
use regex::RegexBuilder;
use serde::{Deserialize, Serialize};
use walkdir::{DirEntry, WalkDir};

// TODO: Error handling
// Dir not exist
// Malformed xml
// What if there are random other files in there?

#[derive(Serialize, Deserialize, Default)]
pub struct NoteMeta {
    id: String,
    // Path is the relative path split on directories and the file extension.
    // e.g. ['dir', 'subdir', 'filename', 'xhtml']
    path: Vec<String>,
    is_directory: bool,
    created: String,
    updated: String,
}

fn is_hidden(entry: &DirEntry) -> bool {
    entry
        .file_name()
        .to_str()
        .map(|s| s.starts_with("."))
        .unwrap_or(false)
}

fn is_hidden_std(entry: &std::fs::DirEntry) -> bool {
    entry
        .file_name()
        .to_str()
        .map(|s| s.starts_with("."))
        .unwrap_or(false)
}

fn is_note(entry: &DirEntry) -> bool {
    entry.path().extension().map_or(false, |e| e == "xhtml")
}

fn is_note_std(entry: &std::fs::DirEntry) -> bool {
    entry.path().extension().map_or(false, |e| e == "xhtml")
}

fn path_to_vec(dir_path: &PathBuf, path: &PathBuf) -> anyhow::Result<Vec<String>> {
    let mut vec: Vec<String> = path
        .strip_prefix(dir_path)?
        .components()
        .map(|c| c.as_os_str().to_str().unwrap().to_owned())
        .collect();

    let ext = path.extension().map(|e| { e.to_str().unwrap().to_owned() });
    let title = path.file_stem().unwrap().to_str().unwrap().to_owned();

    let len = vec.len();
    vec[len-1] = title;
    if let Some(e) = ext {
        vec.push(e);
    }
    Ok(vec)
}

fn load_note_meta(dir_path: &PathBuf, path: &PathBuf) -> anyhow::Result<NoteMeta> {
    let mut nm = NoteMeta::default();

    nm.path = path_to_vec(dir_path, path)?;

    let mut reader = match Reader::from_file(&path) {
        Ok(reader) => reader,
        Err(e) => return Err(e.into()),
    };

    let mut buf = Vec::new();

    let get_attr_val_by_name =
        |reader: &Reader<BufReader<File>>, e: &BytesStart, name: &[u8]| -> Option<String> {
            e.attributes()
                .flatten()
                .find(|a| a.key.as_ref() == name)
                .map(|a| -> Option<String> {
                    reader
                        .decoder()
                        .decode(a.value.as_ref())
                        .ok()
                        .map(|c| c.as_ref().to_owned())
                })?
        };

    loop {
        match reader.read_event_into(&mut buf) {
            Ok(Event::Empty(e)) => match e.name().as_ref() {
                b"meta" => {
                    let name = get_attr_val_by_name(&reader, &e, b"name")
                        .context("Failed to get name attr")?;
                    let content = get_attr_val_by_name(&reader, &e, b"content")
                        .context("Failed to get content attr.")?;

                    match name.as_ref() {
                        "id" => {
                            nm.id = content;
                        }
                        "created" => {
                            nm.created = content;
                        }
                        "updated" => {
                            nm.updated = content;
                        }
                        _ => {}
                    }
                }
                _ => (),
            },
            Ok(Event::End(ref e)) => match e.name().as_ref() {
                b"head" => break,
                _ => (),
            },
            Ok(Event::Eof) => break,
            Err(e) => return Err(e.into()),
            _ => (),
        }
    }

    Ok(nm)
}

/// Loads a list of paths.
#[tauri::command]
fn load_note_dirs(parent_dir: &str) -> CommandResult<Vec<Vec<String>>> {
    let dir_path = Path::new(parent_dir);

    Ok(WalkDir::new(&dir_path)
        .into_iter()
        .map(|res| match res {
            Ok(e) => {
                if e.file_type().is_dir() && e.path() != dir_path {
                    Some(path_to_vec(&dir_path.to_path_buf(), &e.path().to_path_buf()).unwrap())
                } else {
                    None
                }
            }
            Err(_) => None,
        })
        .flatten()
        .collect())
}

// TODO: Rename these not something dumb.
#[tauri::command]
fn load_notes_dir(dir: &str, is_root: bool) -> CommandResult<Vec<NoteMeta>> {
    let dir_path = Path::new(dir);

    println!("Loading notes from {:?}, root={}.", dir_path, is_root);

    if !(dir_path.exists() || dir_path.is_dir()) {
        println!(
            "Directory {:?} doesn't exist, or isn't valid directory.",
            dir_path
        );
        return Err(anyhow!("Provided path is not a valid directory.").into());
    }

    let dir_iter = read_dir(&dir_path).map_err(Error::msg)?;

    let mut notes: Vec<NoteMeta> = if is_root {
        WalkDir::new(&dir_path)
            .into_iter()
            .flatten()
            .filter(|e| !(is_hidden(e) || e.path().is_dir() || e.path() == dir_path) && is_note(e))
            .par_bridge()
            .into_par_iter()
            .map(|e| load_note_meta(&dir_path.to_path_buf(), &e.path().to_path_buf()))
            .flatten()
            .collect()
    } else {
        dir_iter
            .flatten()
            .filter(|f| {
                !(is_hidden_std(f) || f.file_type().unwrap().is_dir() || f.path() == dir_path)
                    && is_note_std(f)
            })
            .par_bridge()
            .into_par_iter()
            .map(|e| load_note_meta(&dir_path.to_path_buf(), &e.path().to_path_buf()))
            .flatten()
            .collect()
    };

    notes.sort_by(|a, b| b.updated.partial_cmp(&a.updated).unwrap());
    Ok(notes)
}

#[tauri::command]
fn search_notes(dir: &str, phrase: &str) -> Vec<String> {
    println!("Searching directory {} for phrase {}.", dir, phrase);

    let re = RegexBuilder::new(&regex::escape(phrase))
        .case_insensitive(true)
        .build()
        .unwrap();

    return WalkDir::new(dir)
        .into_iter()
        .filter_entry(|e| !is_hidden(e))
        .par_bridge()
        .into_par_iter()
        .map(|e| {
            let path = e.unwrap().path().to_str().unwrap().to_owned();
            let pp = Path::new(&path);
            let title = pp.file_stem().unwrap().to_str().unwrap();

            if re.is_match(title) {
                return Some(path);
            }

            let mut reader = match Reader::from_file(&path) {
                Ok(reader) => reader,
                Err(_) => return None,
            };

            let mut buf = Vec::new();

            loop {
                match reader.read_event_into(&mut buf) {
                    Ok(Event::Text(e)) => {
                        let text = e.unescape().unwrap();

                        if re.is_match(&text.as_ref()) {
                            return Some(path);
                        }
                    }
                    Ok(Event::Eof) => break, // exits the loop when reaching end of file
                    Err(_) => return None,
                    _ => (), // There are several other `Event`s we do not consider here
                }
            }

            None
        })
        .flatten()
        .collect();
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            load_note_dirs,
            load_notes_dir,
            search_notes,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
