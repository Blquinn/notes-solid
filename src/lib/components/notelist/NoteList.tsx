import { join, sep } from "@tauri-apps/api/path";
import { Icon } from "solid-heroicons";
import { folder } from "solid-heroicons/solid";
import { createEffect, For, on, Show, useContext } from "solid-js";
import { DirectoryTreeContext, noteMetaDirPath, noteMetaIsInDir, noteMetaTitle } from "../../../state";
import { loadDirectory } from "../../persistence";
import LoadingSpinner from "../LoadingSpinner";
import { getSelectedNode, rootNode } from "../treeview/treeContext";
import { NotesListContext } from "./context";

export default function NoteList() {
  const [dirTree, _] = useContext(DirectoryTreeContext);
  const [notesState, notesStore] = useContext(NotesListContext);

  const loaded = () => !notesState.loading;

  createEffect(on(() => dirTree.selectedNode, async () => {
    // TODO: Figure out why this fires twice.
    // TODO: Ensure that there's no race if you click a second directory while
    // still loading the first directory.
    if (notesState.loading) {
      return;
    }

    try {
      notesStore.setLoading(true);

      const path = dirTree.selectedNode;
      const notes = await loadDirectory(path ?? [], path === undefined);
      if (notes.isOk) {
        notesStore.setNotes(notes.value);
        if (notes.value.length == 0) {
          notesStore.select(undefined);
        } else {
          notesStore.select(notes.value[0].id);
        }
      } else {
        // TODO: Show error state.
      }
    } finally {
      notesStore.setLoading(false);
    }
  }));

  return (
    <Show
      when={loaded()}
      fallback={
        <div class="flex justify-center mt-4">
          <LoadingSpinner class="w-8 h-8" />
        </div>
      }
    >
      <div class="list-nav overflow-y-auto hide-scrollbar" data-simplebar>
        <ul>
          <For each={notesState.notes}>{(note, i) =>
            <li
              class="list-item !m-0"
              classList={{
                ['bg-primary-active-token']: note.id == notesState.selectedNote,
              }}
            >
              <a href="#" 
                class="block flex flex-col !items-start"
                onClick={() => notesStore.select(note.id)}
              >
                <div>{noteMetaTitle(note)}</div>

                {/* Show directory when the note is in a notebook. */}
                <Show when={dirTree.selectedNode === undefined && noteMetaIsInDir(note)}>
                  <div class="!ml-0"
                    classList={{
                      ['text-surface-500-400-token']: note.id !== notesState.selectedNote,
                    }}
                  >
                    <span class="flex flex-row items-center gap-1">
                      <Icon path={folder} class="h-4 w-4" />
                      <sub class="flex-1">{noteMetaDirPath(note).join(sep)}</sub>
                    </span>
                  </div>
                </Show>
              </a>
            </li>
          }</For>
        </ul>
      </div>
    </Show>
  )
}
