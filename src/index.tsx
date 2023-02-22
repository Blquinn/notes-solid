/* @refresh reload */
import { render } from "solid-js/web";

import "./style.css";
import App from "./App";
import 'simplebar';
import ResizeObserver from 'resize-observer-polyfill';

window.ResizeObserver = ResizeObserver;

render(() => <App />, document.getElementById("root") as HTMLElement);
