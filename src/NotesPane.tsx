import { TTreeNode } from "./lib/components/treeview/treeContext";
import TreeView from "./lib/components/treeview/TreeView";
import { NoteMeta, NoteTreeContext } from "./state";

export default function NotesPane() {
  const treeCellContent = (node: TTreeNode<NoteMeta>) => node.label;

  return (
    <div class="side-bar h-full bg-surface-100-800-token">
      <TreeView 
        listClasses="bg-surface-100-800-token" 
        context={NoteTreeContext} 
        cellContent={treeCellContent}
      />
    </div>
  );
}
