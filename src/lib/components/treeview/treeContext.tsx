import { sep } from "@tauri-apps/api/path";
import { FragmentProps } from "solid-headless/dist/types/utils/Fragment";
import { Context as SolidContext, createContext } from "solid-js";
import { createStore, produce } from "solid-js/store";

export type TreeIndex = number[];

export type TTreeNode<T> = {
  id: string;
  label: string;
  data?: T;
  children?: TTreeNode<T>[];
}

export type TTree<T> = TTreeNode<T>[];

// Root represents the first 
export const rootNode = '';

export type TreeState<T> = {
  tree: TTree<T>;
  expandedNodes: { [key: string]: boolean }; // ID -> expanded
  selectedNode?: string; // ID of selected node
};

export interface TreeProviderProps<T> extends FragmentProps {
  context: Context<T>;
  tree: TTree<T>;
}

function dfs<T>(tree: TTree<T>, id: string, path: string[]): TTreeNode<T> | undefined {
  for (let node of tree) {
    path.push(node.label);
    if (node.id == id) {
      return node;
    }
    if (node.children) {
      const n = dfs(node.children, id, path)
      if (n) {
        return n;
      }
    }
    path.pop();
  }

  return undefined;
}

export type NodeSelection<T> = {
  path: string
  node: TTreeNode<T>
}

export function getSelectedNode<T>(state: TreeState<T>): NodeSelection<T> | undefined {
  if (!state.selectedNode) {
    return undefined;
  }

  const path: string[] = [];
  const node = dfs(state.tree, state.selectedNode, path);
  if (!node) {
    return undefined;
  }

  return {
    node,
    path: path.join(sep),
  }
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
    select(id?: string): void;
    expand(id: string): void;
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
      select(id) {
        setState("selectedNode", id);
      },
      expand(id) {
        setState('expandedNodes', id, (expanded) => !expanded);
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
