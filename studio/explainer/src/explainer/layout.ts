import type { Size } from "../sizes";

// Each size gets its own layout, not a crop of another. Two families:
// stacked (9:16 and 1:1: words on top, the paper below) and side by side
// (16:9 and 4:3: words left, the paper right).
export type Kind = "tall" | "square" | "classic" | "wide";
export type Box = { x: number; y: number; w: number; h: number };

export const kindOf = (s: Size): Kind =>
  s.width === s.height ? "square" : s.height > s.width ? "tall" : s.width / s.height > 1.5 ? "wide" : "classic";

export const stacked = (k: Kind) => k === "tall" || k === "square";

// Where the words and the paper sit. In 9:16 the paper also stays clear of the
// Reels buttons down the right edge (x > 960, lower half), not just the safe area.
export const regions = (s: Size): { text: Box; art: Box } => {
  const k = kindOf(s);
  if (k === "tall") return { text: { x: 80, y: 250, w: 900, h: 460 }, art: { x: 90, y: 740, w: 860, h: 850 } };
  if (k === "square") return { text: { x: 80, y: 80, w: 920, h: 330 }, art: { x: 80, y: 430, w: 920, h: 570 } };
  if (k === "classic") return { text: { x: 90, y: 90, w: 560, h: 900 }, art: { x: 700, y: 90, w: 650, h: 900 } };
  return { text: { x: 90, y: 90, w: 760, h: 900 }, art: { x: 910, y: 90, w: 920, h: 900 } };
};

// 4:3 for lists and tables: words across the top, the list full width below,
// so call names don't break into four lines in a narrow column.
// `roomy` gives a three-line headline and its sub more height in 1:1, and the list
// below it sets its rows closer (see List's `dense`).
export const listRegions = (s: Size, roomy = false): { text: Box; art: Box; stack: boolean } => {
  if (kindOf(s) === "classic") return { text: { x: 90, y: 90, w: 1260, h: 330 }, art: { x: 90, y: 440, w: 1260, h: 550 }, stack: true };
  if (roomy && kindOf(s) === "square") return { text: { x: 80, y: 80, w: 920, h: 380 }, art: { x: 80, y: 490, w: 920, h: 510 }, stack: true };
  return { ...regions(s), stack: stacked(kindOf(s)) };
};

// The type roles for the words a viewer has to read. A 16:9 frame plays about
// 390 px wide on a phone held upright, where only the big social roles stay
// legible, so its supporting line takes the headline role instead of subhead.
// A long main line (two clauses, or more than about 40 characters) steps down to
// the headline role, so it keeps to its region above the paper in 9:16 and 1:1
// and doesn't break into a word a line in 4:3's narrow column. 16:9's column is
// wide enough for display.
export const roles = (k: Kind) => ({
  main: "display",
  long: k === "wide" ? "display" : "headline",
  sub: k === "wide" ? "headline" : "subhead",
  label: "metadata",
});

// Scale a piece of paper art (natural size w x h, in CSS px) into a box.
export const fit = (box: Box, w: number, h: number, max = 2.6) => {
  const k = Math.min(box.w / w, box.h / h, max);
  return { k, x: box.x + (box.w - w * k) / 2, y: box.y + (box.h - h * k) / 2 };
};
