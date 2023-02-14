import TreeView from "./lib/components/treeview/TreeView";
import AppBar from "./lib/skeleton/components/AppBar";
import AppShell from "./lib/skeleton/components/AppShell";

import "./App.css";
import Editor from "./lib/components/editor/Editor";
import LightSwitch from "./lib/skeleton/utlities/LightSwitch";

function App() {

  const leftSideBar = (
    <div class="side-bar h-full bg-surface-100-800-token">
      <TreeView classes="bg-surface-100-800-token" />
    </div>
  );

  const header = (
    <AppBar padding="p-2" shadow="drop-shadow" lead={<span>(icon)</span>} trail={<LightSwitch/>} />
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
