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

type BaseState = {
  notesDirectory: string,
}
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
