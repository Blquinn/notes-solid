import AppBar from "./lib/skeleton/components/AppBar";
import AppShell from "./lib/skeleton/components/AppShell";

import { Icon } from "solid-heroicons";
import { cog_6Tooth, pencilSquare } from "solid-heroicons/solid";
import { Match, onMount, Switch, useContext } from "solid-js";
import DirectoryButton from "./lib/components/DirectoryButton";
import Editor from "./lib/components/editor/Editor";
import { NoteListControllerProvider, NotesListContext } from "./lib/components/notelist/context";
import { TreeProvider } from "./lib/components/treeview/treeContext";
import { getNotesDataDir, loadDirectoryTree, saveNote, searchNotes } from "./lib/persistence";
import LightSwitch from "./lib/skeleton/utlities/LightSwitch";
import NotesPane from "./NotesPane";
import { DirectoryTreeContext, LoadingError, NoteMeta, notesDirLoadingState, setNotesDirLoadingState, type DirectorySet } from "./state";
import { v1 } from 'uuid';

import CollapseLeftSidebar from './assets/icons/collapse_left_sidebar.svg';
import ExpandLeftSidebar from './assets/icons/expand_left_sidebar.svg';
import { createStorageSignal } from "./lib/localStorage";
import LoadingSpinner from "./lib/components/LoadingSpinner";
import { ModalContext, ModalContextProvider } from "./lib/skeleton/utlities/Modal/context";
import debounce from "lodash.debounce";

function Shell() {
  const notesListController = useContext(NotesListContext);
  const dirTreeController = useContext(DirectoryTreeContext);
  const [showDirTree, setShowDirTree] = createStorageSignal('notes.layout.showDirTree', true);

  const onNewNoteButtonClicked = async () => {
    const id = v1();
    const title = 'New Note';
    
    const note: NoteMeta = {
      id,
      path: [...(dirTreeController.state.selectedNode ?? []), title, 'xhtml'],
      created: new Date(),
      updated: new Date(),
    }
    await saveNote(note);
    notesListController.updateNote(note, note);
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


  const onDirectorySelected = (dir: string | null) => {
    if (dir == null) {
      return;
    }

    loadNotes(dir);
  }

  const settingsPanel = (
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
  );

  const settingsButton = () => {
    const modalController = useContext(ModalContext);

    return (
      <button onClick={() => modalController.setContent(settingsPanel)} class="h-6 w-6">
        <Icon path={cog_6Tooth} />
      </button>
    );
  }

  const searchDebounce = debounce(async (phrase: string | null) => {
    await notesListController.search(phrase || undefined);
  }, 300);

  const searchEntry = () => {
    // Debounce
    return (
      <input 
        type="search" 
        class="input p-1" 
        placeholder="Search notes..." 
        onInput={(e) => searchDebounce((e.target as any).value)} 
      />
    );
  }

  const headerTrail = () => {
    return (
      <>
        {searchEntry}
        {settingsButton}
      </>
    );
  }

  const header = () => (
    <AppBar padding="p-2" shadow="drop-shadow" lead={headerLead} trail={headerTrail} />
  );

  // TODO: Loading state should be encapsulated into the controller.
  const loadNotes = async (directory: string) => {
    setNotesDirLoadingState({ state: 'loading', notesDirectory: directory });

    const result = await loadDirectoryTree(directory);
    if (result.isOk) {
      dirTreeController.replaceTree(result.value);
      setNotesDirLoadingState({ state: 'loaded', notesDirectory: directory });
    } else {
      setNotesDirLoadingState({ state: 'error', notesDirectory: directory, error: result.error });
    }
  }

  onMount(async () => {
    const noteDir = await getNotesDataDir();
    await loadNotes(noteDir)
  });

  return (
    <Switch>
      <Match when={notesDirLoadingState().state == 'loading'}>
        <div class="flex flex-col w-full h-full justify-center items-center">
          <LoadingSpinner class="h-12 w-12" />
          <h5>Loading Notebook...</h5>
        </div>
      </Match>
      <Match when={notesDirLoadingState().state == 'error'}>
        <span>Got error when loading notes directory: {(notesDirLoadingState() as LoadingError).error}.</span>
      </Match>
      <Match when={notesDirLoadingState().state == 'loaded'}>
        <AppShell
          leftSideBarContent={
            <NotesPane showDirectoryTree={showDirTree} />
          }
          leftSideBarClasses="shadow"
          headerContent={header}
          pageClasses="flex-1 flex flex-col min-h-0 bg-surface-50-900-token"
          childrenClasses="flex-1 flex flex-col min-h-0 bg-surface-50-900-token"
        >
          {notesListController.state.selectedNote ? (
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
  const dirViewController = DirectoryTreeContext.defaultValue;

  return (
    <TreeProvider tree={dirViewController.state.tree} context={DirectoryTreeContext}>
      <NoteListControllerProvider>
        <ModalContextProvider>
          <Shell />
        </ModalContextProvider>
      </NoteListControllerProvider>
    </TreeProvider>
  );
}

export default App;
