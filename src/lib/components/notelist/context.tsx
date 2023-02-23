import { FragmentProps } from "solid-headless/dist/types/utils/Fragment";
import { createContext } from "solid-js";
import { createStore } from "solid-js/store";
import { NoteMeta } from "../../../state";

type NotesListState = {
  notes: NoteMeta[];
  selectedNote?: string
}

export const NotesListContext = createContext<NoteListContext>([
  { notes: [] },
  {} as any,
]);

type NoteListContext = [
  NotesListState,
  {
    select(id?: string): void;
    setNotes(notes: NoteMeta[]): void;
    updateNote(note: NoteMeta): void;
  }
];

export function findActiveNote(state: NotesListState): NoteMeta | undefined {
  return state.notes.find(n => n.path == state.selectedNote);
}

export function NoteListContextProvider(props: FragmentProps) {
  const initialState: NotesListState = {
    notes: [],
  };

  const [state, setState] = createStore(initialState);

  const store: NoteListContext = [
    state,
    {
      select(id) {
        setState("selectedNote", id);
      },
      setNotes(notes) {
        setState('notes', notes);
      },
      updateNote(note) {
        setState('notes', [note, ...state.notes.filter(n => n.id !== note.id)]);
      }
    },
  ];

  return (
    <NotesListContext.Provider value={store}>
      {props.children}
    </NotesListContext.Provider>
  )
}
