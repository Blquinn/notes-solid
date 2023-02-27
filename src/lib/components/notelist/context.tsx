import { fs } from "@tauri-apps/api";
import { FragmentProps } from "solid-headless/dist/types/utils/Fragment";
import { createContext, useContext } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";
import { DirectoryMeta, DirectoryTreeContext, NoteMeta, noteMetaAbsPath, noteMetaDirPath, noteMetaTitle } from "../../../state";
import { loadDirectory, searchNotes } from "../../persistence";
import { TreeViewController } from '../treeview/treeContext';

type NotesListState = {
  loading: boolean,
  notes: NoteMeta[];
  selectedNote?: string // Note id
}

// TODO: Move things like loading a list of notes into this controller.
export class NoteListController {

  private _state: NotesListState;
  public get state(): NotesListState {
    return this._state;
  }

  private dirTree: TreeViewController<DirectoryMeta>;

  private setState: SetStoreFunction<NotesListState>;

  constructor(dirTree: TreeViewController<DirectoryMeta>) {
    this.dirTree = dirTree;

    const initialState: NotesListState = {
      loading: false,
      notes: [],
    };

    [this._state, this.setState] = createStore(initialState);
  }

  select(id?: string) {
    this.setState("selectedNote", id);
  }

  updateNote(currentNote: NoteMeta, newNote: NoteMeta) {
    this.setState('notes', [newNote, ...this._state.notes.filter(n => n.id !== currentNote.id)]);
  }

  findActiveNote(): NoteMeta | undefined {
    return this._state.notes.find(n => n.id == this._state.selectedNote);
  }

  // Returns the new note if updated, or the old note if not.
  // Returns undefined if there was no active note.
  async renameNote(newName: string): Promise<NoteMeta | undefined> {
    const note = this.findActiveNote();
    if (!note) return undefined;

    const noteTitle = noteMetaTitle(note);
    if (noteTitle === newName) {
      return note;
    }

    const dirPath = noteMetaDirPath(note);
    const newPath = [...dirPath, newName, 'xhtml'];

    const newNote: NoteMeta = {
      ...note,
      path: newPath,
    };
    const newAbsPath = await noteMetaAbsPath(newNote);
    if (await fs.exists(newAbsPath)) {
      alert(`Note ${newPath} already exists.`);
      return note;
    }

    const currentPath = await noteMetaAbsPath(note);
    await fs.renameFile(currentPath, newAbsPath);

    this.updateNote(note, newNote);
    this.select(note.id);
    return newNote;
  }

  private setNotes(notes: NoteMeta[]) {
    this.setState('notes', notes);
  }

  // TODO: This should never be set outside the controller.
  private setLoading(loading: boolean) {
    this.setState('loading', loading);
  }

  async loadNotesList() {
    if (this._state.loading) {
      return;
    }

    const path = this.dirTree.state.selectedNode;

    try {
      this.setLoading(true);

      const notes = await loadDirectory(path ?? [], path === undefined);
      if (notes.isOk) {
        this.setNotes(notes.value);
        if (notes.value.length == 0) {
          this.select(undefined);
        } else {
          this.select(notes.value[0].id);
        }
      } else {
        // TODO: Show error state.
      }
    } finally {
      this.setLoading(false);
    }
  }

  async search(phrase?: string) {
    if (!phrase) {
      await this.loadNotesList();
      return;
    }

    try {
      this.setLoading(true);

      const res = await searchNotes(phrase)
      if (res.isOk) {
        this.setNotes(res.value);
        if (res.value.length > 0) {
          this.select(res.value[0].id);
        }
      } else {
        console.error(`Failed to load notes list: ${res.error}`);
        await this.loadNotesList();
      }
    } finally {
      this.setLoading(false);
    }
  }
}

// TODO: How can we avoid creating these controllers twice?
export const NotesListContext = createContext<NoteListController>(
  new NoteListController(useContext(DirectoryTreeContext))
);

export function NoteListControllerProvider(props: FragmentProps) {
  const dirTree = useContext(DirectoryTreeContext);
  const controller = new NoteListController(dirTree);

  return (
    <NotesListContext.Provider value={controller}>
      {props.children}
    </NotesListContext.Provider>
  )
}
