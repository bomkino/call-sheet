import "../brand/fonts";
import type React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Easing, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { cs } from "../brand/palette";
import { ease, mix } from "../lib/motion";
import { sizeOf } from "../sizes";
import { CIRCLED } from "./calls";
import { earClip, Flap, Underneath } from "./DogEar";
import { type Layout, layoutFor, LOOP_CENTRE } from "./layout";
import { Logo } from "./Logo";
import { Loop } from "./Loop";
import { LOGO } from "./marks";
import { Light, Tooth } from "./Paper";
import { typed } from "./reveal";
import { Sheet } from "./Sheet";
import { type Frames, TIMELINES, type Variant } from "./time";

// "Circle the one." A printed call sheet: real calls arrive soonest first, the
// camera leans in, and a red marker loops one date. The loop is the brand's
// own hand, so it carries across a cut and comes to rest round Call in the
// logo. The corner folds down into the brand's red dog-ear (a saved page),
// showing November's blue pages underneath. The 2s sting is that ending alone.

// How a hand circles something: the nib lands, gathers speed, runs round and
// flicks out fastest at the end.
const pen = Easing.bezier(0.42, 0.0, 0.78, 0.88);
const fold = Easing.bezier(0.55, 0.0, 0.25, 1.0);

const loopProgress = (frame: number, a: number, b: number) =>
  frame <= a ? 0 : frame >= b ? 1 : pen((frame - a) / (b - a));

const Page: React.FC<{
  readonly W: number;
  readonly H: number;
  readonly children: React.ReactNode;
  readonly transform: string;
  readonly toothOffset?: [number, number];
}> = ({ W, H, children, transform }) => (
  <AbsoluteFill style={{ transformOrigin: "0 0", transform }}>
    <div style={{ position: "absolute", left: -W, top: -H, width: 3 * W, height: 3 * H, backgroundColor: cs.paper }} />
    {children}
    <div style={{ position: "absolute", left: -W, top: -H, width: 3 * W, height: 3 * H }}>
      <Tooth offset={[0, 0]} />
    </div>
  </AbsoluteFill>
);

// Where the circled date sits on the sheet.
const circledCentre = (L: Layout) => ({
  x: L.sheet.left + L.sheet.dateW / 2,
  y: L.sheet.rowsTop + CIRCLED * L.sheet.rowH + L.sheet.rowH / 2 + L.dateDy,
});

// The logo's loop centre on screen, which the camera lines the date up on.
const logoLoopCentre = (E: Layout["end"]) => ({
  x: E.logoX + LOOP_CENTRE.x * E.logoScale,
  y: E.logoY + LOOP_CENTRE.y * E.logoScale,
});

const END_SETTLE = 0.93; // the logo page is still pushing in when we cut to it
const LEAN = 1.08; // the last push into the loop before the cut

const SheetShot: React.FC<{ readonly L: Layout; readonly W: number; readonly H: number; readonly F: Frames }> = ({
  L, W, H, F,
}) => {
  const frame = useCurrentFrame();
  const D = circledCentre(L);
  const P = logoLoopCentre(L.end);
  const sCut = (END_SETTLE * L.end.logoScale) / L.ringScale;
  const cut = F.cut as number;
  const settle = F.settle ?? 0;
  // The dolly drifts down the list as it fills and settles on the circled
  // date, then leans in on it, gathering speed into the cut. The logo page
  // carries that speed on and lets it go (EndShot).
  const k = mix(frame, [0, settle], Easing.bezier(0.4, 0.0, 0.3, 1));
  const sSettle = sCut / LEAN;
  const lean = frame <= settle ? 0 : Math.min(1, (frame - settle) / (cut - settle)) ** 2;
  // Every size reads as a push in: wide frames start a touch wider.
  const s0 = Math.min(1, sSettle / 1.06);
  const s = s0 + (sSettle - s0) * k + (sCut - sSettle) * lean;
  const Fx = W / 2 + (D.x - W / 2) * k;
  const Fy = H * 0.42 + (D.y - H * 0.42) * k;
  const Px = W / 2 + (P.x - W / 2) * k;
  const Py = H * 0.42 + (P.y - H * 0.42) * k;
  const rot = -0.7 * (1 - k);
  const transform = `translate(${Px}px, ${Py}px) rotate(${rot}deg) scale(${s}) translate(${-Fx}px, ${-Fy}px)`;
  const p = loopProgress(frame, F.loopStart, F.loopEnd);
  const r = LOGO.ring;
  const pad = 60;
  const [x0, y0, x1, y1] = r.box;
  const ks = L.ringScale;
  return (
    <Page W={W} H={H} transform={transform}>
      <Sheet L={L.sheet} frame={frame} arrivals={F.rows ?? []} headerAt={F.header ?? 0} />
      <svg
        viewBox={`${x0 - pad} ${y0 - pad} ${x1 - x0 + 2 * pad} ${y1 - y0 + 2 * pad}`}
        width={(x1 - x0 + 2 * pad) * ks}
        height={(y1 - y0 + 2 * pad) * ks}
        style={{
          position: "absolute",
          left: D.x + (x0 - pad - LOOP_CENTRE.x) * ks,
          top: D.y + (y0 - pad - LOOP_CENTRE.y) * ks,
          overflow: "visible",
        }}
      >
        <Loop ring={r} progress={p} id="date" />
      </svg>
    </Page>
  );
};

const EndShot: React.FC<{
  readonly L: Layout;
  readonly W: number;
  readonly H: number;
  readonly F: Frames;
  readonly variant: Variant;
}> = ({ L, W, H, F, variant }) => {
  const frame = useCurrentFrame();
  const E = variant === "5s" ? L.end : L.end2;
  const P = logoLoopCentre(E);
  const from = variant === "5s" ? (F.cut as number) : 0;
  const s0 = variant === "5s" ? END_SETTLE : 0.955;
  const s = s0 + (1 - s0) * mix(frame, [from, from + (variant === "5s" ? 34 : 40)], ease.out);
  const transform = `translate(${P.x}px, ${P.y}px) scale(${s}) translate(${-P.x}px, ${-P.y}px)`;
  const loop = variant === "5s" ? 1 : loopProgress(frame, F.loopStart, F.loopEnd);
  const ear = mix(frame, [F.earStart, F.earEnd], fold);
  const line = (at: number) => ({
    opacity: mix(frame, [at, at + 7], ease.out),
    translate: `0 ${18 * (1 - mix(frame, [at, at + 12], ease.out))}px`,
  });
  return (
    <AbsoluteFill>
      <Underneath W={W} e={E.ear} t={ear} />
      <AbsoluteFill style={{ clipPath: earClip(W, H, E.ear, ear), backgroundColor: cs.paper }}>
        <Page W={W} H={H} transform={transform}>
          <Logo x={E.logoX} y={E.logoY} scale={E.logoScale} loop={loop} id="logo" />
          {variant === "5s" ? (
            <div
              data-pd-social={E.lineRole}
              style={{
                position: "absolute",
                left: E.lineX,
                top: E.lineY,
                color: cs.ink,
                whiteSpace: "nowrap",
                textAlign: E.align,
                translate: E.align === "center" ? "-50% 0" : undefined,
              }}
            >
              <div style={line(F.line1 ?? 0)}>Find film and TV grants, labs</div>
              <div style={line(F.line2 ?? 0)}>and festivals before they close.</div>
            </div>
          ) : null}
          <div
            data-pd-social={E.urlRole}
            style={{
              position: "absolute",
              left: E.urlX,
              top: E.urlY,
              color: cs.ink,
              whiteSpace: "nowrap",
              translate: E.align === "center" ? "-50% 0" : undefined,
            }}
          >
            {typed("pitch.dog/call-sheet", frame - F.url, F.urlRate)}
          </div>
        </Page>
      </AbsoluteFill>
      <Flap W={W} e={E.ear} t={ear} perspective={2400} originY={H * 0.45} />
    </AbsoluteFill>
  );
};

export const Sting: React.FC<{ readonly variant: Variant; readonly audio?: boolean }> = ({ variant, audio = true }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const size = sizeOf(W, H);
  const L = layoutFor(size);
  const tl = TIMELINES[variant];
  const F = tl.frames as Frames;
  const onSheet = variant === "5s" && frame < (F.cut ?? 0);
  return (
    <AbsoluteFill data-pd-canvas={size.canvas} style={{ backgroundColor: cs.paper }}>
      {onSheet ? <SheetShot L={L} W={W} H={H} F={F} /> : <EndShot L={L} W={W} H={H} F={F} variant={variant} />}
      <Light width={W} height={H} />
      {audio ? <Audio name="Score" src={staticFile(`audio/sting-${variant}.wav`)} /> : null}
    </AbsoluteFill>
  );
};
