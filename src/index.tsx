/* @refresh reload */
import { render } from "solid-js/web";

import "./style.css";
import App from "./App";
import 'simplebar';

render(() => <App />, document.getElementById("root") as HTMLElement);
