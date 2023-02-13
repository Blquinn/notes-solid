import { For, Show, useContext } from 'solid-js';
import { TreeContext, TreeProvider, TTree, TTreeNode } from './treeContext';
import { Icon } from 'solid-heroicons';
import { chevronRight } from 'solid-heroicons/solid';

import './TreeView.css';

const tree: TTree = [
  {
    id: 'A Note',
    label: "A Note",
  },
  {
    id: 'Another Note That has a Really Long Title Which Just Never Seems to End and It Goes on And on.',
    label: "Another Note That has a Really Long Title Which Just Never Seems to End and It Goes on And on.",
  },
  {
    id: "A Notebook",
    label: "A Notebook",
    children: [
      {
        id: 'A Notebook/A Child Notebook',
        label: "A Child Notebook",
        children: [
          { id: 'A Notebook/A Child Notebook/A Note in A Child Notebook', label: "A Note in A Child Notebook" },
          {
            id: 'A Notebook/A Child Notebook/Yet Another Child',
            label: "Yet Another Child",
            children: [
              { id: 'A Notebook/A Child Notebook/Yet Another Child/Foo', label: "Foo" },
              { id: 'A Notebook/A Child Notebook/Yet Another Child/Bar', label: "Bar" },
              { id: 'A Notebook/A Child Notebook/Yet Another Child/Bin', label: "Bin" }
            ],
          },
          { id: 'A Notebook/A Child Notebook/Quux', label: "Quux" },
        ],
      },
      {
        id: 'A Notebook/Another Notebook',
        label: "Another Notebook",
        children: [
          { id: 'A Notebook/Another Notebook/Foo', label: "Foo" },
          { id: 'A Notebook/Another Notebook/Bar', label: "Bar" },
          { id: 'A Notebook/Another Notebook/Baz', label: "Baz" }
        ],
      },
    ],
  },
];

interface NodeProps {
  tree: TTree
  listClasses: string
}

function Node(props: NodeProps) {
  const [state, { select, expand }] = useContext(TreeContext);

  const showChildren = (node: TTreeNode) => state.expandedNodes[node.id] ?? false;

  const treeNode = (node: TTreeNode) => (
    <span class="inner"
      onClick={() => select(node.id)}
      classList={{ ['bg-primary-active-token']: node.id == state.selectedNode }}>
      <span class="no-arrow" />
      <span class="label">{node.label}</span>
    </span>
  );

  const branchNode = (node: TTreeNode) => (
    <>
      <span class="inner" onClick={() => expand(node.id)} >
        <span class="arrow"
          classList={{ ['arrowDown']: showChildren(node) }}>
          <Icon path={chevronRight}></Icon>
        </span>
        <span class="label">{node.label}</span>
      </span>
      <Show when={showChildren(node)}>
        <Node tree={node.children!} listClasses={props.listClasses} />
      </Show>
    </>
  );

  return (
    <ul class={props.listClasses}>
      <For each={props.tree}>{(node, i) =>
        <li class="pointer">
          {node.children ? branchNode(node) : treeNode(node)}
        </li>
      }</For>
    </ul>
  );
}

export interface TreeViewProps {
  classes: string
}

export default function TreeView(props: TreeViewProps) {
  return (
    <TreeProvider tree={tree}>
      <Node tree={tree} listClasses={props.classes} />
    </TreeProvider>
  );
}
