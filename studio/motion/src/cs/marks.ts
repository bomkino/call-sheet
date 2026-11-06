import marks from "../marks.json";

// Paths drawn by the brand's own code (scripts/make_marks.py): the logo's
// letters and its loop, each loop with its pen's centre line for drawing on.
export type Ring = {
  d: string;
  pen: string;
  box: number[];
  overlap: string;
  samples: number[][];
  length: number;
  maskWidth: number;
};

export const LOGO = marks.logo as {
  call: string;
  sheet: string;
  callBox: number[];
  sheetBox: number[];
  ring: Ring;
  box: number[];
};

export const DATE_RING = marks.dateRing as Ring;

// The logo ring's centre in logo units: what the camera lines up on.
export const ringCentre = (r: Ring) => {
  const [x0, y0, x1, y1] = r.box;
  return { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
};

// Where the nib is at a fraction of the stroke.
export const nibAt = (r: Ring, p: number) => {
  const s = r.samples;
  const f = Math.min(Math.max(p, 0), 1) * (s.length - 1);
  const i = Math.min(Math.floor(f), s.length - 2);
  const t = f - i;
  return {
    x: s[i][0] + (s[i + 1][0] - s[i][0]) * t,
    y: s[i][1] + (s[i + 1][1] - s[i][1]) * t,
  };
};
