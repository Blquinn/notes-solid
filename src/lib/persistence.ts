import { invoke } from "@tauri-apps/api";
import { DOMParser as ProseDOMParser, DOMSerializer, Fragment, Node as ProseNode } from "prosemirror-model";
import { NoteMeta, notesDir } from "../state";
import { schema } from "./components/editor/schema";
import { TTree, TTreeNode } from "./components/treeview/treeContext";
import { readTextFile, writeTextFile } from '@tauri-apps/api/fs';
import { join } from '@tauri-apps/api/path';
import { Result } from 'true-myth';

export const serializeDocument = (meta: NoteMeta, content: Fragment) => {
  const d = document.createDocumentFragment();

  const html = document.createElement('html')
  d.appendChild(html)

  const head = document.createElement('head');
  html.appendChild(head);

  const title = document.createElement('title');
  head.appendChild(title);
  title.text = meta.title;

  for (let [key, val] of Object.entries(meta)) {
    const meta = document.createElement('meta');
    meta.name = key;
    meta.content = val;
    head.appendChild(meta);
  }


  const body = document.createElement('body');
  html.appendChild(body);

  const contentDom = DOMSerializer.fromSchema(schema).serializeFragment(content);
  body.appendChild(contentDom);

  return new XMLSerializer().serializeToString(d);
}

export type ParseResult = {
  note: NoteMeta,
  content: ProseNode,
}

const getMetaContent = (head: HTMLHeadElement, name: string): string => {
  return (head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement).content;
}

export const deserializeDocument = (path: string[], doc: string): ParseResult => {
  const dom = new DOMParser().parseFromString(doc, 'application/xhtml+xml');
  const head = dom.head;

  return {
    note: {
      path,
      id: getMetaContent(head, 'id'),
      title: getMetaContent(head, 'title'),
    },
    content: ProseDOMParser.fromSchema(schema).parse(dom.body),
  };
}

type NoteMetaDto = NoteMeta & {is_directory: boolean};

function buildNotesTree(noteMetas: NoteMetaDto[]): TTree<NoteMeta> {
  if (noteMetas.length == 0) {
    return [];
  }

  // TODO: Path is not a stable id if notes are moved.
  const noteMetaPaths = noteMetas
    .map(n => {return {...n, pathStr: n.path.join('/')}})
    .sort((a, b) => a.pathStr.localeCompare(b.pathStr));

  const tree: TTree<NoteMeta> = []

  let level: {
    [key: string]: any,
    tree: TTree<NoteMeta>
  } = {tree};

  noteMetaPaths.forEach(note => {
    note.path.reduce((r, name: string) => {
      if (!r[name]) {
        r[name] = {tree: []};

        const node: TTreeNode<NoteMeta> = {id: note.pathStr, label: name};
        if (note.is_directory) {
          node.children = r[name].tree;
        } else {
          node.data = note;
        }
        
        r.tree.push(node);
      }
      return r[name];
    }, level)
  })

  return tree;
}

export async function loadNotesTree(directory: string): Promise<Result<TTree<NoteMeta>, string>> {
  try {
    const files: NoteMetaDto[] = await invoke("load_notes_dir", { dir: directory });
    return Result.ok(buildNotesTree(files));
  } catch (e) {
    console.error('Failed to load notes tree.', e);
    return Result.err('Failed to load notes.');
  }
}

export async function loadNote(path: string[]): Promise<ParseResult> {
  const absPath = await join(notesDir()!, ...path)
  const contents = await readTextFile(absPath);
  return deserializeDocument(path, contents);
}

export async function saveNote(note: NoteMeta, content: Fragment): Promise<void> {
  const absPath = await join(notesDir()!, ...note.path)
  const xml = serializeDocument(note, content);
  await writeTextFile(absPath, xml);
}
