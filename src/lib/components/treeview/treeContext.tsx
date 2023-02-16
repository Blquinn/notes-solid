import { FragmentProps } from "solid-headless/dist/types/utils/Fragment";
import { Context as SolidContext, createContext } from "solid-js";
import { createStore } from "solid-js/store";

// export type TreePath = string;
export type TreeIndex = number[];

export type TTreeNode<T> = {
  id: string;
  label: string;
  data?: T;
  children?: TTreeNode<T>[];
}

export type TTree<T> = TTreeNode<T>[];

export type TreeState<T> = {
  tree: TTree<T>;
  expandedNodes: { [key: string]: boolean }; // ID -> expanded
  selectedNode?: string; // ID of selected node
};

export interface TreeProviderProps<T> extends FragmentProps {
  context: Context<T>;
  tree: TTree<T>;
}

type TTreeContext<T> = [
  TreeState<T>,
  {
    select(id: string): void;
    expand(id: string): void;
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

// function nodeByIndex<T>(tree: TTree<T>, idx: TreeIndex): TTreeNode<T> | undefined {
//   if (idx.length < 1) {
//     return undefined;
//   }

//   const node = tree[idx[0]];
//   if (idx.length == 1) {
//     return node;
//   }

//   if (!node.children) {
//     return undefined;
//   }

//   return nodeByIndex(node.children, idx.slice(1));
// }

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
      update(index, fn) {
        (setState as any)('tree', ...intersperse(index, 'children'), fn)
      },
    },
  ];

  return (
    <props.context.Provider value={store}>{props.children}</props.context.Provider>
  );
}
