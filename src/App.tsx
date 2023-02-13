import TreeView from "./lib/components/treeview/TreeView";
import AppBar from "./lib/skeleton/components/AppBar";
import AppShell from "./lib/skeleton/components/AppShell";

import "./App.css";

function App() {

  const leftSideBar = (
    <div class="side-bar h-full bg-surface-100-800-token">
      <TreeView />
    </div>
  );

  const header = (
    <AppBar padding="p-2" lead={<span>(icon)</span>} trail={<span>(icon)</span>} />
  );

  return (
    <AppShell leftSideBarContent={leftSideBar} headerContent={header}>
      <p>Page Content</p>
    </AppShell>
  );
}

export default App;
