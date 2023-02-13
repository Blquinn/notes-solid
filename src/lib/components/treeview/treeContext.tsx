import { FragmentProps } from "solid-headless/dist/types/utils/Fragment";
import { createContext  } from "solid-js";
import { createStore } from "solid-js/store";


export type TTreeNode = {
  id: string;
  label: string;
  children?: TTreeNode[];
}

export type TTree = TTreeNode[];

export type TreeState = {
  tree: TTree;
  expandedNodes: {[key: string]: boolean};
  selectedNode?: string; // The selected node path.
};

export interface TreeProviderProps extends FragmentProps {
  tree: TTree;
}

type TTreeContext = [
  TreeState,
  {
    select(id: string): void;
    expand(id: string): void;
    deleteNode({
      parentId,
      childId,
    }: {
      parentId: string;
      childId: string;
    }): void;
    createNode(id: string, label: string): void;
  }
];

// const deleteMany = (tree: TTree, ids: string[]) => {
//   ids.forEach((id) => delete tree[id]);
// };

export const TreeContext = createContext<TTreeContext>([
  { tree: [], expandedNodes: {} },
  {} as any,
]);

export function TreeProvider(props: TreeProviderProps) {
  const initialState: TreeState = {
    tree: props.tree,
    expandedNodes: {},
  };

  const [state, setState] = createStore(initialState);

  const store: TTreeContext = [
    state,
    {
      // increment(id) {
      //   setState("tree", id, "counter", (value) => value + 1);
      // },
      // decrement(id) {
      //   setState("tree", id, "counter", (value) => value - 1);
      // },
      select(id) {
        setState("selectedNode", id);
      },
      expand(id) {
        setState('expandedNodes', id, (expanded) => !expanded);
      },
      createNode(id, label: string) {
        // TODO: Implement
        // setState(
        //   produce((s) => {
        //     // create Node
        //     // s.nextId = newId;
        //     s.tree[id] = { id: id, label: label, childIds: [] };
        //     // add Child
        //     s.tree[id].childIds.push(id);
        //   })
        // );
      },
      deleteNode({ parentId, childId }) {
        // TODO: Implement
        // setState(
        //   produce((s) => {
        //     // remove child
        //     const parentNode = s.tree[parentId];
        //     const foundChildIdx = parentNode.childIds.findIndex(
        //       (id) => id === childId
        //     )!;
        //     parentNode.childIds.splice(foundChildIdx, 1);

        //     // delete Node and all it's descendants
        //     const ids = getAllDescendants(s.tree, childId);

        //     deleteMany(s.tree, ids);
        //   })
        // );
      },
    },
  ];

  return (
    <TreeContext.Provider value={store}>{props.children}</TreeContext.Provider>
  );
}
