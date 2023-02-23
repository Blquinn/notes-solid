import { createEffect, For, on, useContext } from "solid-js";
import { DirectoryTreeContext } from "../../../state";
import { loadDirectory } from "../../persistence";
import { getSelectedNode, rootNode } from "../treeview/treeContext";
import { NotesListContext } from "./context";

export default function NoteList() {
  const [dirTree, _] = useContext(DirectoryTreeContext);
  const [notesState, notesStore] = useContext(NotesListContext);

  createEffect(on(() => dirTree.selectedNode, async () => {
    let path: string | undefined;

    if (dirTree.selectedNode == rootNode) {
      path = '';
    }

    // 1. Load all the notes from the directory
    // 2. Order the notes by modification date.
    // 3. Select the first note
    const dirNode = getSelectedNode(dirTree);
    if (dirNode) {
      path = dirNode.path;
    }

    // TODO: Pass around actual 
    const notes = await loadDirectory(path ?? '', path === undefined);
    if (notes.isOk) {
      notesStore.setNotes(notes.value);
      if (notes.value.length == 0) {
        notesStore.select(undefined);
      } else {
        notesStore.select(notes.value[0].path);
      }
    } else {
      // TODO: Show error state.
    }
  }));

  return (
    <div class="list-nav overflow-y-auto hide-scrollbar" data-simplebar>
      <ul>
        <For each={notesState.notes}>{(note, i) =>
          <li
            class="list-item !m-0"
            classList={{
              ['bg-primary-active-token']: note.path == notesState.selectedNote,
            }}
          >
            <a href="#" onClick={() => notesStore.select(note.path)}>{note.title}</a>
          </li>
        }</For>
      </ul>
    </div>
  );
}
