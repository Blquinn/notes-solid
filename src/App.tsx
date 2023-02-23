import AppBar from "./lib/skeleton/components/AppBar";
import AppShell from "./lib/skeleton/components/AppShell";

import { Icon } from "solid-heroicons";
import { cog_6Tooth, pencilSquare } from "solid-heroicons/solid";
import { createSignal, Match, onMount, Switch, useContext } from "solid-js";
import DirectoryButton from "./lib/components/DirectoryButton";
import Editor from "./lib/components/editor/Editor";
import { NoteListContextProvider, NotesListContext } from "./lib/components/notelist/context";
import { TreeProvider } from "./lib/components/treeview/treeContext";
import { getNotesDataDir, loadDirectoryTree, saveNote } from "./lib/persistence";
import LightSwitch from "./lib/skeleton/utlities/LightSwitch";
import Modal from "./lib/skeleton/utlities/Modal/Modal";
import NotesPane from "./NotesPane";
import { DirectoryTreeContext, LoadingError, NoteMeta, notesDirLoadingState, setNotesDirLoadingState, type DirectorySet } from "./state";
import { v1 } from 'uuid';

import CollapseLeftSidebar from './assets/icons/collapse_left_sidebar.svg';
import ExpandLeftSidebar from './assets/icons/expand_left_sidebar.svg';
import { createStorageSignal } from "./lib/localStorage";
import { join } from "@tauri-apps/api/path";
import LoadingSpinner from "./lib/components/LoadingSpinner";

function Shell() {
  const [notesListState, notesListStore] = useContext(NotesListContext);
  const [dirTreeState, dirTreeStore] = useContext(DirectoryTreeContext);
  const [showDirTree, setShowDirTree] = createStorageSignal('notes.layout.showDirTree', true);

  const onNewNoteButtonClicked = async () => {
    const id = v1();
    const title = 'New Note';
    const path = await join(dirTreeState.selectedNode ?? '', `${title}.xhtml`)
    const note: NoteMeta = {
      id,
      path,
      title,
      created: new Date(),
      updated: new Date(),
    }
    await saveNote(note);
    notesListStore.updateNote(note);
  }

  // TODO: Figure out tooltips
  const newNoteButton = (
    <button onClick={onNewNoteButtonClicked} class="h-6 w-6">
      <Icon path={pencilSquare} />
    </button>
  );

  const toggleSideBarButton = (
    <button onClick={() => setShowDirTree(!showDirTree())} class="h-6 w-6">
      {showDirTree() ? (
        <CollapseLeftSidebar />
      ) : (
        <ExpandLeftSidebar />
      )}
    </button>
  );

  const headerLead = (
    <span class="flex flex-row gap-1">
      {toggleSideBarButton}
      {newNoteButton}
    </span>
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
    <AppBar padding="p-2" shadow="drop-shadow" lead={headerLead} trail={settingsButton} />
  );

  const loadNotes = async (directory: string) => {
    setNotesDirLoadingState({ state: 'loading', notesDirectory: directory });

    const result = await loadDirectoryTree(directory);
    if (result.isOk) {
      dirTreeStore.replaceTree(result.value);
      setNotesDirLoadingState({ state: 'loaded', notesDirectory: directory });
    } else {
      setNotesDirLoadingState({ state: 'error', notesDirectory: directory, error: result.error });
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
      <Match when={notesDirLoadingState().state == 'loading'}>
        <div class="flex w-full h-full justify-center align-center">
          <LoadingSpinner />
        </div>
      </Match>
      <Match when={notesDirLoadingState().state == 'error'}>
        <span>Got error when loading notes directory: {(notesDirLoadingState() as LoadingError).error}.</span>
      </Match>
      <Match when={notesDirLoadingState().state == 'loaded'}>
        <Modal open={settingsOpen} onClose={() => { setSettingsOpen(false) }}>
          <div class="p-4">
            <h3>Settings Pannel</h3>
            <div>
              <span><b>Brightness </b></span>
              <span><LightSwitch /></span>
            </div>
            <div>
              <b>Notes directory:</b>
              <div class="h-full w-full flex justify-center items-center">
                <DirectoryButton buttonClass="variant-filled" name="set-notes-dir-button" onAccept={onDirectorySelected} />
              </div>
            </div>
          </div>
        </Modal>

        <AppShell
          leftSideBarContent={
            <NotesPane showDirectoryTree={showDirTree} />
          }
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
