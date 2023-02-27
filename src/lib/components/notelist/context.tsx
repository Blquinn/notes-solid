import { FragmentProps } from "solid-headless/dist/types/utils/Fragment";
import { createContext } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";
import { NoteMeta } from "../../../state";
import { loadDirectory } from "../../persistence";

type NotesListState = {
  loading: boolean,
  notes: NoteMeta[];
  selectedNote?: string // Note id
}

// TODO: Move things like loading a list of notes into this controller.
class NoteListController {

  private _state: NotesListState;
  public get state(): NotesListState {
    return this._state;
  }

  private setState: SetStoreFunction<NotesListState>;

  constructor() {
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

  private setNotes(notes: NoteMeta[]) {
    this.setState('notes', notes);
  }

  // TODO: This should never be set outside the controller.
  private setLoading(loading: boolean) {
    this.setState('loading', loading);
  }

  async loadNotesList(path?: string[]) {
    if (this._state.loading) {
      return;
    }

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
}

export const NotesListContext = createContext<NoteListController>(new NoteListController());

export function NoteListContextProvider(props: FragmentProps) {
  const controller = new NoteListController();

  return (
    <NotesListContext.Provider value={controller}>
      {props.children}
    </NotesListContext.Provider>
  )
}
