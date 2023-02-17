import { createTreeContext, TTree } from "./lib/components/treeview/treeContext";
import * as uuid from 'uuid';
import { createSignal } from "solid-js";

export interface Note {
  body: string;
}

export interface Directory {
  name: string
}

const tree: TTree<Note> = [
  {
    id: uuid.v1(),
    label: "A Note",
    data: { body: 'Hello world' },
  },
  {
    id: uuid.v1(),
    label: "Another Note That has a Really Long Title Which Just Never Seems to End and It Goes on And on.",
  },
  {
    id: uuid.v1(),
    label: "A Notebook",
    children: [
      {
        id: uuid.v1(),
        label: "A Child Notebook",
        children: [
          { id: uuid.v1(), label: "A Note in A Child Notebook" },
          {
            id: uuid.v1(),
            label: "Yet Another Child",
            children: [
              { id: uuid.v1(), label: "Foo" },
              { id: uuid.v1(), label: "Bar" },
              { id: uuid.v1(), label: "Bin" }
            ],
          },
          { id: uuid.v1(), label: "Quux" },
        ],
      },
      {
        id: uuid.v1(),
        label: "Another Notebook",
        children: [
          { id: uuid.v1(), label: "Foo" },
          { id: uuid.v1(), label: "Bar" },
          { id: uuid.v1(), label: "Baz" }
        ],
      },
    ],
  },
];


const [notesDir, setNotesDir] = createSignal('/tmp/notes-test-dir', { equals: false });

export const NoteTreeContext = createTreeContext<Note>({ tree, expandedNodes: {} });

export {
  notesDir, setNotesDir
}
