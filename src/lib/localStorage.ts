import { Accessor, createSignal, onMount, Setter, Signal } from "solid-js";

export function getItemOrDefault<T>(key: string, defaultValue: T): T {
  const it = localStorage.getItem(key);
  if (it === null) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }

  return JSON.parse(it);
}

export function setItem<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function createStorageSignal<T>(key: string, initialValue: T): Signal<T> {
  const [acc, setter] = createSignal(getItemOrDefault(key, initialValue));

  const storeSetter = (v: T) => {
    setItem(key, v);
    (setter as any)(v);
  }

  return [acc, storeSetter as any];
}
