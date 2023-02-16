import { Context, TTreeNode } from "./lib/components/treeview/treeContext";
import TreeView from "./lib/components/treeview/TreeView";
import { Note } from "./state";

export interface NotesPaneProps {
  noteTreeContext: Context<Note>
}

export default function NotesPane(props: NotesPaneProps) {
  const treeCellContent = (node: TTreeNode<Note>) => (<span class="label">{node.label}</span>);

  return (
    <div class="side-bar h-full bg-surface-100-800-token">
      <TreeView 
        listClasses="bg-surface-100-800-token" 
        context={props.noteTreeContext} 
        cellContent={treeCellContent}
      />
    </div>
  );
}
