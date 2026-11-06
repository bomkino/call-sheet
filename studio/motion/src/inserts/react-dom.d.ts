// react-dom ships no types here and @types/react-dom isn't installed; the
// inserts only need flushSync (kit.tsx, to commit a measured loop before a
// still is captured).
declare module "react-dom" {
  export function flushSync<R>(fn: () => R): R;
}
