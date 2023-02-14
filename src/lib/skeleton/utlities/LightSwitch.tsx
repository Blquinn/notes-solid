import { createSignal, onMount } from "solid-js";
import { Icon } from 'solid-heroicons';
import { sun, moon } from 'solid-heroicons/solid';

type Scheme = 'light' | 'dark';

const [scheme, setScheme] = createSignal<Scheme>('light');

const localStorageKey = 'color-scheme-brightness';

function getPreferredScheme(): Scheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getStorageScheme(): Scheme | null {
  const stored = localStorage.getItem(localStorageKey);
  if (stored == null) {
    return null
  }

  return stored as Scheme;
}

function storeScheme(scheme: Scheme) {
  localStorage.setItem(localStorageKey, scheme)
}

function getStoredOrPreferred(): Scheme {
  const stored = getStorageScheme();
  if (stored != null) {
    return stored;
  }

  return getPreferredScheme();
}

function setColorScheme(newScheme: Scheme) {
  storeScheme(newScheme);
  setScheme(newScheme);

  if (newScheme == 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}

function toggleColorScheme() {
  const newScheme = scheme() == 'dark' ? 'light' : 'dark';
  setColorScheme(newScheme);
}

export default function LightSwitch() {
  onMount(() => {
    setColorScheme(getStoredOrPreferred());
  });

  return (
    <button class="h-6 w-6" onClick={toggleColorScheme}>{
      scheme() == 'dark' 
        ? <Icon path={moon} />
        : <Icon path={sun} />
    }</button>
  );
}
