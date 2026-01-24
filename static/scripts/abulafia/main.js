import { API } from "./api.js";
import { UI } from "./ui.js";
import { STATE } from "./state.js";

const api = new API();
const state = new STATE()
const ui = new UI(api, state);
