import { FragmentProps } from "solid-headless/dist/types/utils/Fragment";
import { createContext, JSX } from "solid-js";
import { createStore, SetStoreFunction } from "solid-js/store";
import Modal from "./Modal";

type ModalState = {
  content?: JSX.Element
}

class ModalController {
  private _state: ModalState;
  public get state(): ModalState {
    return this._state;
  }

  private setState: SetStoreFunction<ModalState>;

  constructor() {
    const initialState: ModalState = {};
    [this._state, this.setState] = createStore(initialState);
  }
  
  setContent(content?: JSX.Element) {
    this.setState("content", content);
  }
}

export const ModalContext = createContext<ModalController>(new ModalController());

export function ModalContextProvider(props: FragmentProps) {
  const controller = new ModalController();

  return (
    <ModalContext.Provider value={controller}>
      <Modal 
        open={() => !!controller.state.content}
        onClose={() => controller.setContent(undefined)}
      >
        {controller.state.content}
      </Modal>
      {props.children}
    </ModalContext.Provider>
  )
}
