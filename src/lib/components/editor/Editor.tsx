import { createEffect, createSignal, onMount, useContext } from "solid-js";
import Quill from 'quill';

import './Editor.css';
import { NoteTreeContext } from "../../../state";
import { getSelectedNode } from "../treeview/treeContext";
import Delta from "quill-delta";

export default function Editor() {

  const [state, _] = useContext(NoteTreeContext);

  let editor: HTMLDivElement | undefined;
  let quill: Quill | undefined;

  const [title, setTitle] = createSignal<string | undefined>(undefined);

  createEffect(() => {
    const node = getSelectedNode(state);
    setTitle(node?.label);
    const body = node?.data?.body ?? new Delta().insert('');
    quill?.setContents(body as any);
  }, [state.selectedNode])

  onMount(() => {
    const toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['blockquote', 'code-block'],

      // [{ 'header': 1 }, { 'header': 2 }],               // custom button values
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
      // [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
      [{ 'indent': '-1' }, { 'indent': '+1' }],          // outdent/indent
      // TODO: Set text direction based on locale
      // [{ 'direction': 'rtl' }],                         // text direction

      // [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

      // [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      // [{ 'font': [] }],
      [{ 'align': [] }],

      ['clean']                                         // remove formatting button
    ];

    quill = new Quill(editor!, {
      modules: {
        toolbar: toolbarOptions
      },
      theme: 'snow',
    });

    quill.on('text-change', function (delta, oldDelta, source) {
      if (source == 'user') {
        // dispatch('editor-updated');
      }
    });
  });

  const onTitleInput = (e: InputEvent) => {
  }

  const onTitleKey = (e: KeyboardEvent) => {
    if (e.key == 'Enter') {
      e.preventDefault();
      quill?.focus();
    }
  }

  return (
    <>
      <input
        type="text"
        class="order-1 title text-2xl bg-surface-50-900-token border-none"
        placeholder="Note title..."
        value={title() ?? ''}
        onInput={onTitleInput}
        onKeyDown={onTitleKey}
      />
      <div class="order-2 flex-1 overflow-y-auto min-h-0" ref={editor} />
    </>
  );
}
