import type React from "react";
import { createElement } from "react";

// Typed text: characters arrive left to right at `rate` per frame, and every
// character keeps its own place from the start, so nothing reflows. Struck
// characters vary a hair in ink, as a type bar does.
const ink = (i: number) => 0.86 + 0.14 * ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;

export const typed = (text: string, since: number, rate: number): React.ReactNode => {
  const shown = since < 0 ? 0 : Math.floor(since * rate) + 1;
  return text.split("").map((ch, i) =>
    createElement(
      "span",
      { key: i, style: { opacity: i < shown ? ink(i) : 0 } },
      ch,
    ),
  );
};

// A strike: the date lands in one frame, a touch big, and settles.
export const strike = (frame: number, at: number) => {
  const t = frame - at;
  if (t < 0) return { opacity: 0, scale: 1.0 };
  const k = Math.exp(-t / 1.6);
  return { opacity: 1, scale: 1 + 0.05 * k };
};
