import { Accessor, For, JSX, Show, useContext } from 'solid-js';
import { Context, TTree, TTreeNode } from './treeContext';
import { Icon } from 'solid-heroicons';
import { chevronRight } from 'solid-heroicons/solid';

import styles from './TreeView.module.scss';

export interface TreeViewProps<T> {
  index?: number[]
  context: Context<T>
  tree?: Accessor<TTree<T>>
  listClasses: string
  cellContent: (node: TTreeNode<T>) => JSX.Element
  onNodeSelected?: (node: TTreeNode<T>) => void;
}

export default function TreeView<T>(props: TreeViewProps<T>) {
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

  return (
    <ul class={styles.treeView + ' ' + props.listClasses}>
      <For each={tree()}>{(node, i) =>
        <li class="cursor-pointer">
          <span class="p-2 gap-1 flex flex-1"
            classList={{ ['bg-primary-active-token']: node.id == state.selectedNode }}
          >
            {(node.children && node.children.length > 0) ? (
              <span class="w-4 h-4 self-center inline-block"
                onClick={() => onBranchClicked(node)}
                classList={{ ['rotate-90']: showChildren(node) }}>
                <Icon path={chevronRight}></Icon>
              </span>
            ) : (
              <span class="ml-4"></span>
            )}

            <span class="flex-1 no-wrap text-ellipsis overflow-hidden align-middle"
              onClick={() => onLeafSelected(node)}
              onDblClick={() => onBranchClicked(node)}
            >{props.cellContent(node)}</span>
          </span>
          <Show when={showChildren(node)}>
            <TreeView {...props} tree={() => node.children!} index={[...index, i()]} />
          </Show>
        </li>
      }</For>
    </ul>
  );
}
