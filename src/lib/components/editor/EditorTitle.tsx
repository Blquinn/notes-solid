import { findActiveNote, NotesListContext } from '../notelist/context';
import styles from './EditorTitle.module.css';

import * as path from "@tauri-apps/api/path";
import * as fs from "@tauri-apps/api/fs";
import { Accessor, useContext } from 'solid-js';
import { NoteMeta, noteMetaAbsPath, noteMetaDirPath, noteMetaTitle, notesDir } from '../../../state';

export interface EditorTitleProps {
  onEnterPressed: () => void
  title: Accessor<string | undefined>
}

export default function EditorTitle(props: EditorTitleProps) {

  const [notesState, notesStore] = useContext(NotesListContext);

  let titleEl: HTMLInputElement | undefined;

  const onTitleAccepted = async () => {
    const note = findActiveNote(notesState);
    if (!note) return;

    const titleText = titleEl!.value;
    const noteTitle = noteMetaTitle(note);
    if (noteTitle === titleText) {
      return;
    }

    const dirPath = noteMetaDirPath(note);
    const newPath = [...dirPath, titleText, 'xhtml'];

    const newNote: NoteMeta = {
      ...note,
      path: newPath,
    };
    const newAbsPath = await noteMetaAbsPath(newNote);
    console.log(newPath, newAbsPath)
    if (await fs.exists(newAbsPath)) {
      titleEl!.value = noteMetaTitle(note);
      alert(`Note ${newPath} already exists.`);
      return;
    }

    const currentPath = await noteMetaAbsPath(note);
    await fs.renameFile(currentPath, newAbsPath);

    notesStore.updateNote(note, newNote);
    notesStore.select(note.id);
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
    />
  );
}
