import { FragmentProps } from "solid-headless/dist/types/utils/Fragment";
import { Context as SolidContext, createContext } from "solid-js";
import { createStore, produce } from "solid-js/store";
import * as p from 'path-browserify';

export type TreeIndex = number[];

export type TTreeNode<T> = {
  id: string;
  label: string;
  data?: T;
  children?: TTreeNode<T>[];
}

export type TTree<T> = TTreeNode<T>[];

// Root represents the first 
export const rootNode = [];

export type TreeState<T> = {
  tree: TTree<T>;
  expandedNodes: { [key: string]: boolean }; // ID -> expanded
  selectedNode?: string[]; // ID of selected node
};

export interface TreeProviderProps<T> extends FragmentProps {
  context: Context<T>;
  tree: TTree<T>;
}

function dfs<T>(tree: TTree<T>, path: string[], level: number = 0): TTreeNode<T> | undefined {
  if (level > path.length-1) return undefined;

  for (let node of tree) {
    if (node.id == path[level]) {
      if (level == path.length-1)
        return node;
      if (node.children)
        return dfs(node.children, path, level + 1);
    }
  }

  return undefined;
}

// export type NodeSelection<T> = {
//   path: string[]
//   node: TTreeNode<T>
// }

export function getSelectedNode<T>(state: TreeState<T>): TTreeNode<T> | undefined {
  if (!state.selectedNode) {
    return undefined;
  }

  const node = dfs(state.tree, state.selectedNode);
  if (!node) {
    return undefined;
  }

  return node
}

export function arrayEquals<T>(arr1?: T[], arr2?: T[]): boolean {
  if (arr1 === undefined && arr2 === undefined) return true;
  if (arr1 === undefined || arr2 === undefined) return false;
  if (arr1.length !== arr2.length) return false;
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

function getNodeAtIndex<T>(tree: TTree<T>, index: TreeIndex): TTreeNode<T> {
  let node = tree[index[0]];
  for (let i of index.slice(1)) {
    node = node.children![i];
  }
  return node;
}

type TTreeContext<T> = [
  TreeState<T>,
  {
    select(path?: string[]): void;
    expand(path: string[]): void;
    updateTreeNode(index: TreeIndex, fn: (existing: T) => T): void;
    replaceTree(tree: TTree<T>): void;
    addNode(parentIndex: TreeIndex, node: TTreeNode<T>): void;
  }
];

export type Context<T> = SolidContext<TTreeContext<T>>

export function createTreeContext<T>(initialTree?: TreeState<T>): Context<T> {
  return createContext<TTreeContext<T>>([
    initialTree ?? { tree: [], expandedNodes: {} },
    {} as any,
  ]);
}

function* intersperse<T, R>(a: Array<T>, delim: R): Generator<T | R> {
  let first = true;
  for (const x of a) {
    if (!first) yield delim;
    first = false;
    yield x;
  }
}

export function TreeProvider<T>(props: TreeProviderProps<T>) {
  const initialState: TreeState<T> = {
    tree: props.tree,
    expandedNodes: {},
  };

  const [state, setState] = createStore(initialState);

  const store: TTreeContext<T> = [
    state,
    {
      select(path) {
        setState("selectedNode", path);
      },
      expand(path) {
        setState('expandedNodes', p.join(...path), (expanded) => !expanded);
      },
      updateTreeNode(index, fn) {
        (setState as any)('tree', ...intersperse(index, 'children'), fn)
      },
      replaceTree(newTree) {
        setState('tree', newTree);
      },
      addNode(parentIndex, node) {
        setState(produce((s) => {
          if (parentIndex.length == 0) {
            s.tree.push(node);
          } else {
            const parent = getNodeAtIndex(s.tree, parentIndex);
            parent.children ??= [];
            parent.children.push(node);
          }
        }))
      },
    },
  ];

  return (
    <props.context.Provider value={store}>{props.children}</props.context.Provider>
  );
}
