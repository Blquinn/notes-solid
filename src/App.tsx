import AppBar from "./lib/skeleton/components/AppBar";
import AppShell from "./lib/skeleton/components/AppShell";

import "./App.css";
import Editor from "./lib/components/editor/Editor";
import LightSwitch from "./lib/skeleton/utlities/LightSwitch";
import { pencilSquare } from "solid-heroicons/solid";
import { Icon } from "solid-heroicons";
import { TreeProvider } from "./lib/components/treeview/treeContext";
import { NoteTreeContext } from "./state";
import NotesPane from "./NotesPane";
import { onMount, useContext } from "solid-js";
import { loadNotesTree } from "./lib/persistence";

function Shell() {
  const newNoteButton = (
    <button onClick={() => console.log('cleeeeiicckkkk')} class="h-6 w-6">
      <Icon path={pencilSquare} />
    </button>
  );

  const header = (
    <AppBar padding="p-2" shadow="drop-shadow" lead={newNoteButton} trail={<LightSwitch />} />
  );

  const [_, store] = useContext(NoteTreeContext);

  onMount(async () => {
    store.replaceTree(await loadNotesTree());
  });

  return (
    <AppShell
      leftSideBarContent={<NotesPane />}
      leftSideBarClasses="shadow"
      headerContent={header}
      pageClasses="flex-1 flex flex-col min-h-0 bg-surface-100-900-token"
      childrenClasses="flex-1 flex flex-col min-h-0 bg-surface-100-900-token"
    >
      <Editor />
    </AppShell>
  );
}

function App() {
  const [state, _] = NoteTreeContext.defaultValue;

  return (
    <TreeProvider tree={state.tree} context={NoteTreeContext}>
      <Shell />
    </TreeProvider>
  );
}

export default App;
