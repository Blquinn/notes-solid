import { FragmentProps } from "solid-headless/dist/types/utils/Fragment";
import { open } from '@tauri-apps/api/dialog';
import { homeDir } from "@tauri-apps/api/path";

export interface DirectoryButtonProps extends FragmentProps {
  class?: string
  buttonClass?: string
  disabled?: boolean
  name: string
  onAccept: (path: string | null) => void;
}

export default function DirectoryButton(props: DirectoryButtonProps) {
  const onClick = async () => {

    const selected = await open({
      directory: true,
      defaultPath: await homeDir(),
    });

    props.onAccept(selected as (string | null));
  }

  return (
    <div class={`file-button ${props.class ?? ''}`} data-testid="file-button">
      <button
        type="button"
        class={`file-button-btn btn ${props.buttonClass ?? ''}`}
        disabled={props.disabled ?? false}
        onClick={onClick}
      >
        {props.children ? (
          props.children
        ) : (
          <span>Select a Directory</span> 
        )}
      </button>
    </div>
  );
}
