import { FragmentProps } from "solid-headless/dist/types/utils/Fragment";
import { createContext, JSX } from "solid-js";
import { createStore } from "solid-js/store";
import Modal from "./Modal";

type ModalState = {
  content?: JSX.Element
}

type ModalContext = [
  ModalState,
  {
    // Undefined will hide the modal.
    setContent(content?: JSX.Element): void;
  }
];

export const ModalContext = createContext<ModalContext>([
  {},
  {} as any,
]);

export function ModalContextProvider(props: FragmentProps) {
  const initialState: ModalState = {};

  const [state, setState] = createStore(initialState);

  const store: ModalContext = [
    state,
    {
      setContent(content) {
        setState("content", content);
      },
    },
  ];

  return (
    <ModalContext.Provider value={store}>
      <Modal 
        open={() => !!state.content}
        onClose={() => store[1].setContent(undefined)}
      >
        {state.content}
      </Modal>
      {props.children}
    </ModalContext.Provider>
  )
}
