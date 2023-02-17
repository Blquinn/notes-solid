import { Accessor, For, JSX, Show, useContext } from 'solid-js';
import { Context, TreeProvider, TTree, TTreeNode } from './treeContext';
import { Icon } from 'solid-heroicons';
import { chevronRight } from 'solid-heroicons/solid';

import styles from './TreeView.module.scss';

export interface TreeViewProps<T> {
  index?: number[]
  context: Context<T>
  tree?: TTree<T>
  listClasses: string
  cellContent: (node: TTreeNode<T>) => JSX.Element
  onNodeSelected?: (node: TTreeNode<T>) => void;
}

export default function TreeView<T>(props: TreeViewProps<T>) {
  const [state, { select, expand }] = useContext(props.context);

  const tree = props.tree ?? state.tree;
  const index = props.index ?? [];

  const showChildren = (node: TTreeNode<T>) => state.expandedNodes[node.id] ?? false;

  const onLeafSelected = (node: TTreeNode<T>) => {
    props.onNodeSelected?.(node);
    select(node.id);
  }

  const onBranchClicked = (node: TTreeNode<T>) => {
    expand(node.id);
  }

  const leafNode = (node: TTreeNode<T>) => (
    <span
      class={styles.inner}
      onClick={() => onLeafSelected(node)}
      classList={{ ['bg-primary-active-token']: node.id == state.selectedNode }}
    >
      <span class={styles.noArrow} />
      <span class={styles.label}>{props.cellContent(node)}</span>
    </span>
  );

  const branchNode = (node: TTreeNode<T>, idx: Accessor<number>) => (
    <>
      <span class={styles.inner} onClick={() => onBranchClicked(node)} >
        <span class={styles.arrow}
          classList={{ [styles.arrowDown]: showChildren(node) }}>
          <Icon path={chevronRight}></Icon>
        </span>
        <span class={styles.label}>{props.cellContent(node)}</span>
      </span>
      <Show when={showChildren(node)}>
        <TreeView {...props} tree={node.children!} index={[...index, idx()]} />
      </Show>
    </>
  );

  return (
    <ul class={styles.treeView + ' ' + props.listClasses}>
      <For each={tree}>{(node, i) =>
        <li class={styles.pointer}>
          {node.children ? branchNode(node, i) : leafNode(node)}
        </li>
      }</For>
    </ul>
  );
}
