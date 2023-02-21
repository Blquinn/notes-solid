import { createEffect, createSignal, on, onMount, Show, useContext } from "solid-js";

import { NoteMeta, NoteTreeContext } from "../../../state";
import { getSelectedNode, TTreeNode } from "../treeview/treeContext";
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
import { createEventBus } from '@solid-primitives/event-bus';

import styles from './Editor.module.scss';
import EditorToolbar from "./EditorToolbar";

import debounce from 'lodash.debounce';
import { loadNote, saveNote } from "../../persistence";

// TODO: Flush debounce when document is changing.
const saveDebounce = debounce(async (note: NoteMeta, view: EditorView) => {
  await saveNote(note, view.state.doc.content);
}, 300)

const editorPadding = 10; // px

export default function Editor() {

  const [state, _] = useContext(NoteTreeContext);

  let titleEl: HTMLInputElement | undefined;
  let editor: HTMLDivElement | undefined;
  let content: HTMLDivElement | undefined;
  let editorView: EditorView | undefined;
  let [editorViewMounted, setEditorViewMounted] = createSignal(false);
  const editorChangeBus = createEventBus<void>();

  const [title, setTitle] = createSignal<string | undefined>(undefined);
  let node: TTreeNode<NoteMeta> | undefined;

  const loadSelectedNote = async () => {
    if (!editorView) {
      return;
    }

    saveDebounce.flush();

    node = getSelectedNode<NoteMeta>(state);
    if (!node) {
      return;
    }

    setTitle(node?.label);

    const editorState = editorView!.state;
    const res = await loadNote(node!.data!);
    const newState = EditorState.create({
      // TODO: Cache selection and undo/redo stacks.
      schema: editorState.schema,
      plugins: editorState.plugins,
      doc: res.content, 
    });

    editorView!.updateState(newState);
  }

  createEffect(on(() => state.selectedNode, loadSelectedNote))

  onMount(async () => {
    editorView = new EditorView(editor!, {
      scrollThreshold: editorPadding ,
      scrollMargin: editorPadding ,
      state: EditorState.create({
        doc: DOMParser.fromSchema(schema).parse(content!),
        plugins: [
          new Plugin({
            view(view) {
              return {
                update: (view, prevState) => {
                  saveDebounce(node!.data!, view);
                  editorChangeBus.emit();
                },
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
    });

    setEditorViewMounted(true);
    await loadSelectedNote();
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
    // const selection = editorView?.state.selection;
    // if (titleEl && e.code == 'Backspace' && selection?.empty && (selection?.$head.pos ?? -1) == 1) {
    //   console.log(selection)
    //   e.preventDefault();
    //   titleEl.focus();
    //   titleEl.selectionStart = titleEl.selectionEnd = titleEl.value.length;
    //   e.stopPropagation();
    //   return;
    // }

    // TODO: Fix Tab presses breaking editor. (Does focus move to another element?)
    if (e.code == 'Tab') {
      e.preventDefault();
      return;
    }
  }

  return (
    <>
      <input
        type="text"
        ref={titleEl}
        class={`${styles.title} text-3xl bg-surface-50-900-token border-none text-ellipsis`}
        placeholder="Note title..."
        value={title() ?? ''}
        onInput={onTitleInput}
        onKeyDown={onTitleKey}
      />
      <div 
        onKeyDown={onEditorKey}
        ref={editor}
        class={`${styles.editor} flex-1 flex flex-col overflow-y-auto min-h-0 bg-surface-50-900-token`} 
        style={`--editor-padding: ${editorPadding}px`}
      ></div>
      <div ref={content} class="hidden"></div>
      <Show when={editorViewMounted()}>
        <EditorToolbar view={editorView!} viewUpdated={editorChangeBus} />
      </Show>
    </>
  );
}
