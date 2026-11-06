// The marker loop, ported from loop() in brand/tools/make_brand.py (../../brand from this project)
// so the film's loops come from the same hand as the logo's. Python's
// random.Random(seed).uniform(0, tau) phases are copied below, so a seed here
// draws exactly what it draws there. Also: a marker tick, built the same way.

type Pt = [number, number];

// random.Random(seed): three uniform(0, tau) draws, for seeds 1 to 12.
const PHASES: Record<number, [number, number, number]> = {
  1: [0.844235, 5.324583, 4.798937],
  2: [6.00694, 5.955376, 0.355323],
  3: [1.495176, 3.419493, 2.324497],
  4: [1.483134, 0.648211, 2.488507],
  5: [3.913807, 4.660785, 4.996349],
  6: [4.984703, 5.16449, 3.047562],
  7: [2.034701, 0.947813, 4.089942],
  8: [1.424435, 6.046278, 0.79376],
  9: [2.909161, 2.345588, 0.870469],
  10: [3.590228, 2.694789, 3.632255],
  11: [2.842385, 3.517154, 5.806986],
  12: [2.981816, 4.131022, 4.18718],
};

const f2 = (v: number) => v.toFixed(2);

// Closed Catmull-Rom spline through the points, as cubic Béziers.
const smooth = (p: Pt[]) => {
  const n = p.length;
  let d = `M${f2(p[0][0])} ${f2(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f2(c1[0])} ${f2(c1[1])} ${f2(c2[0])} ${f2(c2[1])} ${f2(p2[0])} ${f2(p2[1])}`;
  }
  return d + "Z";
};

// Open Catmull-Rom spline: the pen's own path, which the mask follows.
const smoothOpen = (p: Pt[]) => {
  const n = p.length;
  let d = `M${f2(p[0][0])} ${f2(p[0][1])}`;
  for (let i = 0; i < n - 1; i++) {
    const p0 = p[Math.max(i - 1, 0)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(i + 2, n - 1)];
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f2(c1[0])} ${f2(c1[1])} ${f2(c2[0])} ${f2(c2[1])} ${f2(p2[0])} ${f2(p2[1])}`;
  }
  return d;
};

export type Stroke = { outline: string; pen: string; width: number };

// Outline a centre line with a width that changes along it, like a felt tip.
const outline = (centre: Pt[], widthAt: (t: number, i: number) => number): string => {
  const n = centre.length - 1;
  const left: Pt[] = [], right: Pt[] = [];
  centre.forEach((p, i) => {
    const q0 = centre[Math.max(i - 1, 0)], q1 = centre[Math.min(i + 1, n)];
    const dx = q1[0] - q0[0], dy = q1[1] - q0[1];
    const len = Math.hypot(dx, dy) || 1;
    const w = widthAt(i / n, i);
    left.push([p[0] - (dy / len) * w / 2, p[1] + (dx / len) * w / 2]);
    right.push([p[0] + (dy / len) * w / 2, p[1] - (dx / len) * w / 2]);
  });
  const cap = (i: number, sign: number): Pt => {
    const q0 = centre[Math.max(i - 1, 0)], q1 = centre[Math.min(i + 1, n)];
    const dx = q1[0] - q0[0], dy = q1[1] - q0[1];
    const len = Math.hypot(dx, dy) || 1;
    const w = (Math.hypot(left[i][0] - right[i][0], left[i][1] - right[i][1]) / 2) * 0.9;
    return [centre[i][0] + (sign * dx / len) * w, centre[i][1] + (sign * dy / len) * w];
  };
  const c0 = cap(0, -1), cn = cap(n, 1);
  return smooth([...left, cn, ...[...right].reverse(), c0]);
};

export type LoopOpts = {
  seed?: number; start?: number; turn?: number; tilt?: number;
  spiral?: number; wobble?: number; flick?: number; n?: number;
};

/** A marker circle drawn counter-clockwise from about eleven o'clock, as in make_brand.py. */
export const loop = (cx: number, cy: number, rx: number, ry: number, width: number, o: LoopOpts = {}): Stroke => {
  const { seed = 1, start = -80, turn = 425, tilt = -4, spiral = 0.12, wobble = 0.04, flick = 0.18, n = 150 } = o;
  const ph = PHASES[seed] ?? PHASES[1];
  const tl = (tilt * Math.PI) / 180;
  const centre: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = ((start - turn * t) * Math.PI) / 180;
    let k = 1 + wobble * (0.6 * Math.sin(2 * a + ph[0]) + 0.4 * Math.sin(3 * a + ph[1])) - spiral * (t - 0.5);
    if (t > 0.86) k += flick * ((t - 0.86) / 0.14) ** 2;
    const px = rx * k * Math.cos(a), py = ry * k * Math.sin(a);
    centre.push([cx + px * Math.cos(tl) - py * Math.sin(tl), cy + px * Math.sin(tl) + py * Math.cos(tl)]);
  }
  const widthAt = (t: number) => {
    let w = width * (0.86 + 0.14 * Math.sin(Math.PI * t + ph[2]) ** 2);
    if (t < 0.04) w *= 0.55 + 0.45 * Math.sin(((t / 0.04) * Math.PI) / 2);
    if (t > 0.84) w *= 0.25 + 0.75 * Math.cos((((t - 0.84) / 0.16) * Math.PI) / 2);
    return w;
  };
  return { outline: outline(centre, widthAt), pen: smoothOpen(centre), width };
};

/** A loop that fits round a box (x, y, w, h), in the proportions of the logo's loop round "Call". */
export const loopAround = (b: { x: number; y: number; w: number; h: number }, width: number, o: LoopOpts & { padX?: number; padY?: number } = {}) => {
  const padX = o.padX ?? 0.16 * b.h + 6;
  const padY = o.padY ?? 0.2 * b.h + 5;
  return loop(b.x + b.w / 2, b.y + b.h / 2, b.w / 2 + padX, b.h / 2 + padY, width, o);
};

/** A marker tick: a short stroke down, then a long one up to the right. */
export const tick = (x: number, y: number, size: number, width: number): Stroke => {
  // Corner at (x, y). The short arm comes in from the upper left, the long arm leaves up and right.
  const a: Pt = [x - size * 0.42, y - size * 0.42];
  const c: Pt = [x + size * 0.7, y - size * 1.05];
  const centre: Pt[] = [];
  const N = 40;
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    let p: Pt;
    if (t < 0.32) {
      const u = t / 0.32;
      p = [a[0] + (x - a[0]) * u, a[1] + (y - a[1]) * u + Math.sin(u * Math.PI) * size * 0.03];
    } else {
      const u = (t - 0.32) / 0.68;
      // The long arm bows a little, the way a quick wrist moves.
      const bow = Math.sin(u * Math.PI) * size * 0.08;
      p = [x + (c[0] - x) * u - bow * 0.5, y + (c[1] - y) * u + bow * 0.2];
    }
    centre.push(p);
  }
  const widthAt = (t: number) => {
    let w = width;
    if (t < 0.08) w *= 0.6 + 0.4 * (t / 0.08);
    if (t > 0.3 && t < 0.38) w *= 1.08;
    if (t > 0.7) w *= 0.3 + 0.7 * Math.cos(((t - 0.7) / 0.3) * Math.PI / 2);
    return w;
  };
  return { outline: outline(centre, widthAt), pen: smoothOpen(centre), width };
};
