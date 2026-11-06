import "../brand/fonts";
import type React from "react";
import { useMemo } from "react";
import { AbsoluteFill, type CalculateMetadataFunction, Sequence, useCurrentFrame } from "remotion";
import { Light, Tooth } from "../cs/Paper";
import { ease, mix } from "../lib/motion";
import { dirVec, groundHex, hash, H, SceneProvider, W } from "./kit";
import { SceneBody } from "./scenes";
import {
  durationInFrames,
  type InsertSpec,
  OUT_FRAMES,
  sceneFrames,
  type Scene,
  validateSpec,
} from "./schema.mjs";

// A Reel insert: 1–3 scenes from a JSON spec (SPEC.md), 1080x1920 at 30 fps,
// silent. The ground is a page; each scene is one object on it.

export type InsertProps = { readonly spec: Record<string, unknown> };

const PAGE_FRAMES = 11; // a new page sliding over the last
const IN_FRAMES = 15; // the column arriving with the camera move before the cut

// How far off-frame a move starts or ends.
const away = (d: Scene["inFrom"]) => {
  const [x, y] = dirVec(d);
  return [x * (W + 80), y * (H * 0.62)] as const;
};

const SceneShell: React.FC<{
  readonly s: Scene;
  readonly index: number;
  readonly dur: number;
  readonly last: boolean;
  readonly outTo: InsertSpec["outTo"];
}> = ({ s, index, dur, last, outTo }) => {
  const f = useCurrentFrame();
  const page = index > 0 && s.transition === "page";
  const moving = !page && s.inFrom !== "none";
  // A page slides in over the last one from its inFrom side (default: up from below).
  const pageK = page ? mix(f, [0, PAGE_FRAMES], ease.out) : 1;
  const [px, py] = away(page ? (s.inFrom === "none" ? "down" : s.inFrom) : "none");
  // The column rides in with the camera move before the cut.
  const inK = moving ? mix(f, [0, IN_FRAMES], ease.out) : 1;
  const [ix, iy] = away(moving ? s.inFrom : "none");
  // And leaves with the move after it.
  const outK = last && outTo !== "none" ? mix(f, [dur - OUT_FRAMES, dur], ease.in) : 0;
  const [ox, oy] = away(outTo);
  const ctx = useMemo(
    () => ({
      dur,
      index,
      scene: s,
      base: page ? 6 : moving ? 3 : 0,
      moving,
      seed: hash(JSON.stringify(s)),
    }),
    [dur, index, s, page, moving],
  );
  return (
    <SceneProvider value={{ ...ctx, f }}>
      <AbsoluteFill
        style={{
          translate: `${px * (1 - pageK)}px ${py * (1 - pageK)}px`,
          boxShadow: page && pageK < 1 ? "0 -10px 40px rgba(40, 30, 20, 0.18)" : undefined,
          backgroundColor: groundHex(s.ground),
        }}
      >
        <AbsoluteFill
          style={{
            translate: `${ix * (1 - inK) + ox * outK}px ${iy * (1 - inK) + oy * outK}px`,
          }}
        >
          <SceneBody s={s} />
        </AbsoluteFill>
      </AbsoluteFill>
    </SceneProvider>
  );
};

export const Insert: React.FC<InsertProps> = ({ spec }) => {
  const S = useMemo(() => validateSpec(spec), [spec]);
  const frames = sceneFrames(S);
  return (
    <AbsoluteFill data-pd-canvas="story" style={{ backgroundColor: groundHex(S.scenes[0].ground) }}>
      {S.scenes.map((s, i) => {
        const last = i === S.scenes.length - 1;
        // Each scene stays up under the next one's page turn.
        const extra = last ? 0 : PAGE_FRAMES + 2;
        return (
          <Sequence key={i} from={frames[i].from} durationInFrames={frames[i].dur + extra} name={`${i} ${s.type}`}>
            <SceneShell s={s} index={i} dur={frames[i].dur} last={last} outTo={S.outTo} />
          </Sequence>
        );
      })}
      <Tooth opacity={0.9} />
      <Light width={W} height={H} strength={0.8} />
    </AbsoluteFill>
  );
};

export const calculateInsertMetadata: CalculateMetadataFunction<InsertProps> = ({ props }) => {
  const S = validateSpec(props.spec);
  return { durationInFrames: durationInFrames(S) };
};
