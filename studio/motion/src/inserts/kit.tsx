import type React from "react";
import { createContext, useContext, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { cancelRender, continueRender, delayRender, Easing } from "remotion";
import { cs } from "../brand/palette";
import { Loop } from "../cs/Loop";
import { DATE_RING } from "../cs/marks";
import { typed } from "../cs/reveal";
import { ease, mix } from "../lib/motion";
import type { Dir, Ground, Scene } from "./schema.mjs";
import { countText, GROUNDS } from "./schema.mjs";

// The building blocks every insert scene is made of. Custom scenes
// (src/inserts/custom/*.tsx) use these too, so they stay in the family.

// ---------------------------------------------------------------- frame

export const SAFE = { top: 220, right: 120, bottom: 420, left: 80 } as const;
export const W = 1080;
export const H = 1920;

export const ink = cs.ink;
export const marker = cs.marker;
// Labels: toner on paper, and a toner that holds up on the revision colours.
export const labelInk = "rgba(21, 19, 15, 0.66)";
export const rule = "rgba(21, 19, 15, 0.16)";

export const groundHex = (g: Ground) => GROUNDS[g];
// A slip of paper reads against any ground: white on paper, paper elsewhere.
export const slipHex = (g: Ground) => (g === "paper" ? cs.white : g === "white" ? cs.paper : cs.paper);

// ---------------------------------------------------------------- scene clock

export type SceneCtx = {
  readonly f: number; // frame within the scene
  readonly dur: number; // the scene's length in frames
  readonly index: number; // which scene of the insert, from 0
  readonly scene: Scene;
  readonly base: number; // frames to wait before the first block (a page sliding in)
  readonly moving: boolean; // the whole column is moving in, so blocks don't rise too
  readonly seed: number; // a stable number from the scene's copy, for small variety
};

const Ctx = createContext<SceneCtx | null>(null);
export const SceneProvider = Ctx.Provider;
export const useScene = (): SceneCtx => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useScene() outside an insert scene");
  return c;
};

// When block i arrives, in scene frames. Blocks arrive on a gentle stagger.
export const blockAt = (c: SceneCtx, i: number) => c.base + 2 + i * (c.scene.entry === "type" ? 5 : 4);

// The beat that matters: when the loop (or the stamp) lands.
export const markFrame = (c: SceneCtx, lastBlock: number) => {
  if (c.scene.markAt !== undefined) return Math.round(c.scene.markAt * 30);
  const earliest = blockAt(c, lastBlock) + 12;
  const latest = c.dur - 26;
  return Math.max(Math.min(Math.round(c.dur * 0.42), latest), Math.min(earliest, latest));
};

// Typing speed in characters a frame: fast enough that a long field lands in
// well under a second.
export const TYPE_RATE = 1.6;

export const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
};

export const dirVec = (d: Dir): [number, number] =>
  d === "left" ? [-1, 0] : d === "right" ? [1, 0] : d === "up" ? [0, -1] : d === "down" ? [0, 1] : [0, 0];

// Resolves once fonts are in and the canvas has its real size. On first mount
// the data-pd-canvas container can still be 0x0, which sets every role's
// container-query font size to 0, so nothing can be measured before this.
export const whenLaidOut = async (el: HTMLElement | null) => {
  await document.fonts.ready;
  for (let i = 0; i < 600; i++) {
    const canvas = el?.closest<HTMLElement>("[data-pd-canvas]");
    if (!el || (canvas && canvas.clientWidth > 0 && canvas.clientHeight > 0)) return;
    await new Promise((r) => requestAnimationFrame(r));
  }
};

// ---------------------------------------------------------------- the column

// Every scene lays out in one flex column inside the Reels safe zone, so
// nothing can overlap: motif, labels and the object stack with air between.
//
// Fit to the column: once fonts and the canvas are in, the column finds the
// largest scale (up to MAX_FIT) at which the scene still fits the safe area,
// lays the scene out at 1/scale of the column's width and pushes in by that
// scale, like a camera on the page. It is centred (a hair above centre, the
// optical middle) in the safe area. Then it checks every piece of reading
// text lands at least MIN_READ px on screen (MIN_LABEL for typewriter
// labels), and fails the render loudly if the copy is too long for that,
// rather than letting it shrink or run into the UI.
export const MAX_FIT = 1.75;
export const MIN_READ = 44;
export const MIN_LABEL = 34;
const FILL = 0.97; // of the safe height: keep some paper round the scene
const OPTICAL = 24; // px above the geometric centre
export const COL_W = W - SAFE.left - SAFE.right;
export const COL_H = H - SAFE.top - SAFE.bottom;

// The column's current scale, for pieces that measure themselves.
export const FitContext = createContext(1);

const snippet = (n: Element) => `"${(n.textContent ?? "").trim().slice(0, 40)}"`;

export const Column: React.FC<{
  readonly children: React.ReactNode;
  readonly gap?: number;
  readonly style?: React.CSSProperties;
}> = ({ children, gap = 44, style }) => {
  const c = useScene();
  const ref = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<number | null>(null);
  const [handle] = useState(() => delayRender(`Fit check, scene ${c.index}`));
  useLayoutEffect(() => {
    let live = true;
    whenLaidOut(ref.current).then(() => {
      if (!live) return continueRender(handle);
      const el = ref.current;
      if (!el) return continueRender(handle);
      // Measure the copy alone: loops are hidden while we look.
      const loops = Array.from(el.querySelectorAll<SVGElement>("[data-loop]"));
      loops.forEach((l) => (l.style.display = "none"));
      const capped = Array.from(el.querySelectorAll<HTMLElement>("[data-max-lines]"));
      const nowrap = Array.from(el.querySelectorAll<HTMLElement>("*")).filter(
        (n) => getComputedStyle(n).whiteSpace === "nowrap",
      );
      // Layout geometry, not screen rects: transforms (the slip's tilt, a
      // block mid-rise) don't count.
      const overflow = (): string[] => {
        const out: string[] = [];
        for (const n of Array.from(el.children) as HTMLElement[]) {
          if (n.offsetLeft < -1 || n.offsetLeft + n.offsetWidth > el.clientWidth + 1)
            out.push(`${snippet(n)} is too wide for the safe zone`);
        }
        // A nowrap run can push any box it sits in wider than its share, so
        // look all the way up (short of the column, which a tilted slip
        // overflows by a hair).
        const spills = (n: HTMLElement) => {
          for (let p: HTMLElement | null = n; p && p !== el; p = p.parentElement)
            if (p.clientWidth > 0 && p.scrollWidth > p.clientWidth + 1) return true;
          return false;
        };
        for (const n of nowrap) {
          if (spills(n))
            out.push(
              n.dataset.looped !== undefined
                ? `the looped words ${snippet(n)} must fit on one line; loop fewer words`
                : `${snippet(n)} is too long for its line`,
            );
        }
        // Names and items that may only take so many lines (data-max-lines).
        for (const n of capped) {
          const lh = parseFloat(getComputedStyle(n).lineHeight);
          // Room a loop reserves round its words isn't a line.
          let extra = 0;
          n.querySelectorAll<HTMLElement>("[data-looped]").forEach((l) => {
            const st = getComputedStyle(l);
            extra += parseFloat(st.marginTop) + parseFloat(st.marginBottom);
          });
          const lines = lh > 0 ? Math.round((n.offsetHeight - extra) / lh) : 1;
          const max = Number(n.dataset.maxLines);
          if (lines > max) out.push(`${snippet(n)} wraps to ${lines} lines; it may take ${max}. Shorten it`);
        }
        return out;
      };
      const tryScale = (k: number) => {
        el.style.width = `${COL_W / k}px`;
        el.style.setProperty("--fit", String(k));
        return el.offsetHeight * k <= COL_H * FILL + 0.5 && overflow().length === 0;
      };
      let chosen = 0;
      for (let k = MAX_FIT; k >= 1 - 1e-6; k -= 0.025) {
        if (tryScale(k)) {
          chosen = k;
          break;
        }
      }
      const problems: string[] = [];
      if (chosen === 0) {
        tryScale(1);
        const h = el.offsetHeight;
        if (h > COL_H * FILL)
          problems.push(
            `its content is ${Math.round(h)} px tall, and the safe zone holds ${Math.round(COL_H * FILL)} px. Shorten the copy, drop the motif, kicker or hook, or use fewer items`,
          );
        problems.push(...overflow());
        chosen = 1;
      }
      // Legibility: every piece of type, at the chosen scale, on screen.
      el.querySelectorAll<HTMLElement>("[data-pd-social]").forEach((n) => {
        if (!(n.textContent ?? "").trim()) return;
        const px = parseFloat(getComputedStyle(n).fontSize) * chosen;
        const min = n.dataset.pdSocial === "metadata" ? MIN_LABEL : MIN_READ;
        if (px < min - 0.5)
          problems.push(
            `${snippet(n)} would be ${Math.round(px)} px on screen; the minimum is ${min}. There is too much copy for the scene to be set big enough: shorten it`,
          );
      });
      loops.forEach((l) => (l.style.display = ""));
      el.style.width = "";
      el.style.removeProperty("--fit");
      if (problems.length > 0) {
        cancelRender(
          new Error(`Insert scene ${c.index} (${c.scene.type}) doesn't fit:\n  - ${[...new Set(problems)].join("\n  - ")}`),
        );
        return;
      }
      flushSync(() => setFit(chosen));
      continueRender(handle);
    });
    return () => {
      live = false;
    };
    // Measured once: the copy never changes inside a render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const center = c.scene.align === "center";
  const k = fit ?? 1;
  return (
    <div
      style={{
        position: "absolute",
        left: SAFE.left,
        top: SAFE.top,
        width: COL_W,
        height: COL_H,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        ref={ref}
        style={{
          position: "relative",
          flex: "none",
          width: COL_W / k,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: center ? "center" : "stretch",
          textAlign: center ? "center" : "left",
          gap,
          color: ink,
          transformOrigin: "50% 50%",
          transform: `translateY(${-OPTICAL}px) scale(${k})`,
          ["--fit" as string]: k,
          ...style,
        }}
      >
        <FitContext.Provider value={k}>{children}</FitContext.Provider>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- arrivals

// How block i arrives: it rises a little and fades in, or (for "type") it is
// simply there and its words type on.
export const enterStyle = (c: SceneCtx, at: number, lift = 34): React.CSSProperties => {
  if (c.scene.entry === "type") return { opacity: c.f >= at ? 1 : 0 };
  const o = mix(c.f, [at, at + 7], ease.out);
  const y = c.moving ? 0 : lift * (1 - mix(c.f, [at, at + 15], ease.out));
  return { opacity: o, translate: `0 ${y}px` };
};

export const Block: React.FC<{
  readonly i: number;
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
  readonly lift?: number;
}> = ({ i, children, style, lift }) => {
  const c = useScene();
  return <div style={{ ...style, ...enterStyle(c, blockAt(c, i), lift) }}>{children}</div>;
};

// Text that types on when the scene's entry is "type", and is plain otherwise.
export const Tx: React.FC<{ readonly text: string; readonly i: number; readonly delay?: number }> = ({
  text,
  i,
  delay = 0,
}) => {
  const c = useScene();
  if (c.scene.entry !== "type") return <>{text}</>;
  return <>{typed(text, c.f - blockAt(c, i) - delay, TYPE_RATE)}</>;
};

// A typewriter label, the way a call sheet labels its boxes.
export const Label: React.FC<{ readonly text: string; readonly i: number; readonly color?: string }> = ({
  text,
  i,
  color = labelInk,
}) => {
  const c = useScene();
  return (
    <div data-pd-social="metadata" style={{ color }}>
      {typed(text, c.f - blockAt(c, i), 2.2)}
    </div>
  );
};

export const Rule: React.FC<{ readonly i: number; readonly strong?: boolean }> = ({ i, strong }) => {
  const c = useScene();
  const p = mix(c.f, [blockAt(c, i), blockAt(c, i) + 14], ease.out);
  return (
    <div
      style={{
        height: strong ? 3 : 2,
        backgroundColor: strong ? cs.ruleStrong : rule,
        transformOrigin: c.scene.align === "center" ? "50% 50%" : "0 50%",
        scale: `${p} 1`,
        alignSelf: "stretch",
      }}
    />
  );
};

// ---------------------------------------------------------------- the slip

// One piece of paper on the ground: the object of the scene. It slides up into
// place (entry "slide" brings it from further away) with a soft contact shadow.
export const Slip: React.FC<{
  readonly children: React.ReactNode;
  readonly i?: number;
  readonly pad?: string;
  readonly width?: number | string;
  readonly style?: React.CSSProperties;
}> = ({ children, i = 0, pad = "52px 56px 56px", width, style }) => {
  const c = useScene();
  const at = blockAt(c, i) - 2;
  const slide = c.scene.entry === "slide";
  const k = mix(c.f, [at, at + (slide ? 20 : 14)], ease.out);
  const dy = c.moving ? 0 : (slide ? 420 : 50) * (1 - k);
  const tilt = (c.seed - 0.5) * 1.6; // under a degree either way
  const rot = tilt + (slide ? (1 - k) * 3 : 0);
  return (
    <div
      style={{
        position: "relative",
        alignSelf: width ? "center" : "stretch",
        width,
        padding: pad,
        backgroundColor: slipHex(c.scene.ground),
        boxShadow: "0 1px 2px rgba(40, 30, 20, 0.16), 0 14px 34px rgba(40, 30, 20, 0.13)",
        opacity: slide ? mix(c.f, [at, at + 4]) : mix(c.f, [at, at + 8], ease.out),
        translate: `0 ${dy}px`,
        rotate: `${rot}deg`,
        display: "flex",
        flexDirection: "column",
        gap: 28,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ---------------------------------------------------------------- the hand

// How a hand circles something: the nib lands, gathers speed, runs round.
const pen = Easing.bezier(0.42, 0.0, 0.78, 0.88);
export const LOOP_FRAMES = 17;

// The brand's own marker loop, drawn round whatever it wraps. It measures its
// content once the fonts are in, and keeps the loop's proportions within
// reason so the stroke never looks stretched.
export const Circled: React.FC<{
  readonly at: number;
  readonly children: React.ReactNode;
  readonly on?: boolean;
  readonly id: string;
  // How far the loop may reach left of the words (a list's tick box sits
  // there): the loop shifts right to keep clear of it.
  readonly maxLeft?: number;
}> = ({ at, children, on = true, id, maxLeft }) => {
  const c = useScene();
  const fitK = useContext(FitContext);
  const ref = useRef<HTMLSpanElement>(null);
  const [box, setBox] = useState<{ w: number; h: number } | null>(null);
  const [handle] = useState(() => (on ? delayRender("Measuring a loop") : null));
  // The first measurement waits for fonts and the canvas (whenLaidOut) and
  // releases the render; this one catches any later change of size.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!on || !el) return;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (w > 0 && (!box || Math.abs(box.w - w) > 0.5 || Math.abs(box.h - h) > 0.5)) setBox({ w, h });
  }, [on, box, fitK]);
  useLayoutEffect(() => {
    if (handle === null) return;
    let live = true;
    whenLaidOut(ref.current).then(() => {
      if (!live) return continueRender(handle);
      const el = ref.current;
      // Commit the loop before releasing the frame, or a still can miss it.
      if (el && el.offsetWidth > 0) flushSync(() => setBox({ w: el.offsetWidth, h: el.offsetHeight }));
      continueRender(handle);
    });
    return () => {
      live = false;
    };
  }, [handle]);
  const p = c.f <= at ? 0 : c.f >= at + LOOP_FRAMES ? 1 : pen((c.f - at) / LOOP_FRAMES);
  let svg: React.ReactNode = null;
  let loopH = 0;
  if (on && box) {
    const [x0, y0, x1, y1] = DATE_RING.box;
    const a0 = (x1 - x0) / (y1 - y0);
    let lw = box.w * 1.1 + 44;
    let lh = box.h * 1.08 + 26;
    const a = lw / lh;
    const stretch = 1.6;
    // A long phrase: rather than a tall loop that crosses the lines around
    // it, the same hand's centre line flattens round it at an even width.
    const flat = a > a0 * stretch;
    if (a < a0 / stretch) lw = lh * (a0 / stretch);
    if (flat) {
      lw = box.w * 1.1 + 56;
      lh = box.h * 1.5 + 18;
    }
    // The flat loop: the nib's own samples, mapped to the frame, stroked evenly.
    const flatD = flat
      ? DATE_RING.samples
          .map(([x, y], k) => `${k === 0 ? "M" : "L"}${(((x - x0) / (x1 - x0)) * lw).toFixed(1)} ${(((y - y0) / (y1 - y0)) * lh).toFixed(1)}`)
          .join(" ")
      : "";
    const reach = Math.min((lw - box.w) / 2 + 4, maxLeft ?? Infinity);
    const place: React.CSSProperties = {
      position: "absolute",
      left: -reach,
      top: (box.h - lh) / 2 + 3,
      overflow: "visible",
      pointerEvents: "none",
    };
    svg = flat ? (
      <svg data-loop="" width={lw} height={lh} style={place}>
        {p > 0.0005 ? (
          <path
            d={flatD}
            fill="none"
            stroke={marker}
            strokeWidth={11}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            strokeDasharray={`${Math.min(p, 1)} 2`}
          />
        ) : null}
      </svg>
    ) : (
      <svg data-loop="" viewBox={`${x0} ${y0} ${x1 - x0} ${y1 - y0}`} preserveAspectRatio="none" width={lw} height={lh} style={place}>
        <Loop ring={DATE_RING} progress={p} id={`loop-${id}`} />
      </svg>
    );
    loopH = lh;
  }
  // Reserve the loop's overhang above and below, plus clear paper, so it never
  // touches the lines next to it (in running text this adds the leading
  // round the looped line). The words never wrap inside a loop.
  const reserve = on && box ? Math.max(26, Math.round((loopH - box.h) / 2 + 3 + 20)) : on ? 26 : 0;
  // Not looped: just the words (an inline-block would move the baseline to
  // its last line and stop the text flowing with its neighbours).
  if (!on) return <>{children}</>;
  return (
    <span ref={ref} data-looped={on ? "" : undefined} style={{ position: "relative", display: "inline-block", whiteSpace: on ? "nowrap" : undefined, marginBlock: reserve }}>
      {children}
      {svg}
    </span>
  );
};

// A tick, drawn on with the pen. Red when the ticks are the scene's one red
// mark; ink when the loop is.
export const Tick: React.FC<{ readonly at: number; readonly red: boolean; readonly size?: number }> = ({
  at,
  red,
  size = 70,
}) => {
  const c = useScene();
  const p = mix(c.f, [at, at + 8], Easing.bezier(0.5, 0, 0.6, 1));
  if (p <= 0) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ position: "absolute", left: -8, top: -22, overflow: "visible" }}
    >
      <path
        d="M10 56 C 18 60, 28 70, 38 86 C 50 56, 70 26, 98 4"
        fill="none"
        stroke={red ? marker : ink}
        strokeWidth={red ? 11 : 9}
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength={1}
        strokeDasharray={`${p} 2`}
      />
    </svg>
  );
};

// The empty box a tick lands in.
// Rows that hold one should use alignItems: "first baseline": the box then sits on
// the first line of the item, however much room a loop reserves round it.
export const CheckBox: React.FC<{ readonly tickAt: number; readonly red: boolean }> = ({ tickAt, red }) => (
  <div style={{ position: "relative", width: 52, height: 52, flex: "none", marginBottom: -6 }}>
    <div style={{ position: "absolute", inset: 0, border: `3px solid ${cs.ruleStrong}` }} />
    <Tick at={tickAt} red={red} />
  </div>
);

// A quiet rubber stamp in ink: it thumps down on its beat and sits a little
// crooked. Never red.
export const Stamp: React.FC<{ readonly text: string; readonly at: number }> = ({ text, at }) => {
  const c = useScene();
  const t = c.f - at;
  const on = t >= 0;
  const k = on ? Math.exp(-t / 2.2) : 1;
  return (
    <div
      data-pd-social="metadata"
      style={{
        alignSelf: c.scene.align === "center" ? "center" : "flex-start",
        padding: "10px 18px 8px",
        border: `4px solid ${ink}`,
        outline: `2px solid ${ink}`,
        outlineOffset: 4,
        color: ink,
        opacity: on ? 0.72 : 0,
        rotate: `${-4 + (c.seed - 0.5) * 3}deg`,
        scale: `${1 + 0.18 * k}`,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
};

// ---------------------------------------------------------------- numbers

// Counts up to an amount, keeping its currency and separators. The finished
// amount holds the space, so nothing reflows as digits arrive.
export const CountUp: React.FC<{ readonly text: string; readonly at: number; readonly frames?: number }> = ({
  text,
  at,
  frames = 22,
}) => {
  const c = useScene();
  // The guard: the count must land on the spec's amount exactly ("$1.2m"
  // stays "$1.2m"). Validation checks this too; this catches custom use.
  if (countText(text, 1) !== text)
    throw new Error(`Count-up of "${text}" would land on "${countText(text, 1)}"; use the type reveal`);
  const k = mix(c.f, [at, at + frames], Easing.bezier(0.2, 0.6, 0.3, 1));
  const now = countText(text, k) ?? text;
  const center = c.scene.align === "center";
  return (
    <span style={{ position: "relative", display: "inline-block", fontVariantNumeric: "tabular-nums" }}>
      <span style={{ visibility: "hidden" }}>{text}</span>
      <span
        style={{
          position: "absolute",
          top: 0,
          left: center ? "50%" : 0,
          translate: center ? "-50% 0" : undefined,
          whiteSpace: "nowrap",
          opacity: c.f >= at ? 1 : 0,
        }}
      >
        {now}
      </span>
    </span>
  );
};

// ---------------------------------------------------------------- hook & kicker

// The Reel's own words: a typewriter kicker and/or a headline hook.
export const KickerHook: React.FC<{ readonly i: number }> = ({ i }) => {
  const c = useScene();
  const { kicker, hook } = c.scene;
  return (
    <>
      {kicker ? (
        <Block i={i}>
          <Label text={kicker} i={i} />
        </Block>
      ) : null}
      {hook ? (
        <Block i={i + (kicker ? 1 : 0)}>
          <div data-pd-social={[...hook].length <= 22 ? "headline" : "subhead"}>
            <Tx text={hook} i={i + (kicker ? 1 : 0)} />
          </div>
        </Block>
      ) : null}
    </>
  );
};

// How many blocks KickerHook uses.
export const khCount = (s: Scene) => (s.kicker ? 1 : 0) + (s.hook ? 1 : 0);
