import { FragmentProps } from "solid-headless/dist/types/utils/Fragment";
import { Context as SolidContext, createContext } from "solid-js";
import { createStore } from "solid-js/store";

export type TreePath = string;
export type TreeIndex = number[];

export type TTreeNode<T> = {
  path: string;
  label: string;
  data?: T;
  children?: TTreeNode<T>[];
}

export type TTree<T> = TTreeNode<T>[];

export type TreeState<T> = {
  tree: TTree<T>;
  expandedNodes: { [key: TreePath]: boolean };
  selectedNode?: TreePath;
};

export interface TreeProviderProps<T> extends FragmentProps {
  context: Context<T>;
  tree: TTree<T>;
}

type TTreeContext<T> = [
  TreeState<T>,
  {
    select(path: TreePath): void;
    expand(path: TreePath): void;
    update(index: TreeIndex, fn: (existing: T) => T): void;
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
        setState('expandedNodes', path, (expanded) => !expanded);
      },
      update(index, fn) {
        (setState as any)('tree', ...intersperse(index, 'children'), fn)
      },
    },
  ];

  return (
    <props.context.Provider value={store}>{props.children}</props.context.Provider>
  );
}
