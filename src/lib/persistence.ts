import { invoke } from "@tauri-apps/api";
import { DOMParser as ProseDOMParser, DOMSerializer, Fragment, Node as ProseNode } from "prosemirror-model";
import { DirectoryMeta, NoteMeta, noteMetaAbsPath, noteMetaFilePath, notesDir } from "../state";
import { schema } from "./components/editor/schema";
import { TTree, TTreeNode } from "./components/treeview/treeContext";
import { readTextFile, writeTextFile, createDir, exists } from '@tauri-apps/api/fs';
import { appLocalDataDir, join, sep } from '@tauri-apps/api/path';
import { Result } from 'true-myth';
import * as p from 'path-browserify';

export const serializeDocument = (meta: NoteMeta, content?: Fragment) => {
  const d = document.createDocumentFragment();

  const html = document.createElement('html')
  d.appendChild(html)

  const head = document.createElement('head');
  html.appendChild(head);

  for (let [key, val] of Object.entries(meta)) {
    const meta = document.createElement('meta');
    meta.name = key;
    if (val instanceof Date) {
      meta.content = val.toISOString();
    } else {
      meta.content = val;
    }
    head.appendChild(meta);
  }


  const body = document.createElement('body');
  html.appendChild(body);

  if (content) {
    const contentDom = DOMSerializer.fromSchema(schema).serializeFragment(content);
    body.appendChild(contentDom);
  }

  return new XMLSerializer().serializeToString(d);
}

export type ParseResult = {
  note: NoteMeta,
  content: ProseNode,
}

const getMetaContent = (head: HTMLHeadElement, name: string): string | null => {
  const el = head.querySelector(`meta[name="${name}"]`);
  if (!el) {
    return null;
  }

  return (el as HTMLMetaElement).content;
}

const getMetaDateOrNow = (head: HTMLHeadElement, name: string): Date => {
  const cont = getMetaContent(head, name);
  if (!cont) {
    return new Date();
  }

  return new Date(cont);
}

const fileName = (path: string): string => {
  return p.basename(path, p.extname(path));
}

const dirName = (path: string[]): string => {
  return path[path.length-1]
}

// TODO: Make sure all these work cross platform.
const dirPath = (path: string, title: string): string => {
  const idx = path.lastIndexOf(title);
  return path.substring(0, idx-1)
}

export const deserializeDocument = (path: string[], doc: string): ParseResult => {
  const dom = new DOMParser().parseFromString(doc, 'application/xhtml+xml');
  const head = dom.head;

  return {
    note: {
      path,
      id: getMetaContent(head, 'id') ?? '',
      created: getMetaDateOrNow(head, 'created'),
      updated: getMetaDateOrNow(head, 'updated'),
    },
    content: ProseDOMParser.fromSchema(schema).parse(dom.body),
  };
}

export type NoteData = {
  directories: TTree<DirectoryMeta>
  notes: Map<string[], NoteMeta[]> // Map of directory paths to notes.
}

function buildDirectoryTree(dirs: DirectoryMeta[]): TTree<DirectoryMeta> {
  if (dirs.length == 0) {
    return [];
  }

  const tree: TTree<DirectoryMeta> = []

  let level: {
    [key: string]: any,
    tree: TTree<DirectoryMeta>
  } = { tree };

  dirs.forEach(dir => {
    dir.reduce((r, name: string) => {
      if (!r[name]) {
        r[name] = { tree: [] };

        const node: TTreeNode<DirectoryMeta> = { id: dirName(dir), label: dirName(dir) };
        node.children = r[name].tree;

        r.tree.push(node);
      }
      return r[name];
    }, level)
  })

  return tree;
}

export async function loadDirectoryTree(rootDir: string): Promise<Result<TTree<DirectoryMeta>, string>> {
  try {
    const dirs: string[][] = await invoke("load_note_dirs", { parentDir: rootDir });
    return Result.ok(buildDirectoryTree(dirs));
  } catch (e) {
    console.error('Failed to load notes tree.', e);
    return Result.err('Failed to load notes.');
  }
}

export interface NoteMetaDto {
  id: string
  // Path is the relative path split on directories and the file extension.
  // e.g. ['dir', 'subdir', 'filename', 'xhtml']
  path: string[]
  created: string 
  updated: string
}

function mapNoteDto(dto: NoteMetaDto): NoteMeta {
  const defaultDate = (s: string) => s ? new Date(s) : new Date();

  return {
    ...dto,
    created: defaultDate(dto.created),
    updated: defaultDate(dto.updated)
  }
}

export async function loadDirectory(dir: string[], isRoot: boolean): Promise<Result<NoteMeta[], string>> {
  try {
    const absDir = await join(notesDir()!, ...dir);
    const notes: NoteMetaDto[] = await invoke("load_notes_dir", { dir: absDir, isRoot });
    return Result.ok(notes.map(mapNoteDto));
  } catch (e) {
    const msg = `Error loading notes from ${dir}: ${e}`
    console.error(msg);
    return Result.err(msg);
  }
}

export async function loadNote(note: NoteMeta): Promise<ParseResult> {
  const path = await noteMetaAbsPath(note);
  if (! await exists(path)) {
    await saveNote(note);
  }

  const contents = await readTextFile(path);
  return deserializeDocument(note.path, contents);
}

export async function saveNote(note: NoteMeta, content?: Fragment): Promise<void> {
  const xml = serializeDocument(note, content);
  const path = await noteMetaAbsPath(note);
  await writeTextFile(path, xml);
}

// Returns a list of paths that match the phrase.
export async function searchNotes(phrase: string): Promise<Result<NoteMeta[], string>> {
  try {
    const res: NoteMeta[] = await invoke("search_notes", { dir: notesDir()!, phrase });
    return Result.ok(res);
  } catch (e) {
    const msg = `Error loading notes from ${notesDir()}: ${e}`
    console.error(msg);
    return Result.err(msg);
  }
}

// Local storage

const noteDirectoryKey = 'note_directory';

export async function getNotesDataDir(): Promise<string> {
  const noteDir = localStorage.getItem(noteDirectoryKey);
  if (noteDir) {
    return noteDir;
  }

  const dataDir = await appLocalDataDir();
  const notesDir = await join(dataDir, 'notes');
  await createDir(notesDir, { recursive: true });
  return notesDir;
}

export function setNotesDataDir(dirPath: string) {
  localStorage.setItem(noteDirectoryKey, dirPath);
}
