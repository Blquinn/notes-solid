import { Icon } from "solid-heroicons";
import { cog } from "solid-heroicons/solid";
import IconButton from "./lib/skeleton/components/IconButton";

export interface SettingsButtonProps {
  onClick: () => void
}

export default function SettingsButton(props: SettingsButtonProps) {
  return (
    <IconButton onClick={props.onClick}>
      <Icon path={cog} />
    </IconButton>
  );
}
