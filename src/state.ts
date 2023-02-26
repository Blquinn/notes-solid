import { createTreeContext } from "./lib/components/treeview/treeContext";
import { createSignal } from "solid-js";
import * as path from 'path-browserify';
import { join } from "@tauri-apps/api/path";

// A directory is just its path.
export type DirectoryMeta = string;

export interface NoteMeta {
  id: string
  path: string[]
  created: Date
  updated: Date
}

// NoteMeta utils

export function noteMetaTitle(note: NoteMeta): string {
  return note.path[note.path.length - 2];
}

export function noteMetaDirPath(note: NoteMeta): string[] {
  return note.path.slice(0, note.path.length-2);
}

export function noteMetaFileName(note: NoteMeta): string {
  return note.path[note.path.length-2] + '.' + note.path[note.path.length-1];
}

export function noteMetaFilePath(note: NoteMeta): string[] {
  return [...note.path.slice(0, note.path.length-2), noteMetaFileName(note)];
}

export function noteMetaIsInDir(note: NoteMeta): boolean {
  return note.path.length > 2;
}

export function noteMetaPosixPath(note: NoteMeta): string {
  return path.join(...noteMetaFilePath(note));
}

export async function noteMetaAbsPath(note: NoteMeta): Promise<string> {
  return await join(notesDir()!, ...noteMetaFilePath(note));
}

// NoteMeta utils

export interface Directory {
  name: string
}

type BaseState = { notesDirectory: string }
export type DirectorySet = BaseState & {state: 'loading'};
export type LoadingError = BaseState & {state: 'error', error: string};
export type NotesLoaded = BaseState & {state: 'loaded'};

export type NotesLoadingState = DirectorySet | LoadingError | NotesLoaded;

export const [notesDirLoadingState, setNotesDirLoadingState] = createSignal<NotesLoadingState>({
  state: 'loading',
  notesDirectory: '',
});

export const DirectoryTreeContext = createTreeContext<DirectoryMeta>({ tree: [], expandedNodes: {} });

export const notesDir = (): string | undefined => {
  const loadingState = notesDirLoadingState();
  if (loadingState.state == 'loaded' || loadingState.state == 'loading') {
    return loadingState.notesDirectory
  }
  return undefined;
}
