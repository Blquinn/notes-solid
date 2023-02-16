import { createEffect, createSignal, onMount, useContext } from "solid-js";

import { NoteTreeContext } from "../../../state";
import { getSelectedNode } from "../treeview/treeContext";
import { EditorState, Plugin } from "prosemirror-state"
import { EditorView } from "prosemirror-view"
import { keymap } from "prosemirror-keymap"
import { baseKeymap } from "prosemirror-commands"
import { DOMParser } from "prosemirror-model"
import { schema } from "./schema";
import { buildKeymap } from "./keymap";
import { buildInputRules } from "./inputrules";
import { dropCursor } from 'prosemirror-dropcursor';
import { gapCursor } from 'prosemirror-gapcursor';
import { history } from 'prosemirror-history';

import styles from './Editor.module.scss';

export default function Editor() {

  const [state, _] = useContext(NoteTreeContext);

  let titleEl: HTMLInputElement | undefined;
  let editor: HTMLDivElement | undefined;
  let content: HTMLDivElement | undefined;
  let editorView: EditorView | undefined;

  const [title, setTitle] = createSignal<string | undefined>(undefined);

  createEffect(() => {
    const node = getSelectedNode(state);
    setTitle(node?.label);
    editorView?.pasteText(node?.data?.body ?? 'Nothing')
  }, [state.selectedNode])

  onMount(() => {
    editorView = new EditorView(editor!, {
      state: EditorState.create({
        doc: DOMParser.fromSchema(schema).parse(content!),
        plugins: [
          new Plugin({
            view(view) {
              return {
                // update: (view, prevState) => dispatch('editor-updated'),
              };
            },
          }),
          history(),
          buildInputRules(schema),
          keymap(buildKeymap(schema)),
          keymap(baseKeymap),
          dropCursor(),
          gapCursor(),
        ]
      })
    })
  });

  const onTitleInput = (e: InputEvent) => {
  }

  const onTitleKey = (e: KeyboardEvent) => {
    if (e.key == 'Enter') {
      e.preventDefault();
      editorView?.focus();
    }
  }

  const onEditorKey = (e: KeyboardEvent) => {
    const selection = editorView?.state.selection;
    if (e.key == 'Backspace' && selection?.empty && (selection?.$head.pos ?? -1) == 1) {
      e.preventDefault();
      titleEl?.focus();
    }

    // TODO: Fix Tab presses breaking editor. (Does focus move to another element?)
    if (e.key == 'Tab') {
      e.preventDefault();
    }
  }

  return (
    <>
      <input
        type="text"
        ref={titleEl}
        class={`${styles.title} text-2xl bg-surface-50-900-token border-none`}
        placeholder="Note title..."
        value={title() ?? ''}
        onInput={onTitleInput}
        onKeyDown={onTitleKey}
      />
      <div 
        onKeyDown={onEditorKey}
        ref={editor}
        class={`${styles.editor} flex-1 flex flex-col overflow-y-auto min-h-0 bg-surface-50-900-token`} 
      ></div>
      <div ref={content} class="hidden"></div>
    </>
  );
}
