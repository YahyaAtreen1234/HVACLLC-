import { register } from "node:module";

/** Loaded via `node --import` so the alias hook is active before tests import anything. */
register("./alias-hooks.mjs", import.meta.url);
