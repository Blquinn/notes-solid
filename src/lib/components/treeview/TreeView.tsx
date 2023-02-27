import { Accessor, For, JSX, Show, useContext } from 'solid-js';
import { arrayEquals, Context, TTree, TTreeNode } from './treeContext';
import { Icon } from 'solid-heroicons';
import { chevronRight } from 'solid-heroicons/solid';
import * as p from 'path-browserify';

import styles from './TreeView.module.scss';

export interface TreeViewProps<T> {
  index?: number[]
  context: Context<T>
  basePath?: string[]
  tree?: Accessor<TTree<T>>
  listClasses: string
  cellContent: (node: TTreeNode<T>, path: string[]) => JSX.Element
  onNodeSelected?: (node: TTreeNode<T>) => void;
}

export default function TreeView<T>(props: TreeViewProps<T>) {
  const controller = useContext(props.context);

  const tree = props.tree ?? (() => controller.state.tree);
  const index = props.index ?? [];

  const showChildren = (path: string[]) => controller.state.expandedNodes[p.join(...path)] ?? false;

  const onLeafSelected = (node: TTreeNode<T>, path: string[]) => {
    props.onNodeSelected?.(node);
    controller.select(path);
  }

  const onBranchClicked = (path: string[]) => {
    controller.expand(path);
  }

  return (
    <ul class={styles.treeView + ' ' + props.listClasses}>
      <For each={tree()}>{(node, i) => {
        const nodePath = [...(props.basePath ?? []), node.id];

        return (
          <li class="cursor-pointer">
            <span class="p-2 gap-1 flex flex-1"
              classList={{ ['bg-primary-active-token']: controller.state.selectedNode && arrayEquals(nodePath, controller.state.selectedNode) }}
            >
              {(node.children && node.children.length > 0) ? (
                <span class="w-4 h-4 self-center inline-block"
                  onClick={() => onBranchClicked(nodePath)}
                  classList={{ ['rotate-90']: showChildren(nodePath) }}>
                  <Icon path={chevronRight}></Icon>
                </span>
              ) : (
                <span class="ml-4"></span>
              )}

              <span class="flex-1 no-wrap text-ellipsis overflow-hidden align-middle"
                onClick={() => onLeafSelected(node, nodePath)}
                onDblClick={() => onBranchClicked(nodePath)}
              >{props.cellContent(node, nodePath)}</span>
            </span>
            <Show when={showChildren(nodePath)}>
              <TreeView {...props} tree={() => node.children!} index={[...index, i()]} basePath={nodePath} />
            </Show>
          </li>
        );
      }}</For>
    </ul>
  );
}
