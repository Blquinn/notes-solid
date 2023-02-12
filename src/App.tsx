import "./App.css";
import AppBar from "./skeleton/components/AppBar";
import AppShell from "./skeleton/components/AppShell";

function App() {
  const leftSideBar = (
    <p>Side bar</p>
  );

  const header = (
    <AppBar>
      <p>App bar content</p>
    </AppBar>
  );

  return (
    <AppShell leftSideBarContent={leftSideBar} headerContent={header}>
      <p>Page Content</p>
    </AppShell>
  );
}

export default App;
