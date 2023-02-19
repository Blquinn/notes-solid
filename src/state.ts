import { createTreeContext, TTree } from "./lib/components/treeview/treeContext";
import { createSignal } from "solid-js";

export interface NoteMeta {
  id: string
  title: string
  path: string[]
}

export interface Directory {
  name: string
}

const tree: TTree<NoteMeta> = [
  // {
  //   id: uuid.v1(),
  //   label: "A Note",
  //   // data: { body: 'Hello world' },
  // },
  // {
  //   id: uuid.v1(),
  //   label: "Another Note That has a Really Long Title Which Just Never Seems to End and It Goes on And on.",
  // },
  // {
  //   id: uuid.v1(),
  //   label: "A Notebook",
  //   children: [
  //     {
  //       id: uuid.v1(),
  //       label: "A Child Notebook",
  //       children: [
  //         { id: uuid.v1(), label: "A Note in A Child Notebook" },
  //         {
  //           id: uuid.v1(),
  //           label: "Yet Another Child",
  //           children: [
  //             { id: uuid.v1(), label: "Foo" },
  //             { id: uuid.v1(), label: "Bar" },
  //             { id: uuid.v1(), label: "Bin" }
  //           ],
  //         },
  //         { id: uuid.v1(), label: "Quux" },
  //       ],
  //     },
  //     {
  //       id: uuid.v1(),
  //       label: "Another Notebook",
  //       children: [
  //         { id: uuid.v1(), label: "Foo" },
  //         { id: uuid.v1(), label: "Bar" },
  //         { id: uuid.v1(), label: "Baz" }
  //       ],
  //     },
  //   ],
  // },
];


export type DirectoryNotSet = {state: 'not_set'};
export type DirectorySet = {state: 'set', notesDirectory: string};
export type LoadingError = {state: 'error', error: string};
export type NotesLoaded = {state: 'loaded', notesDirectory: string};

export type NotesLoadingState = DirectoryNotSet | DirectorySet | LoadingError | NotesLoaded;

export const [notesLoadingState, setNotesLoadingState] = createSignal<NotesLoadingState>({state: 'not_set'});

export const NoteTreeContext = createTreeContext<NoteMeta>({ tree, expandedNodes: {} });

export const notesDir = (): string | undefined => {
  const loadingState = notesLoadingState();
  if (loadingState.state == 'loaded' || loadingState.state == 'set') {
    return loadingState.notesDirectory
  }
  return undefined;
}
