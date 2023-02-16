import { FragmentProps } from "solid-headless/dist/types/utils/Fragment";
import { Accessor, createEffect } from "solid-js";

import styles from './IconButton.module.css';

export interface IconButtonProps extends FragmentProps {
  onClick: () => void;
  class?: string;
  toggled?: Accessor<boolean>;
  disabled?: Accessor<boolean>;
}

export default function IconButton(props: IconButtonProps) {
  const toggled = () => props.toggled?.() ?? false;
  const disabled = () => props.disabled?.() ?? false;

  return (
    <button 
      onClick={props.onClick} 
      class={`${styles.iconButton} btn w-6 h-6 min-w-6 min-h-6 m-0 p-0 flex justify-center align-center ${props.class ?? ''}`}
      disabled={disabled()}
      classList={{
        ['variant-soft-tertiary']: !disabled() && !toggled(),
        ['variant-filled-tertiary']: !disabled() && toggled(),
      }}
    >
      {props.children}
    </button>
  );
}
