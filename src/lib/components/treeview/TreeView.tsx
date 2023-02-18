import { Accessor, createSignal, For, JSX, on, Show, useContext } from 'solid-js';
import { Context, TTree, TTreeNode } from './treeContext';
import { Icon } from 'solid-heroicons';
import { chevronRight } from 'solid-heroicons/solid';

import {
  DragDropProvider,
  DragDropSensors,
  useDragDropContext,
  createDraggable,
  createDroppable,
} from "@thisbeyond/solid-dnd";

import styles from './TreeView.module.scss';
import { createSign } from 'crypto';

export interface TreeViewProps<T> {
  index?: number[]
  context: Context<T>
  tree?: Accessor<TTree<T>>
  listClasses: string
  cellContent: (node: TTreeNode<T>) => JSX.Element
  onNodeSelected?: (node: TTreeNode<T>) => void;
}

const dropClass = 'bg-tertiary-500';

export function Node<T>(props: TreeViewProps<T>) {
  const [state, { select, expand }] = useContext(props.context);

  const tree = props.tree ?? (() => state.tree);
  const index = props.index ?? [];

  const showChildren = (node: TTreeNode<T>) => state.expandedNodes[node.id] ?? false;

  const onLeafSelected = (node: TTreeNode<T>) => {
    props.onNodeSelected?.(node);
    select(node.id);
  }

  const onBranchClicked = (node: TTreeNode<T>) => {
    expand(node.id);
  }

  const leafNode = (node: TTreeNode<T>) => {
    const draggable = createDraggable(node.id);
    return (
      <span
        use:draggable
        class={styles.inner}
        onClick={() => onLeafSelected(node)}
        classList={{ ['bg-primary-active-token']: node.id == state.selectedNode }}
      >
        <span class={styles.noArrow} />
        <span class={styles.label}>{props.cellContent(node)}</span>
      </span>
    );
  }

  const branchNode = (node: TTreeNode<T>, idx: Accessor<number>) => {
    const droppable = createDroppable(node.id);
    return (
      <>
        <span use:droppable class={styles.inner}
          classList={{
            [dropClass]: droppable.isActiveDroppable,
          }}
          onClick={() => onBranchClicked(node)} >
          <span class={styles.arrow}
            classList={{ [styles.arrowDown]: showChildren(node) }}>
            <Icon path={chevronRight}></Icon>
          </span>
          <span class={styles.label}>{props.cellContent(node)}</span>
        </span>
        <Show when={showChildren(node)}>
          <Node {...props} tree={() => node.children!} index={[...index, idx()]} />
        </Show>
      </>
    );
  }

  return (
    <ul class={styles.treeView + ' ' + props.listClasses}>
      <For each={tree()}>{(node, i) =>
        <li class={styles.pointer}>
          {node.children ? branchNode(node, i) : leafNode(node)}
        </li>
      }</For>
    </ul>
  );
}

export default function TreeView<T>(props: TreeViewProps<T>) {
  const root = () => {
    const droppable = createDroppable('/');
    return (
      <div class="h-full" use:droppable
        classList={{
          [dropClass]: droppable.isActiveDroppable,
        }}>
        <Node {...props} />
      </div>
    );
  }
  
  return (
    <DragDropProvider>
      <DragDropSensors>
        {root()}
      </DragDropSensors>
    </DragDropProvider>
  );
}
