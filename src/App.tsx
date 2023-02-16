import TreeView from "./lib/components/treeview/TreeView";
import AppBar from "./lib/skeleton/components/AppBar";
import AppShell from "./lib/skeleton/components/AppShell";

import "./App.css";
import Editor from "./lib/components/editor/Editor";
import LightSwitch from "./lib/skeleton/utlities/LightSwitch";
import { pencilSquare } from "solid-heroicons/solid";
import { Icon } from "solid-heroicons";
import { createTreeContext, TTree } from "./lib/components/treeview/treeContext";
import { Note } from "./state";

const tree: TTree<Note> = [
  {
    path: 'A Note',
    label: "A Note",
    data: { body: 'Foo' },
  },
  {
    path: 'Another Note That has a Really Long Title Which Just Never Seems to End and It Goes on And on.',
    label: "Another Note That has a Really Long Title Which Just Never Seems to End and It Goes on And on.",
  },
  {
    path: 'A Notebook',
    label: "A Notebook",
    children: [
      {
        path: 'A Notebook/A Child Notebook',
        label: "A Child Notebook",
        children: [
          { path: 'A Notebook/A Child Notebook/A Note in A Child Notebook', label: "A Note in A Child Notebook" },
          {
            path: 'A Notebook/A Child Notebook/Yet Another Child',
            label: "Yet Another Child",
            children: [
              { path: 'A Notebook/A Child Notebook/Yet Another Child/Foo', label: "Foo" },
              { path: 'A Notebook/A Child Notebook/Yet Another Child/Bar', label: "Bar" },
              { path: 'A Notebook/A Child Notebook/Yet Another Child/Bin', label: "Bin" }
            ],
          },
          { path: 'A Notebook/A Child Notebook/Quux', label: "Quux" },
        ],
      },
      {
        path: 'A Notebook/Another Notebook',
        label: "Another Notebook",
        children: [
          { path: 'A Notebook/Another Notebook/Foo', label: "Foo" },
          { path: 'A Notebook/Another Notebook/Bar', label: "Bar" },
          { path: 'A Notebook/Another Notebook/Baz', label: "Baz" }
        ],
      },
    ],
  },
];

function App() {
  const noteTreeContext = createTreeContext<Note>({tree, expandedNodes: {}});

  const leftSideBar = (
    <div class="side-bar h-full bg-surface-100-800-token">
      <TreeView classes="bg-surface-100-800-token" context={noteTreeContext} />
    </div>
  );

  const newNoteButton = (
    <button onClick={() => console.log('cleeeeiicckkkk')} class="h-6 w-6">
      <Icon path={pencilSquare} />
    </button>
  );

  const header = (
    <AppBar padding="p-2" shadow="drop-shadow" lead={newNoteButton} trail={<LightSwitch/>} />
  );

  return (
    <AppShell 
      leftSideBarContent={leftSideBar} 
      leftSideBarClasses="shadow"
      headerContent={header}
      pageClasses="flex-1 flex flex-col min-h-0 bg-surface-100-900-token"
      childrenClasses="flex-1 flex flex-col min-h-0 bg-surface-100-900-token"
    >
      <Editor/>
    </AppShell>
  );
}

export default App;
