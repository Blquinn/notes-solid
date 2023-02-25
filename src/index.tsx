/* @refresh reload */
import { render } from "solid-js/web";

import "./style.css";
import App from "./App";
import 'simplebar';
import ResizeObserver from 'resize-observer-polyfill';
// import '@fortawesome/fontawesome-free/webfonts/fa-solid-900.ttf'

window.ResizeObserver = ResizeObserver;

render(() => <App />, document.getElementById("root") as HTMLElement);
