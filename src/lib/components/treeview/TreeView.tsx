import { For, Show, useContext } from 'solid-js';
import { TreeContext, TreeProvider, TTree, TTreeNode } from './treeContext';
import { Transition, TransitionGroup } from 'solid-transition-group';

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
}

function Node(props: NodeProps) {
  const [state, { createNode, select, expand, deleteNode }] = useContext(TreeContext);

  const showChildren = (node: TTreeNode) => state.expandedNodes[node.id] ?? false;

  return (
      <ul>
        <For each={props.tree}>{(node, i) =>
          <li class="pointer">
            <Show when={node.children} fallback={
              <span class="inner"
                onClick={() => select(node.id)}
                classList={{ ['bg-primary-active-token']: node.id == state.selectedNode }}>
                <span class="no-arrow" />
                <span class="label">{node.label}</span>
              </span>
            }>
              <span class="inner" onClick={() => expand(node.id)} >
                <span class="arrow"
                  classList={{ ['arrowDown']: showChildren(node) }}>
                  {/* <ChevronRight class="icon" height={16} width={16} /> */}
                  {'>'}
                </span>
                <span class="label">{node.label}</span>
              </span>
              <Show when={showChildren(node)}>
                <Node tree={node.children!} />
              </Show>
            </Show>
          </li>
        }</For>
      </ul>
  );
}

export default function TreeView() {
  return (
    <TreeProvider tree={tree}>
      <Node tree={tree} />
    </TreeProvider>
  );
}