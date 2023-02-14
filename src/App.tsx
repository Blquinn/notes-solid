import TreeView from "./lib/components/treeview/TreeView";
import AppBar from "./lib/skeleton/components/AppBar";
import AppShell from "./lib/skeleton/components/AppShell";

import "./App.css";
import Editor from "./lib/components/editor/Editor";
import LightSwitch from "./lib/skeleton/utlities/LightSwitch";
import { pencilSquare } from "solid-heroicons/solid";
import { Icon } from "solid-heroicons";

function App() {

  const leftSideBar = (
    <div class="side-bar h-full bg-surface-100-800-token p-2 flex flex-col">
      <input type="search" class="input" placeholder="Search notes" />
      <TreeView classes="bg-surface-100-800-token mt-2 flex-1 overflow-y-auto" />
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
