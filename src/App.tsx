import AppBar from "./lib/skeleton/components/AppBar";
import AppShell from "./lib/skeleton/components/AppShell";

import "./App.css";
import Editor from "./lib/components/editor/Editor";
import LightSwitch from "./lib/skeleton/utlities/LightSwitch";
import { pencilSquare } from "solid-heroicons/solid";
import { Icon } from "solid-heroicons";
import { TreeProvider } from "./lib/components/treeview/treeContext";
import { LoadingError, notesLoadingState, NoteTreeContext, setNotesLoadingState, type DirectorySet } from "./state";
import NotesPane from "./NotesPane";
import { Match, Switch, useContext } from "solid-js";
import { loadNotesTree } from "./lib/persistence";
import DirectoryButton from "./lib/components/DirectoryButton";

function Shell() {
  const [state, store] = useContext(NoteTreeContext);

  const onNewNoteButtonClicked = () => {
    store.addNode([], {
      id: 'New Note.xhtml',
      label: 'New Note',
      data: {
        id: 'New Note',
        title: 'New Note',
        path: ['New Note.xhtml'],
      }
    })
    store.select('New Note.xhtml')
  }

  // TODO: Figure out tooltips
  const newNoteButton = (
    <button onClick={onNewNoteButtonClicked} class="h-6 w-6">
      <Icon path={pencilSquare} />
    </button>
  );

  const header = (
    <AppBar padding="p-2" shadow="drop-shadow" lead={newNoteButton} trail={<LightSwitch />} />
  );

  const loadNotes = async (directory: string) => {
    setNotesLoadingState({state: 'set', notesDirectory: directory});

    const result = await loadNotesTree(directory);
    if (result.isOk) {
      store.replaceTree(result.value);
      setNotesLoadingState({state: 'loaded', notesDirectory: directory});
    } else {
      setNotesLoadingState({state: 'error', error: result.error});
    }
  }

  // onMount(() => loadNotes('/tmp/foo'));
  // TODO: Load notes directory from local storage.

  const onDirectorySelected = (dir: string | null) => {
    if (dir == null) {
      return;
    }

    loadNotes(dir);
  }

  return (
    <Switch>
      <Match when={notesLoadingState().state == 'not_set'}>
        <div class="h-full w-full flex justify-center items-center">
          <DirectoryButton buttonClass="variant-filled" name="set-notes-dir-button" onAccept={onDirectorySelected} />
        </div>
      </Match>
      <Match when={notesLoadingState().state == 'set'}>
        <span>Loading notes from {(notesLoadingState() as DirectorySet).notesDirectory}.</span>
      </Match>
      <Match when={notesLoadingState().state == 'error'}>
        <span>Got error when loading notes directory: {(notesLoadingState() as LoadingError).error}.</span>
      </Match>
      <Match when={notesLoadingState().state == 'loaded'}>
        <AppShell
          leftSideBarContent={<NotesPane />}
          leftSideBarClasses="shadow"
          headerContent={header}
          pageClasses="flex-1 flex flex-col min-h-0 bg-surface-100-900-token"
          childrenClasses="flex-1 flex flex-col min-h-0 bg-surface-100-900-token"
        >
          {state.selectedNode ? (
            <Editor />
          ) : (
            <div class="h-full w-full flex justify-center items-center">
              <h2>No note selected</h2>
            </div>
          )}
        </AppShell>
      </Match>
    </Switch>
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
