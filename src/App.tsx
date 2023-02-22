import AppBar from "./lib/skeleton/components/AppBar";
import AppShell from "./lib/skeleton/components/AppShell";

import { Icon } from "solid-heroicons";
import { cog_6Tooth, pencilSquare } from "solid-heroicons/solid";
import { createSignal, Match, onMount, Switch, useContext } from "solid-js";
import DirectoryButton from "./lib/components/DirectoryButton";
import Editor from "./lib/components/editor/Editor";
import { NoteListContextProvider, NotesListContext } from "./lib/components/notelist/context";
import { TreeProvider } from "./lib/components/treeview/treeContext";
import { getNotesDataDir, loadDirectoryTree } from "./lib/persistence";
import LightSwitch from "./lib/skeleton/utlities/LightSwitch";
import Modal from "./lib/skeleton/utlities/Modal/Modal";
import NotesPane from "./NotesPane";
import { DirectoryTreeContext, LoadingError, notesLoadingState, setNotesLoadingState, type DirectorySet } from "./state";

function Shell() {
  const [notesListState, _] = useContext(NotesListContext);
  const [_s, dirTreeStore] = useContext(DirectoryTreeContext);

  const onNewNoteButtonClicked = () => {
    dirTreeStore.addNode([], {
      id: 'New Note.xhtml',
      label: 'New Note',
      data: 'New Note.xhtml',
    })
    dirTreeStore.select('New Note.xhtml')
  }

  // TODO: Figure out tooltips
  const newNoteButton = (
    <button onClick={onNewNoteButtonClicked} class="h-6 w-6">
      <Icon path={pencilSquare} />
    </button>
  );

  const [settingsOpen, setSettingsOpen] = createSignal(false);

  const settingsButton = (
    <>
      <button onClick={() => setSettingsOpen(true)} class="h-6 w-6">
        <Icon path={cog_6Tooth} />
      </button>
    </>
  );

  const header = (
    <AppBar padding="p-2" shadow="drop-shadow" lead={newNoteButton} trail={settingsButton} />
  );

  const loadNotes = async (directory: string) => {
    setNotesLoadingState({ state: 'set', notesDirectory: directory });

    const result = await loadDirectoryTree(directory);
    if (result.isOk) {
      dirTreeStore.replaceTree(result.value);
      setNotesLoadingState({ state: 'loaded', notesDirectory: directory });
    } else {
      setNotesLoadingState({ state: 'error', error: result.error });
    }
  }

  onMount(async () => {
    const noteDir = await getNotesDataDir();
    await loadNotes(noteDir)
  });

  const onDirectorySelected = (dir: string | null) => {
    if (dir == null) {
      return;
    }

    loadNotes(dir);
  }

  return (
    <Switch>
      {/* TODO: This should just be a loading screen */}
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
        <Modal open={settingsOpen} onClose={() => { setSettingsOpen(false) }}>
          <div class="p-4">
            <h3>Settings Pannel</h3>
            <div>
              <span><b>Brightness </b></span>
              <span><LightSwitch /></span>
            </div>
          </div>
        </Modal>
        <AppShell
          leftSideBarContent={<NotesPane />}
          leftSideBarClasses="shadow"
          headerContent={header}
          pageClasses="flex-1 flex flex-col min-h-0 bg-surface-50-900-token"
          childrenClasses="flex-1 flex flex-col min-h-0 bg-surface-50-900-token"
        >
          {notesListState.selectedNote ? (
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
  const [state, _] = DirectoryTreeContext.defaultValue;

  return (
    <TreeProvider tree={state.tree} context={DirectoryTreeContext}>
      <NoteListContextProvider>
        <Shell />
      </NoteListContextProvider>
    </TreeProvider>
  );
}

export default App;
