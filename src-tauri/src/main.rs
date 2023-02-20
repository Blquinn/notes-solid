#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod errors;

use std::{
    ffi::OsStr,
    path::{self, Path}, io::BufReader, fs::File,
};

use anyhow::anyhow;
use errors::CommandResult;
use quick_xml::{
    events::{BytesStart, Event},
    Reader,
};
use rayon::prelude::*;
use regex::RegexBuilder;
use serde::{Deserialize, Serialize};
use walkdir::{DirEntry, WalkDir};

fn is_hidden(entry: &DirEntry) -> bool {
    entry
        .file_name()
        .to_str()
        .map(|s| s.starts_with("."))
        .unwrap_or(false)
}

// TODO: Error handling
// Dir not exist
// Malformed xml
// What if there are random other files in there?

#[derive(Serialize, Deserialize, Default)]
pub struct NoteMeta {
    id: String,
    path: Vec<String>,
    title: String,
    is_directory: bool,
}

#[tauri::command]
fn load_notes_dir(dir: &str) -> CommandResult<Vec<NoteMeta>> {
    println!("Loading notes from {}.", dir);

    let dir_path = Path::new(dir);
    let path_sep = OsStr::new(&path::MAIN_SEPARATOR.to_string()).to_owned();

    if !(dir_path.exists() || dir_path.is_dir()) {
        println!("Directory {} doesn't exist, or isn't valid directory.", dir);
        return Err(anyhow!("Provided path is not a valid directory.").into());
    }

    return Ok(WalkDir::new(dir)
        .into_iter()
        .filter_entry(|e| !is_hidden(e))
        .par_bridge()
        .into_par_iter()
        .flatten()
        .map(|e| {
            let path = Path::new(e.path().to_str()?);

            if dir_path == path {
                return None;
            }

            let mut nm = NoteMeta::default();

            nm.path = Path::new(&path)
                .strip_prefix(dir)
                .unwrap()
                .iter()
                .filter(|p| *p != path_sep)
                .map(|os| os.to_str().unwrap().to_owned())
                .collect();

            nm.title = path.file_stem().unwrap().to_str().unwrap().to_owned();

            if e.file_type().is_dir() {
                nm.is_directory = true;
                nm.title = path.file_name()?.to_str()?.to_owned();
                return Some(nm);
            }

            let mut reader = match Reader::from_file(&path) {
                Ok(reader) => reader,
                Err(_) => return None,
            };

            let mut buf = Vec::new();

            let get_attr_val_by_name = |reader: &Reader<BufReader<File>>, e: &BytesStart, name: &[u8]| -> Option<String> {
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
                    Ok(Event::Empty(e)) => {
                        match e.name().as_ref() {
                            b"meta" => {
                                let name = get_attr_val_by_name(&reader, &e, b"name")?;
                                let content = get_attr_val_by_name(&reader, &e, b"content")?;

                                match name.as_ref() {
                                    "id" => {
                                        nm.id = content;
                                    }
                                    _ => {}
                                }
                            }
                            _ => (),
                        }
                    }
                    Ok(Event::End(ref e)) => match e.name().as_ref() {
                        b"head" => break,
                        _ => (),
                    },
                    Ok(Event::Eof) => break,
                    Err(_) => return None,
                    _ => (),
                }
            }

            Some(nm)
        })
        .flatten()
        .collect());
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
        .invoke_handler(tauri::generate_handler![load_notes_dir, search_notes])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
