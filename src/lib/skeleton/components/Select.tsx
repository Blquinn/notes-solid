import { Accessor, For } from "solid-js";

export type KeyVal = {
  key: string
  value: string
}

export interface SelectProps {
  values: KeyVal[];
  selected: Accessor<string>;
  onSelect: (key: string) => void;
}

export default function Select(props: SelectProps) {
  return (
    <div class="flex justify-center">
      <select class="select pr-8" aria-label="Default select example" onChange={(e) => props.onSelect(e.target.value)}>
        <For each={props.values}>{(kv, i) =>
          <option value={kv.key} selected={kv.key == props.selected()}>{kv.value}</option>
        }</For>
      </select>
    </div>
  );
}
