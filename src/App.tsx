import "./App.css";
import AppBar from "./lib/skeleton/components/AppBar";
import AppShell from "./lib/skeleton/components/AppShell";

function App() {
  const leftSideBar = (
    <p>Side bar</p>
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
