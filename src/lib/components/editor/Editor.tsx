import { onMount } from "solid-js";
import Quill from 'quill';

export default function Editor() {

  let editor: HTMLDivElement | undefined;
  let quill: Quill | undefined;

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

  return (
    <div class="flex-1 overflow-y-auto min-h-0" ref={editor} />
  );
}
