import { invoke } from "@tauri-apps/api";
import { DOMParser as ProseDOMParser, DOMSerializer, Fragment, Node as ProseNode } from "prosemirror-model";
import { Note, notesDir } from "../state";
import { schema } from "./components/editor/schema";

export type NoteMeta = {
  title: string
  createdAt: string
  updatedAt: string
}

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

export const deserializeDocument = (doc: string): ParseResult => {
  const dom = new DOMParser().parseFromString(doc, 'application/xhtml+xml');
  const head = dom.head;

  return {
    note: {
      title: getMetaContent(head, 'title'),
      createdAt: getMetaContent(head, 'createdAt'),
      updatedAt: getMetaContent(head, 'updatedAt'),
    },
    content: ProseDOMParser.fromSchema(schema).parse(dom.body),
  };
}

export async function loadNotesTree () {
  const files = await invoke("load_notes_dir", { dir: notesDir() });
  console.log(files)
}
