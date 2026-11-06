import "../brand/fonts";
import type React from "react";
import { AbsoluteFill, Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { cs } from "../brand/palette";
import { ease, mix } from "../lib/motion";
import { sizeOf } from "../sizes";
import { layoutFor, LOOP_CENTRE } from "./layout";
import { Logo } from "./Logo";
import { Loop } from "./Loop";
import { LOGO, nibAt } from "./marks";
import { Light, Tooth } from "./Paper";

// Exploration only: two other ideas, mocked quickly to compare with the
// chosen one. Not part of the deliverables.

// B. Revision riffle: the pages flip over the top like a pad on a clipboard,
// each a month's colour with its own circled date, the loop always in the
// same place, landing on the paper page with the logo.
const PAGES = [
  { color: cs.white, date: "20 Oct" },
  { color: cs.blue, date: "31 Oct" },
  { color: cs.pink, date: "3 Nov" },
  { color: cs.yellow, date: "1 Dec" },
];

export const ExploreRiffle: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const L = layoutFor(sizeOf(W, H));
  const E = L.end;
  const r = LOGO.ring;
  const pad = 60;
  const [x0, y0, x1, y1] = r.box;
  const ring = (k: number, id: string) => (
    <svg
      viewBox={`${x0 - pad} ${y0 - pad} ${x1 - x0 + 2 * pad} ${y1 - y0 + 2 * pad}`}
      width={(x1 - x0 + 2 * pad) * E.logoScale}
      height={(y1 - y0 + 2 * pad) * E.logoScale}
      style={{ position: "absolute", left: E.logoX + (x0 - pad) * E.logoScale, top: E.logoY + (y0 - pad) * E.logoScale, overflow: "visible" }}
    >
      <Loop ring={r} progress={k} id={id} />
    </svg>
  );
  const flipAt = (i: number) => 10 + i * 7;
  return (
    <AbsoluteFill data-pd-canvas="story" style={{ backgroundColor: cs.paper, perspective: 2600 }}>
      <Logo x={E.logoX} y={E.logoY} scale={E.logoScale} loop={1} id="rlogo" />
      <Tooth />
      {PAGES.map((_, i) => {
        const j = PAGES.length - 1 - i;
        const pg = PAGES[j];
        const a = mix(frame, [flipAt(j), flipAt(j) + 9], Easing.bezier(0.5, 0, 0.3, 1));
        if (a >= 1) return null;
        return (
          <AbsoluteFill
            key={j}
            style={{
              backgroundColor: pg.color,
              transformOrigin: "50% 0",
              transform: `rotateX(${a * 178}deg)`,
              backfaceVisibility: "hidden",
              boxShadow: `0 ${10 + 30 * a}px ${30 + 40 * a}px rgba(40,30,20,${0.12 + 0.2 * a})`,
            }}
          >
            <div
              data-pd-social="display"
              style={{
                position: "absolute",
                left: E.logoX + LOOP_CENTRE.x * E.logoScale - 300,
                width: 600,
                top: E.logoY + LOOP_CENTRE.y * E.logoScale - 70,
                textAlign: "center",
                color: cs.ink,
              }}
            >
              {pg.date}
            </div>
            {ring(j === 0 ? mix(frame, [0, 9], ease.inOut) : 1, `rf${j}`)}
            <Tooth />
          </AbsoluteFill>
        );
      })}
      <Light width={W} height={H} />
    </AbsoluteFill>
  );
};

// C. Macro pull-back: start on the wet nib, a few millimetres of paper filling
// the frame, and pull back as the loop runs round to find the whole logo.
export const ExploreMacro: React.FC = () => {
  const frame = useCurrentFrame();
  const { width: W, height: H } = useVideoConfig();
  const L = layoutFor(sizeOf(W, H));
  const E = L.end;
  const p = mix(frame, [0, 26], Easing.bezier(0.42, 0, 0.78, 0.88));
  const nib = nibAt(LOGO.ring, p);
  const nx = E.logoX + nib.x * E.logoScale;
  const ny = E.logoY + nib.y * E.logoScale;
  const k = mix(frame, [0, 34], Easing.bezier(0.6, 0, 0.2, 1));
  const s = 7 * (1 - k) + 1 * k;
  const Fx = nx * (1 - k) + (W / 2) * k;
  const Fy = ny * (1 - k) + (H / 2) * k;
  return (
    <AbsoluteFill data-pd-canvas="story" style={{ backgroundColor: cs.paper }}>
      <AbsoluteFill
        style={{ transformOrigin: "0 0", transform: `translate(${W / 2}px, ${H / 2}px) scale(${s}) translate(${-Fx}px, ${-Fy}px)` }}
      >
        <div style={{ position: "absolute", inset: -2000, backgroundColor: cs.paper }} />
        <Logo x={E.logoX} y={E.logoY} scale={E.logoScale} loop={p} id="mlogo" />
        <div style={{ position: "absolute", left: -W, top: -H, width: 3 * W, height: 3 * H }}>
          <Tooth />
        </div>
      </AbsoluteFill>
      <Light width={W} height={H} />
    </AbsoluteFill>
  );
};
