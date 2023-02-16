// import IconButton from "../../complib/IconButton.svelte";
// import FaIcon from "../../complib/FaIcon.svelte";
import type { Command, EditorState, NodeSelection } from "prosemirror-state";
import { setBlockType, toggleMark, wrapIn } from "prosemirror-commands";
import type { EditorView } from "prosemirror-view";
import { schema } from "./schema";
import type { Attrs, MarkType, NodeType } from "prosemirror-model";
import { wrapInList } from "prosemirror-schema-list";
import IconButton from "../../skeleton/components/IconButton";
import { createSignal, onCleanup } from "solid-js";
import { EventBus } from '@solid-primitives/event-bus';

import Bold from "@fortawesome/fontawesome-free/svgs/solid/bold.svg";
import Italic from "@fortawesome/fontawesome-free/svgs/solid/italic.svg";
import Underline from "@fortawesome/fontawesome-free/svgs/solid/underline.svg";
import Code from "@fortawesome/fontawesome-free/svgs/solid/code.svg";
import Strikethrough from "@fortawesome/fontawesome-free/svgs/solid/strikethrough.svg";
import ListUl from "@fortawesome/fontawesome-free/svgs/solid/list-ul.svg";
import ListOl from "@fortawesome/fontawesome-free/svgs/solid/list-ol.svg";
import QuoteLeft from "@fortawesome/fontawesome-free/svgs/solid/quote-left.svg";
import Paragraph from "@fortawesome/fontawesome-free/svgs/solid/paragraph.svg";
import Heading from "@fortawesome/fontawesome-free/svgs/solid/heading.svg";

type Format =
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "code"
  | "bullet_list"
  | "ordered_list"
  | "blockquote"
  | "code_block"
  | "heading"
  | "paragraph";

// TODO: Multiple heading levels.
type BlockTypes =
  | "paragraph"
  | "code_block"
  | "heading";

const marksToFormats: { [key: string]: Format } = {
  em: "italic",
  strong: "bold",
  strike: "strikethrough",
  u: "underline",
  code: "code",
};

const markActive = (state: EditorState, type: MarkType): boolean => {
  let { from, to, empty } = state.selection;
  if (empty)
    return !!type.isInSet(state.storedMarks || state.selection.$from.marks());
  else return state.doc.rangeHasMark(from, to, type);
}

const isBlockTypeActive = (
  state: EditorState,
  nodeType: NodeType,
  attrs?: Attrs
): boolean => {
  let { $from, to, node } = state.selection as NodeSelection;
  if (node) return node.hasMarkup(nodeType, attrs);
  return to <= $from.end() && $from.parent.hasMarkup(nodeType, attrs);
}

export interface EditorToolbarProps {
  view: EditorView
  viewUpdated: EventBus<void>
}

// TODO: Can make this more efficient.

function setsEqual<T>(s1: Set<T>, s2: Set<T>): boolean {
  if (s1.size != s2.size)
    return false;

  for (let val of s1) {
    if (!s2.has(val)) {
      return false;
    }
  }

  return true;
}

export default function EditorToolbar(props: EditorToolbarProps) {

  const [toggledButtons, setToggledButtons] = createSignal<Set<Format>>(new Set());
  const [diasbledButtons, setDisabledButtons] = createSignal<Set<Format>>(new Set());
  const [activeBlockType, setActiveBlockType] = createSignal<BlockTypes>('paragraph');

  function onEditorUpdated() {
    // TODO(perf): Can we ignore some updates? Or maybe just debounce.
    const newToggles = new Set<Format>();

    for (let markName in marksToFormats) {
      let markType = schema.marks[markName];
      if (markActive(props.view.state, markType)) {
        newToggles.add(marksToFormats[markName]);
      }
    }

    if (!setsEqual(toggledButtons(), newToggles)) {
      setToggledButtons(newToggles);
    }

    if (isBlockTypeActive(props.view.state, schema.nodes.paragraph)) {
      setActiveBlockType('paragraph')
    } else if (isBlockTypeActive(props.view.state, schema.nodes.heading)) {
      setActiveBlockType('heading')
    } else if (isBlockTypeActive(props.view.state, schema.nodes.code_block)) {
      setActiveBlockType('code_block')
    }

    const newDisabledButtons = new Set<Format>();
    if (!wrapIn(schema.nodes.blockquote)(props.view.state)) {
      newDisabledButtons.add("blockquote");
    }

    if (!setsEqual(diasbledButtons(), newDisabledButtons)) {
      setDisabledButtons(newDisabledButtons);
    }
  }

  const unsub = props.viewUpdated.listen(onEditorUpdated);
  onCleanup(unsub);

  const onClick = (button: Format, attrs?: Attrs) => {
    let command: Command;
    switch (button) {
      case "bold":
        command = toggleMark(schema.marks.strong);
        break;
      case "italic":
        command = toggleMark(schema.marks.em);
        break;
      case "underline":
        command = toggleMark(schema.marks.u);
        break;
      case "strikethrough":
        command = toggleMark(schema.marks.strike);
        break;
      case "code":
        command = toggleMark(schema.marks.code);
        break;
      case "bullet_list":
        command = wrapInList(schema.nodes.bullet_list);
        break;
      case "ordered_list":
        command = wrapInList(schema.nodes.ordered_list);
        break;
      case "blockquote":
        command = wrapIn(schema.nodes.blockquote);
        break;
      case "paragraph":
        command = setBlockType(schema.nodes.paragraph);
        break;
      case "code_block":
        command = setBlockType(schema.nodes.code_block);
        break;
      case "heading":
        command = setBlockType(schema.nodes.heading, attrs);
        break;
    }

    command(props.view.state, props.view.dispatch, props.view);
    props.view.focus();
  }

  const hasToggle = (name: Format) => () => toggledButtons().has(name);

  const menuSectionClasses = 'flex gap-3 items-center';
  const iconClasses = 'stroke-current fill-current';
  const divider = () => (<span class="w-0.5 h-full bg-primary-800" />);

  return (
    <div class="p-2 flex justify-start align-center gap-3 flex-flow-wrap bg-surface-100-800-token">
      <div class={menuSectionClasses}>
        <IconButton
          onClick={() => onClick("bold")}
          toggled={hasToggle('bold')}
        >
          <Bold class={iconClasses} />
        </IconButton>
        <IconButton
          onClick={() => onClick("italic")}
          toggled={hasToggle("italic")}
        >
          <Italic class={iconClasses} />
        </IconButton>
        <IconButton
          onClick={() => onClick("underline")}
          toggled={hasToggle("underline")}
        >
          <Underline class={iconClasses} />
        </IconButton>
        <IconButton
          onClick={() => onClick("strikethrough")}
          toggled={hasToggle("strikethrough")}
        >
          <Strikethrough class={iconClasses} />
        </IconButton>
        <IconButton
          onClick={() => onClick("code")}
          toggled={hasToggle("code")}
        >
          <Code class={iconClasses} />
        </IconButton>
      </div>

      {divider()}

      <div class={menuSectionClasses}>
        <IconButton onClick={() => onClick("bullet_list")}>
          <ListUl class={iconClasses} />
        </IconButton>
        <IconButton onClick={() => onClick("ordered_list")}>
          <ListOl class={iconClasses} />
        </IconButton>
        <IconButton onClick={() => onClick("blockquote")}>
          <QuoteLeft class={iconClasses} />
        </IconButton>
      </div>

      {divider()}

      <div class={menuSectionClasses}>
        <IconButton
          onClick={() => onClick("paragraph")}
          disabled={() => activeBlockType() == 'paragraph'}
        >
          <Paragraph class={iconClasses} />
        </IconButton>
        <IconButton
          onClick={() => onClick("heading")}
          disabled={() => activeBlockType() == 'heading'}
        >
          <Heading class={iconClasses} />
        </IconButton>
        <IconButton
          onClick={() => onClick("code_block")}
          disabled={() => activeBlockType() == 'code_block'}
        >
          <Code class={iconClasses} />
        </IconButton>
      </div>
    </div>
  )
}
