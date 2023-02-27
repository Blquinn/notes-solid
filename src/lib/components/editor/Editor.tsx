import { createEffect, createSignal, on, onMount, Show, useContext } from "solid-js";

import { NoteMeta, noteMetaTitle } from "../../../state";
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
import { NotesListContext } from "../notelist/context";
import EditorTitle from "./EditorTitle";


const editorPadding = 10; // px

export default function Editor() {

  const noteListController = useContext(NotesListContext);

  const saveDebounce = debounce(async (note: NoteMeta, view: EditorView) => {
    const updatedNote: NoteMeta = {...note, updated: new Date()};
    noteListController.updateNote(note, updatedNote);
    await saveNote(updatedNote, view.state.doc.content);
  }, 300)

  let editor: HTMLDivElement | undefined;
  let content: HTMLDivElement | undefined;
  let editorView: EditorView | undefined;
  let [editorViewMounted, setEditorViewMounted] = createSignal(false);
  const editorChangeBus = createEventBus<void>();

  const [title, setTitle] = createSignal<string | undefined>(undefined);

  const loadSelectedNote = async () => {
    if (!editorView) {
      return;
    }

    // TODO: If selected note is undefined clear everything.

    saveDebounce.flush();

    const editorState = editorView!.state;

    const note = noteListController.findActiveNote();
    if (!note) {
      setTitle(undefined);
      editorView!.updateState(EditorState.create({
        schema: editorState.schema,
        plugins: editorState.plugins,
      }));
      return;
    }

    setTitle(noteMetaTitle(note));

    const res = await loadNote(note);
    const newState = EditorState.create({
      // TODO: Cache selection and undo/redo stacks.
      schema: editorState.schema,
      plugins: editorState.plugins,
      doc: res.content, 
    });

    editorView!.updateState(newState);
  }

  createEffect(on(() => noteListController.state.selectedNote, loadSelectedNote))

  onMount(async () => {
    editorView = new EditorView(editor!, {
      scrollThreshold: editorPadding ,
      scrollMargin: editorPadding ,
      // Handle task_list_item clicks.
      handleClickOn(view, pos, node, nodePos, event, direct) {
        if (!direct) return;
        if (node.type != schema.nodes.task_list_item) return;
        view.dispatch(view.state.tr.setNodeAttribute(nodePos, 'checked', !node.attrs.checked));
      },
      state: EditorState.create({
        doc: DOMParser.fromSchema(schema).parse(content!),
        plugins: [
          new Plugin({
            view(view) {
              return { 
                update: (view, prevState) => {
                  editorChangeBus.emit();

                  if (view.state.doc.eq(prevState.doc)) {
                    return;
                  }

                  const note = noteListController.findActiveNote();
                  if (note) {
                    saveDebounce(note, view);
                  }
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
      <EditorTitle onEnterPressed={() => editorView!.focus()} title={title} />
      <div 
        onKeyDown={onEditorKey}
        ref={editor}
        class={`${styles.editor} flex-1 flex flex-col overflow-y-auto min-h-0 bg-surface-50-900-token hide-scrollbar`} 
        data-simplebar
        style={`--editor-padding: ${editorPadding}px`}
      ></div>
      <div ref={content} class="hidden"></div>
      <Show when={editorViewMounted()}>
        <EditorToolbar view={editorView!} viewUpdated={editorChangeBus} />
      </Show>
    </>
  );
}
