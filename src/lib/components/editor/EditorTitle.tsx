import { NotesListContext } from '../notelist/context';
import styles from './EditorTitle.module.css';

import { Accessor, useContext } from 'solid-js';
import { noteMetaTitle } from '../../../state';

export interface EditorTitleProps {
  onEnterPressed: () => void
  title: Accessor<string | undefined>
}

export default function EditorTitle(props: EditorTitleProps) {

  const noteListController = useContext(NotesListContext);

  let titleEl: HTMLInputElement | undefined;

  const onTitleAccepted = async () => {
    const note = await noteListController.renameNote(titleEl!.value);
    if (!note) return;
    titleEl!.value = noteMetaTitle(note);
  }

  // TODO: Save and update state.
  const onTitleKey = async (e: KeyboardEvent) => {
    if (e.key == 'Enter') {
      e.preventDefault();

      await onTitleAccepted();
     
      props.onEnterPressed();
      return;
    }
  }

  return (
    <input
      type="text"
      ref={titleEl}
      class={`${styles.title} text-3xl bg-surface-50-900-token border-none text-ellipsis`}
      placeholder="Note title..."
      value={props.title() ?? ''}
      onKeyDown={onTitleKey}
      onChange={onTitleAccepted}
    />
  );
}
