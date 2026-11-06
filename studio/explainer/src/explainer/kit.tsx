import type React from "react";
import { AbsoluteFill, Easing, Img, interpolate, interpolateColors, staticFile } from "remotion";
import { clamp, ease, mix } from "../lib/motion";
import timeline from "../timeline.json";
import meta from "../../public/ui/meta.json";
import { loopAround, tick, type LoopOpts, type Stroke } from "./loop";
import { C } from "./palette";

export const TOOTH = staticFile("tex/tooth.png");
export const grainFrame = (i: number) => staticFile(`tex/grain-${i % 8}.png`);

type Meta = { w: number; h: number; parts?: Record<string, { x: number; y: number; w: number; h: number } | null> };
export const shotMeta = (name: string): Meta => (meta as unknown as Record<string, Meta>)[name];
export const part = (name: string, key: string) => {
  const p = shotMeta(name).parts?.[key];
  if (!p) throw new Error(`No part ${key} in capture ${name}`);
  return p;
};

// One red mark at a time: when the hand makes the next mark, the last one dries
// to the label's grey over a third of a second, and stays there.
export const dried = (frame: number, at?: number) =>
  at === undefined ? C.marker : interpolateColors(frame, [at, at + 10], [C.marker, C.toner]);

// ------------------------------------------------------------------ paper

// A full sheet of paper. It slides on over the last one and lands on its beat,
// carrying its own tooth, so the texture travels with the page.
export const Sheet: React.FC<{
  readonly frame: number;
  readonly land: number;
  readonly color?: string;
  readonly from: "bottom" | "right";
  readonly width: number;
  readonly height: number;
  readonly children?: React.ReactNode;
  readonly z: number;
}> = ({ frame, land, color = C.paper, from, width, height, children, z }) => {
  const DUR = 16;
  const p = interpolate(frame, [land - DUR, land], [0, 1], { ...clamp, easing: Easing.bezier(0.33, 0, 0.12, 1) });
  const off = 1 - p;
  const dx = from === "right" ? off * (width + 60) : 0;
  const dy = from === "bottom" ? off * (height + 60) : 0;
  const rot = off * (from === "right" ? 2.2 : -1.6);
  return (
    <AbsoluteFill
      style={{
        zIndex: z,
        translate: `${dx}px ${dy}px`,
        rotate: `${rot}deg`,
        transformOrigin: from === "right" ? "0% 100%" : "0% 0%",
        backgroundColor: color,
        boxShadow: p < 1 ? "0 0 0 1px rgba(21,19,15,0.05), 0 0 46px rgba(21,19,15,0.20)" : "none",
        overflow: "hidden",
      }}
    >
      <Img src={TOOTH} style={{ position: "absolute", left: 0, top: 0, width: 2048, height: 2048, mixBlendMode: "multiply", opacity: 0.9 }} />
      {children}
    </AbsoluteFill>
  );
};

// A slip of white paper laid on the sheet: the UI prints onto it. With `fold`
// its top-right corner folds over into a red dog-ear: the Save button made paper.
export const Slip: React.FC<{
  readonly w: number;
  readonly h: number;
  readonly pad?: number;
  readonly fold?: number;
  readonly ear?: number;
  readonly lift?: number;
  readonly earColor?: string;
  readonly children?: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ w, h, pad = 22, fold = 0, ear = 46, lift = 0, earColor = C.marker, children, style }) => {
  const W = w + 2 * pad, H = h + 2 * pad;
  const cut = fold > 0 ? `polygon(0 0, ${W - ear}px 0, ${W}px ${ear}px, ${W}px ${H}px, 0 ${H}px)` : undefined;
  const th = Math.PI * Math.min(1, fold);
  const cos = Math.cos(th), sin = Math.sin(th);
  // The corner swings over the crease, which runs from (W - ear, 0) to (W, ear).
  const mx = W - ear / 2, my = ear / 2;
  const ax = mx + (ear / 2) * cos, ay = my - (ear / 2) * cos;
  const front = cos > 0;
  const shade = 0.1 * sin;
  return (
    <div style={{ position: "absolute", width: W, height: H, filter: cut ? `drop-shadow(0 ${1 + lift * 6}px ${1 + lift * 2}px rgba(21,19,15,${0.08 + lift * 0.04})) drop-shadow(0 ${10 + lift * 18}px ${14 + lift * 16}px rgba(21,19,15,${0.15 + lift * 0.06}))` : undefined, ...style }}>
      <div style={{ position: "absolute", inset: 0, backgroundColor: C.white, clipPath: cut, overflow: "hidden", boxShadow: cut ? undefined : `0 ${1 + lift * 6}px ${2 + lift * 4}px rgba(21,19,15,${0.08 + lift * 0.04}), 0 ${10 + lift * 18}px ${28 + lift * 32}px rgba(21,19,15,${0.15 + lift * 0.06})` }}>
        <Img src={TOOTH} style={{ position: "absolute", left: 0, top: 0, width: 1024, height: 1024, mixBlendMode: "multiply", opacity: 0.55 }} />
        <div style={{ position: "absolute", left: pad, top: pad, width: w, height: h }}>{children}</div>
      </div>
      {fold > 0 ? (
        <svg width={W} height={H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {!front ? <polygon points={`${W - ear},0 ${W},${ear} ${ax + 1.5},${ay + 2.5}`} fill="rgba(21,19,15,0.16)" style={{ filter: "blur(2px)" }} /> : null}
          <polygon
            points={`${W - ear},0 ${W},${ear} ${ax},${ay}`}
            fill={front ? `color-mix(in srgb, ${C.white}, ${C.ink} ${shade * 100}%)` : earColor}
            stroke={front ? "rgba(21,19,15,0.08)" : "none"}
            strokeWidth={0.6}
          />
        </svg>
      ) : null}
    </div>
  );
};

// A capture of the real site, at its CSS size. States cross-fade.
export const Shot: React.FC<{ readonly name: string; readonly opacity?: number; readonly style?: React.CSSProperties }> = ({ name, opacity = 1, style }) => {
  const m = shotMeta(name);
  return <Img src={staticFile(`ui/${name}.png`)} style={{ position: "absolute", left: 0, top: 0, width: m.w, height: m.h, opacity, ...style }} />;
};

// ------------------------------------------------------------------ the hand

const penEase = Easing.bezier(0.32, 0.06, 0.58, 0.96);

// A stroke that draws itself along the pen's path, like the site's loop.
export const Drawn: React.FC<{ readonly stroke: Stroke; readonly p: number; readonly id: string; readonly opacity?: number; readonly color?: string }> = ({ stroke, p, id, opacity = 0.95, color = C.marker }) => {
  if (p <= 0.001) return null;
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", width: 1, height: 1, mixBlendMode: "multiply" }}>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x={-4000} y={-4000} width={8000} height={8000}>
          <path d={stroke.pen} pathLength={1} fill="none" stroke="#fff" strokeWidth={stroke.width * 2.3} strokeLinecap="round" strokeDasharray="1 2" strokeDashoffset={1 - Math.min(1, p)} />
        </mask>
      </defs>
      <path d={stroke.outline} fill={color} mask={p >= 1 ? undefined : `url(#${id})`} opacity={opacity} />
    </svg>
  );
};

// The loop round a box, drawn from `at` over `dur` frames.
export const LoopMark: React.FC<{
  readonly frame: number; readonly at: number; readonly box: { x: number; y: number; w: number; h: number };
  readonly width: number; readonly id: string; readonly dur?: number; readonly opts?: LoopOpts & { padX?: number; padY?: number }; readonly dryAt?: number;
}> = ({ frame, at, box, width, id, dur = 16, opts, dryAt }) => {
  const p = interpolate(frame, [at, at + dur], [0, 1], { ...clamp, easing: penEase });
  return <Drawn stroke={loopAround(box, width, opts)} p={p} id={id} color={dried(frame, dryAt)} />;
};

export const TickMark: React.FC<{ readonly frame: number; readonly at: number; readonly x: number; readonly y: number; readonly size: number; readonly width: number; readonly id: string; readonly dryAt?: number }> = ({ frame, at, x, y, size, width, id, dryAt }) => {
  const p = interpolate(frame, [at, at + 7], [0, 1], { ...clamp, easing: Easing.bezier(0.5, 0, 0.7, 1) });
  return <Drawn stroke={tick(x, y, size, width)} p={p} id={id} color={dried(frame, dryAt)} />;
};

// ------------------------------------------------------------------ words

const RATE = timeline.typeFramesPerChar;

// A typewriter label in PD Eyebrow, the way a call sheet labels its boxes, over a
// ruled line that draws itself in first. `tickAt` adds the marker's tick after it,
// and `tickDryAt` dries it to grey when the page's next red mark comes.
export const Label: React.FC<{ readonly frame: number; readonly at: number; readonly text: string; readonly color?: string; readonly tickAt?: number; readonly tickDryAt?: number }> = ({ frame, at, text, color = C.toner, tickAt, tickDryAt }) => {
  const n = Math.max(0, Math.min(text.length, Math.floor((frame - at) / RATE) + 1));
  const wipe = mix(frame, [at - 6, at + 10], ease.out);
  return (
    <div style={{ position: "relative", paddingTop: "0.9em" }} data-pd-social="metadata">
      <div style={{ position: "absolute", left: 0, top: 0, height: 2, width: `${wipe * 100}%`, backgroundColor: C.ink, opacity: 0.16 }} />
      <span style={{ color, whiteSpace: "pre" }}>{text.slice(0, n)}</span>
      <span style={{ color: "transparent" }}>{text.slice(n)}</span>
      {tickAt !== undefined ? (
        <span style={{ position: "relative", display: "inline-block", width: "1.6em", height: "1em", marginLeft: "0.5em", verticalAlign: "-0.1em" }}>
          <TickMark frame={frame} at={tickAt} x={10} y={22} size={26} width={5} id={`tick-${at}`} dryAt={tickDryAt} />
        </span>
      ) : null}
    </div>
  );
};

// A loop round whatever text it wraps, at any size: drawn for a nominal box and
// stretched to the text's box, which stays close to that shape.
export const LoopText: React.FC<{ readonly frame: number; readonly at: number; readonly id: string; readonly children: React.ReactNode; readonly seed?: number; readonly aspect?: number; readonly dur?: number }> = ({ frame, at, id, children, seed = 6, aspect = 3, dur = 16 }) => {
  const W = 100 * aspect, H = 100;
  const p = interpolate(frame, [at, at + dur], [0, 1], { ...clamp, easing: penEase });
  const stroke = loopAround({ x: 0, y: 0, w: W, h: H }, 9, { seed, tilt: -3, padX: 0.16 * H + 6, padY: 0.2 * H + 5 });
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {children}
      {p > 0.001 ? (
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ position: "absolute", left: 0, top: "8%", width: "100%", height: "84%", overflow: "visible", mixBlendMode: "multiply" }}>
          <defs>
            <mask id={id} maskUnits="userSpaceOnUse" x={-400} y={-400} width={W + 800} height={H + 800}>
              <path d={stroke.pen} pathLength={1} fill="none" stroke="#fff" strokeWidth={9 * 2.3} strokeLinecap="round" strokeDasharray="1 2" strokeDashoffset={1 - p} />
            </mask>
          </defs>
          <path d={stroke.outline} fill={C.marker} mask={p >= 1 ? undefined : `url(#${id})`} opacity={0.95} />
        </svg>
      ) : null}
    </span>
  );
};

// A region of a capture (x, y, w, h in CSS px), cut out like a strip of paper.
export const CropShot: React.FC<{ readonly name: string; readonly r: { x: number; y: number; w: number; h: number }; readonly style?: React.CSSProperties }> = ({ name, r, style }) => {
  const m = shotMeta(name);
  return (
    <div style={{ position: "absolute", width: r.w, height: r.h, overflow: "hidden", ...style }}>
      <Img src={staticFile(`ui/${name}.png`)} style={{ position: "absolute", left: -r.x, top: -r.y, width: m.w, height: m.h }} />
    </div>
  );
};

// A line of type whose words arrive one after another, rising a little.
export const Words: React.FC<{
  readonly frame: number; readonly at: number; readonly text: string; readonly role: string;
  readonly color?: string; readonly out?: number; readonly stagger?: number; readonly style?: React.CSSProperties;
}> = ({ frame, at, text, role, color = C.ink, out, stagger = 2.2, style }) => {
  const words = text.split(" ");
  const gone = out === undefined ? 0 : mix(frame, [out, out + 9], ease.in);
  return (
    <div data-pd-social={role} style={{ color, ...style }}>
      {words.map((w, i) => {
        const t = mix(frame, [at + i * stagger, at + i * stagger + 11], ease.out);
        return (
          <span key={i}>
            <span style={{ display: "inline-block", opacity: t * (1 - gone), translate: `0 ${(1 - t) * 0.28 + gone * -0.18}em` }}>{w}</span>
            {i < words.length - 1 ? " " : ""}
          </span>
        );
      })}
    </div>
  );
};

export const labels = timeline.labels as Record<string, { at: number; text: string }>;
