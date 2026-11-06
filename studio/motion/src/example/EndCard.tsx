import "../brand/fonts";
import type React from "react";
import { Audio } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { brand } from "../brand/brand";
import { Logomark } from "../brand/Logomark";
import { MotionBlur } from "../lib/MotionBlur";
import { ease, hit, mix, track } from "../lib/motion";
import { type Size, sizeOf } from "../sizes";
import { T } from "../timeline";

// An example end card that shows the kit working. The title lands on beats 1
// and 2, a rule wipes in on 3, the logomark fades up on 4, and the whole card
// takes a hit on 5. The score (scripts/make_score.py) puts a sound on each of
// those beats. Replace it with your own scene and keep the layering: backdrop,
// blurred scene, clean overlays, score.

export type EndCardProps = {
  readonly title: string;
  readonly emphasis: string;
};

const GRID = 120;
const slam = Easing.in(Easing.quad);

// Kicks in the score, so the room can breathe with them.
const KICKS = [T.title, T.hit];

// Kept out of the motion blur: averaging many samples of a dark, subtle
// gradient makes visible bands.
const Backdrop: React.FC<{ readonly frame: number; readonly size: Size }> = ({
  frame,
  size,
}) => {
  const pulse = KICKS.reduce((sum, at) => sum + hit(frame, at, 6), 0);
  const glow = 0.06 + 0.05 * mix(frame, [T.title, T.hit]) + 0.06 * pulse;
  return (
    <AbsoluteFill style={{ backgroundColor: brand.room }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${brand.grid} 2px, transparent 2px), linear-gradient(90deg, ${brand.grid} 2px, transparent 2px)`,
          backgroundSize: `${GRID}px ${GRID}px`,
          backgroundPosition: `${size.safe.left - 1}px ${size.safe.top - 1}px`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse ${size.width * 0.7}px ${size.height * 0.4}px at ${size.safe.left + 200}px 50%, rgba(247, 163, 211, ${glow}), transparent 70%)`,
        }}
      />
    </AbsoluteFill>
  );
};

// The moving type. Each line arrives at speed and lands on its beat, so the
// blur smears it on the way in, then it squashes and settles. Inside
// <MotionBlur>, read the frame with useCurrentFrame() rather than a prop: each
// blur sample sees its own point in time between frames.
const Title: React.FC<{
  readonly size: Size;
  readonly title: string;
  readonly emphasis: string;
}> = ({ size, title, emphasis }) => {
  const frame = useCurrentFrame();
  const rise = track(frame, [
    { f: T.title - 4, v: 240 },
    { f: T.title, v: 0, e: slam },
    { f: T.title + 3, v: -10, e: ease.out },
    { f: T.title + 8, v: 0 },
  ]);
  const squash = hit(frame, T.title, 2.5);
  const whip = track(frame, [
    { f: T.emphasis - 4, v: 320 },
    { f: T.emphasis, v: 0, e: slam },
    { f: T.emphasis + 3, v: -12, e: ease.out },
    { f: T.emphasis + 8, v: 0 },
  ]);
  const wipe = mix(frame, [T.rule - 3, T.rule], slam);
  const punch = 1 + 0.035 * hit(frame, T.hit, 5);
  return (
    <AbsoluteFill
      style={{
        padding: `${size.safe.top}px ${size.safe.right}px ${size.safe.bottom}px ${size.safe.left}px`,
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      {/* Each element carries its own transform. Inside <MotionBlur>, a scale
          on an element that holds other transformed elements made Chrome
          drop the text's anti-aliasing in the blur samples. */}
      <div
        data-pd-social="display"
        style={{
          color: brand.ink,
          opacity: mix(frame, [T.title - 4, T.title - 2]),
          transformOrigin: "0 100%",
          translate: `0 ${rise}px`,
          scale: `${(1 + 0.04 * squash) * punch} ${(1 - 0.07 * squash) * punch}`,
        }}
      >
        {title}
      </div>
      <div
        data-pd-social="display"
        style={{
          opacity: mix(frame, [T.emphasis - 4, T.emphasis - 2]),
          transformOrigin: "0 100%",
          translate: `${whip}px 0`,
          scale: `${punch}`,
        }}
      >
        {/* The governed Head italic. Its rule reads --pd-wght, which the
            social roles don't set in type system v3.0.0, so it is set here
            to the display role's own weight. */}
        <span
          data-pd-emphasis="head-italic"
          style={{ color: brand.pink, ["--pd-wght" as string]: 600 }}
        >
          {emphasis}
        </span>
      </div>
      <div
        style={{
          marginTop: 40,
          width: wipe * Math.min(360, (size.width - size.safe.left) * 0.4),
          height: 10,
          backgroundColor: brand.pink,
        }}
      />
    </AbsoluteFill>
  );
};

// The square logomark sits alone in the top-right corner of the safe area,
// clean: it only ever fades. The brand kit says 112 px; 136 because the
// team found 112 too small in the Pointing Paws outro.
const Mark: React.FC<{ readonly frame: number; readonly size: Size }> = ({
  frame,
  size,
}) => (
  <Logomark
    size={136}
    color={brand.logo.pink}
    style={{
      position: "absolute",
      top: size.safe.top,
      right: size.safe.right,
      opacity: 0.95 * mix(frame, [T.mark, T.mark + 5], ease.out),
    }}
  />
);

// Sub-frame samples per frame: plenty while things move, one once the card
// has settled, which renders much faster.
const blurSamples = (frame: number) => (frame < T.end ? 48 : 1);

export const EndCard: React.FC<EndCardProps> = ({ title, emphasis }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const size = sizeOf(width, height);
  return (
    <AbsoluteFill data-pd-canvas={size.canvas}>
      <Backdrop frame={frame} size={size} />
      <MotionBlur
        width={width}
        height={height}
        samples={blurSamples(frame)}
        shutterAngle={200}
      >
        <Title size={size} title={title} emphasis={emphasis} />
      </MotionBlur>
      <Mark frame={frame} size={size} />
      <Audio name="Score" src={staticFile("audio/score.wav")} />
    </AbsoluteFill>
  );
};
