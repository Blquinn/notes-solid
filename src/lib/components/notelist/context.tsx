import { FragmentProps } from "solid-headless/dist/types/utils/Fragment";
import { createContext } from "solid-js";
import { createStore } from "solid-js/store";
import { NoteMeta } from "../../../state";

type NotesListState = {
  loading: boolean,
  notes: NoteMeta[];
  selectedNote?: string // Note id
}

export const NotesListContext = createContext<NoteListContext>([
  { loading: false, notes: [] },
  {} as any,
]);

type NoteListContext = [
  NotesListState,
  {
    select(id?: string): void;
    setNotes(notes: NoteMeta[]): void;
    setLoading(loading: boolean): void;
    updateNote(currentNote: NoteMeta, newNote: NoteMeta): void;
  }
];

export function findActiveNote(state: NotesListState): NoteMeta | undefined {
  return state.notes.find(n => n.id == state.selectedNote);
}

export function NoteListContextProvider(props: FragmentProps) {
  const initialState: NotesListState = {
    loading: false,
    notes: [],
  };

  const [state, setState] = createStore(initialState);

  const store: NoteListContext = [
    state,
    {
      select(id) {
        setState("selectedNote", id);
      },
      setLoading(loading) {
        setState('loading', loading);
      },
      setNotes(notes) {
        setState('notes', notes);
      },
      updateNote(currentNote, newNote) {
        setState('notes', [newNote, ...state.notes.filter(n => n.id !== currentNote.id)]);
      }
    },
  ];

  return (
    <NotesListContext.Provider value={store}>
      {props.children}
    </NotesListContext.Provider>
  )
}
