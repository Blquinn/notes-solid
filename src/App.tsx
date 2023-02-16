import AppBar from "./lib/skeleton/components/AppBar";
import AppShell from "./lib/skeleton/components/AppShell";

import "./App.css";
import Editor from "./lib/components/editor/Editor";
import LightSwitch from "./lib/skeleton/utlities/LightSwitch";
import { pencilSquare } from "solid-heroicons/solid";
import { Icon } from "solid-heroicons";
import { createTreeContext, TreeProvider, TTree, TTreeNode } from "./lib/components/treeview/treeContext";
import { Note } from "./state";
import * as uuid from 'uuid';
import NotesPane from "./NotesPane";

const tree: TTree<Note> = [
  {
    id: uuid.v1(),
    label: "A Note",
    data: { body: 'Foo' },
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

function App() {
  const noteTreeContext = createTreeContext<Note>({ tree, expandedNodes: {} });

  const newNoteButton = (
    <button onClick={() => console.log('cleeeeiicckkkk')} class="h-6 w-6">
      <Icon path={pencilSquare} />
    </button>
  );

  const header = (
    <AppBar padding="p-2" shadow="drop-shadow" lead={newNoteButton} trail={<LightSwitch />} />
  );

  return (
    <TreeProvider tree={tree} context={noteTreeContext}>
      <AppShell
        leftSideBarContent={<NotesPane noteTreeContext={noteTreeContext} />}
        leftSideBarClasses="shadow"
        headerContent={header}
        pageClasses="flex-1 flex flex-col min-h-0 bg-surface-100-900-token"
        childrenClasses="flex-1 flex flex-col min-h-0 bg-surface-100-900-token"
      >
        <Editor />
      </AppShell>
    </TreeProvider>
  );
}

export default App;
