import type React from "react";
import type { CustomScene } from "../schema.mjs";

// Custom insert scenes, found automatically: every src/inserts/custom/<name>.tsx
// with a default export is registered as "<name>", and a spec uses it as
// { "type": "custom", "name": "<name>" }. Add a file; don't edit this one.
// See SPEC.md, "Custom scenes".

export type CustomSceneProps = {
  readonly scene: CustomScene;
  readonly props: Record<string, unknown>;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Require {
      context(dir: string, deep: boolean, filter: RegExp): { keys(): string[]; (id: string): unknown };
    }
  }
}

const found = require.context("./", false, /^\.\/[a-z0-9]+(-[a-z0-9]+)*\.tsx$/);

export const CUSTOM: Record<string, React.FC<CustomSceneProps>> = {};
for (const key of found.keys()) {
  if (!key.startsWith("./")) continue;
  const name = key.slice(2).replace(/\.tsx$/, "");
  const mod = found(key) as { default?: React.FC<CustomSceneProps> };
  if (mod.default) CUSTOM[name] = mod.default;
}
