import { Accessor, For, Show, useContext } from 'solid-js';
import { Context, TreeProvider, TTree, TTreeNode } from './treeContext';
import { Icon } from 'solid-heroicons';
import { chevronRight } from 'solid-heroicons/solid';

import './TreeView.css';

interface NodeProps<T> {
  index: number[]
  context: Context<T>
  tree: TTree<T>
  listClasses: string
}

function Node<T>(props: NodeProps<T>) {
  const [state, { select, update, expand }] = useContext(props.context);

  const showChildren = (node: TTreeNode<T>) => state.expandedNodes[node.path] ?? false;

  const onSelect = (node: TTreeNode<T>, idx: Accessor<number>) => {
    // console.log(dfs(state.tree, node.path)!.path);
    select(node.path);
    // const i = [...props.index, idx()];
    // update(i, (n) => {
    //   return {...n, path: 'foo'}
    // });
  }

  const onBranchClicked = (node: TTreeNode<T>) => {
    console.info(node);
    expand(node.path);
  }

  const leafNode = (node: TTreeNode<T>, idx: Accessor<number>) => (
    <span 
      class="inner"
      onClick={() => onSelect(node, idx)}
      classList={{ ['bg-primary-active-token']: node.path == state.selectedNode }}
    >
      <span class="no-arrow" />
      <span class="label">{node.label}</span>
    </span>
  );

  const branchNode = (node: TTreeNode<T>, idx: Accessor<number>) => (
    <>
      <span class="inner" onClick={() => onBranchClicked(node)} >
        <span class="arrow"
          classList={{ ['arrowDown']: showChildren(node) }}>
          <Icon path={chevronRight}></Icon>
        </span>
        <span class="label">{node.label}</span>
      </span>
      <Show when={showChildren(node)}>
        <Node tree={node.children!} listClasses={props.listClasses} context={props.context} index={[...props.index, idx()]} />
      </Show>
    </>
  );

  return (
    <ul class={'tree-view ' + props.listClasses}>
      <For each={props.tree}>{(node, i) =>
        <li class="pointer">
          {node.children ? branchNode(node, i) : leafNode(node, i)}
        </li>
      }</For>
    </ul>
  );
}

export interface TreeViewProps<T> {
  classes: string
  context: Context<T>
}

export default function TreeView<T>(props: TreeViewProps<T>) {
  const tree = props.context.defaultValue[0].tree;
  return (
    <TreeProvider tree={tree} context={props.context}>
      <Node tree={tree} listClasses={props.classes} context={props.context} index={[]} />
    </TreeProvider>
  );
}
