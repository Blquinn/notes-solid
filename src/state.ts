import { createTreeContext } from "./lib/components/treeview/treeContext";
import { createSignal } from "solid-js";

// A directory is just its path.
export type DirectoryMeta = string;

export interface NoteMeta {
  id: string
  title: string
  path: string
  created: Date
  updated: Date
}

export interface Directory {
  name: string
}

export type DirectoryNotSet = {state: 'not_set'};
export type DirectorySet = {state: 'set', notesDirectory: string};
export type LoadingError = {state: 'error', error: string};
export type NotesLoaded = {state: 'loaded', notesDirectory: string};

export type NotesLoadingState = DirectoryNotSet | DirectorySet | LoadingError | NotesLoaded;

export const [notesLoadingState, setNotesLoadingState] = createSignal<NotesLoadingState>({state: 'not_set'});

export const DirectoryTreeContext = createTreeContext<DirectoryMeta>({ tree: [], expandedNodes: {} });

export const notesDir = (): string | undefined => {
  const loadingState = notesLoadingState();
  if (loadingState.state == 'loaded' || loadingState.state == 'set') {
    return loadingState.notesDirectory
  }
  return undefined;
}
