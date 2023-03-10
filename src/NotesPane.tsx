import { Accessor, useContext } from "solid-js";
import NoteList from "./lib/components/notelist/NoteList";
import { arrayEquals, rootNode, TTreeNode } from "./lib/components/treeview/treeContext";
import TreeView from "./lib/components/treeview/TreeView";
import { DirectoryTreeContext, DirectoryMeta } from "./state";

export interface NotesPaneProps {
  showDirectoryTree: Accessor<boolean>
}

export default function NotesPane(props: NotesPaneProps) {
  const treeCellContent = (node: TTreeNode<DirectoryMeta>, path: string[]) => node.label;

  const dirTree = useContext(DirectoryTreeContext);

  return (
    <div class="side-bar h-full flex flex-row justify-stretch">
      <div 
        class="w-64 bg-surface-200-700-token overflow-y-auto hide-scrollbar ease-in-out" 
        style="transition: margin 150ms;"
        classList={{
          '-ml-64': !props.showDirectoryTree(),
        }}
        data-simplebar
      >
        <button
          class="w-full p-2 pl-7 text-left nav-list-item"
          classList={{
            ['bg-primary-active-token']: dirTree.state.selectedNode === undefined,
          }}
          onClick={() => dirTree.select(undefined)}>All Notes</button>

        <button
          class="w-full p-2 pl-7 text-left nav-list-item"
          classList={{
            ['bg-primary-active-token']: arrayEquals(dirTree.state.selectedNode, rootNode),
          }}
          onClick={() => dirTree.select(rootNode)}>Notes</button>

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
