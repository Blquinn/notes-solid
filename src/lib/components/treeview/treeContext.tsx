import { FragmentProps } from "solid-headless/dist/types/utils/Fragment";
import { Context as SolidContext, createContext, useContext } from "solid-js";
import { createStore, produce, SetStoreFunction } from "solid-js/store";
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
  if (level > path.length - 1) return undefined;

  for (let node of tree) {
    if (node.id == path[level]) {
      if (level == path.length - 1)
        return node;
      if (node.children)
        return dfs(node.children, path, level + 1);
    }
  }

  return undefined;
}

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

export type Context<T> = SolidContext<TreeViewController<T>>;

export function createTreeContext<T>(initialTree: TreeState<T>): Context<T> {
  return createContext<TreeViewController<T>>(new TreeViewController(initialTree));
}

function* intersperse<T, R>(a: Array<T>, delim: R): Generator<T | R> {
  let first = true;
  for (const x of a) {
    if (!first) yield delim;
    first = false;
    yield x;
  }
}

export class TreeViewController<T> {
  private _state: TreeState<T>;
  public get state(): TreeState<T> {
    return this._state;
  }

  private setState: SetStoreFunction<TreeState<T>>;

  constructor(initialState: TreeState<T>) {
    [this._state, this.setState] = createStore(initialState);
  }

  select(path?: string[]) {
    this.setState("selectedNode", path);
  }

  expand(path: string[]) {
    this.setState('expandedNodes', p.join(...path), (expanded) => !expanded);
  }

  updateTreeNode(index: TreeIndex, fn: (existing: T) => T) {
    (this.setState as any)('tree', ...intersperse(index, 'children'), fn)
  }

  replaceTree(newTree: TTree<T>) {
    this.setState('tree', newTree);
  }

  addNode(parentIndex: TreeIndex, node: TTreeNode<T>) {
    this.setState(produce((s) => {
      if (parentIndex.length == 0) {
        s.tree.push(node);
      } else {
        const parent = getNodeAtIndex(s.tree, parentIndex);
        parent.children ??= [];
        parent.children.push(node);
      }
    }))
  }
}

export function TreeProvider<T>(props: TreeProviderProps<T>) {
  return (
    <props.context.Provider value={useContext(props.context)}>{props.children}</props.context.Provider>
  );
}
