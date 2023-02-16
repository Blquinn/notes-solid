import { Accessor, For, JSX, Show, useContext } from 'solid-js';
import { Context, TreeProvider, TTree, TTreeNode } from './treeContext';
import { Icon } from 'solid-heroicons';
import { chevronRight } from 'solid-heroicons/solid';

import './TreeView.css';

interface NodeProps<T> {
  index: number[]
  context: Context<T>
  tree: TTree<T>
  listClasses: string
  cellContent: (node: TTreeNode<T>) => JSX.Element
}

function Node<T>(props: NodeProps<T>) {
  const [state, { select, update, expand }] = useContext(props.context);

  const showChildren = (node: TTreeNode<T>) => state.expandedNodes[node.id] ?? false;

  const onSelect = (node: TTreeNode<T>) => {
    select(node.id);
  }

  const onBranchClicked = (node: TTreeNode<T>) => {
    expand(node.id);
  }

  const leafNode = (node: TTreeNode<T>) => (
    <span
      class="inner"
      onClick={() => onSelect(node)}
      classList={{ ['bg-primary-active-token']: node.id == state.selectedNode }}
    >
      <span class="no-arrow" />
      {/* <span class="label">{node.label}</span> */}
      {props.cellContent(node)}
    </span>
  );

  const branchNode = (node: TTreeNode<T>, idx: Accessor<number>) => (
    <>
      <span class="inner" onClick={() => onBranchClicked(node)} >
        <span class="arrow"
          classList={{ ['arrowDown']: showChildren(node) }}>
          <Icon path={chevronRight}></Icon>
        </span>
        {/* <span class="label">{node.label}</span> */}
        {props.cellContent(node)}
      </span>
      <Show when={showChildren(node)}>
        <Node tree={node.children!} listClasses={props.listClasses} context={props.context} index={[...props.index, idx()]} cellContent={props.cellContent} />
      </Show>
    </>
  );

  return (
    <ul class={'tree-view ' + props.listClasses}>
      <For each={props.tree}>{(node, i) =>
        <li class="pointer">
          {node.children ? branchNode(node, i) : leafNode(node)}
        </li>
      }</For>
    </ul>
  );
}

export interface TreeViewProps<T> {
  classes: string
  context: Context<T>
  cellContent: (node: TTreeNode<T>) => JSX.Element
}

export default function TreeView<T>(props: TreeViewProps<T>) {
  const tree = props.context.defaultValue[0].tree;
  return (
    <TreeProvider tree={tree} context={props.context}>
      <Node tree={tree} listClasses={props.classes} context={props.context} index={[]} cellContent={props.cellContent} />
    </TreeProvider>
  );
}
