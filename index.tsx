/// <reference lib="dom"/>
/// <reference no-default-lib="true"/>
/// <reference lib="deno.ns"/>

import * as React from "./deps/react.ts";
import { Alice } from "./packages/alice/mod.tsx";
import { Bob } from "./packages/bob/mod.tsx";

React.render(
  <div>
    <Alice />
    <Bob />
  </div>,
  document.body,
);
