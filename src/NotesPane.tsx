import { useContext } from "solid-js";
import NoteList from "./lib/components/notelist/NoteList";
import { TTreeNode } from "./lib/components/treeview/treeContext";
import TreeView from "./lib/components/treeview/TreeView";
import { DirectoryTreeContext, DirectoryMeta } from "./state";

export default function NotesPane() {
  const treeCellContent = (node: TTreeNode<DirectoryMeta>) => node.label;

  const [dirTree, store] = useContext(DirectoryTreeContext);

  return (
    <div class="side-bar h-full flex flex-row justify-stretch">
      <div class="w-64 bg-surface-200-700-token">
        <button
          class="w-full p-2 pl-7 text-left nav-list-item"
          classList={{
            ['bg-primary-active-token']: !dirTree.selectedNode,
          }}
          onClick={() => store.select(undefined)}>All Notes</button>

        <TreeView 
          listClasses="bg-surface-200-700-token" 
          context={DirectoryTreeContext} 
          cellContent={treeCellContent}
        />
      </div>
      <div class="w-72 bg-surface-100-800-token flex flex-col justify-stretch">
        <NoteList />
      </div>
    </div>
  );
}
