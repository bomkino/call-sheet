import type React from "react";
import { AbsoluteFill, cancelRender, continueRender, delayRender, staticFile } from "remotion";

// The paper's tooth is a tiled CSS background, which Remotion can't wait for
// on its own, so it is loaded and decoded here, once per tab, before any frame
// renders. Every tile below then paints from memory.
export const TOOTH = staticFile("paper/tooth.png");
const toothReady = delayRender("Loading the paper tooth");
const toothImage = new Image();
toothImage.src = TOOTH;
toothImage
  .decode()
  .then(() => continueRender(toothReady))
  .catch((err) => cancelRender(err));

// The paper's tooth, laid over whatever sits on the page with soft-light, so
// paper and ink both sink into it. It lives inside the page, so it travels
// with the camera like the page does.
export const Tooth: React.FC<{
  readonly opacity?: number;
  readonly offset?: [number, number];
}> = ({ opacity = 1, offset = [0, 0] }) => (
  <AbsoluteFill
    style={{
      // eslint-disable-next-line @remotion/no-background-image -- preloaded above
      backgroundImage: `url(${TOOTH})`,
      backgroundSize: "1024px 1024px",
      backgroundPosition: `${-offset[0]}px ${-offset[1]}px`,
      mixBlendMode: "soft-light",
      opacity,
      pointerEvents: "none",
    }}
  />
);

// Warm window light from the top left, falling off across the desk. It is
// light, not a graphic: a few percent at most, in screen space.
export const Light: React.FC<{
  readonly width: number;
  readonly height: number;
  readonly strength?: number;
}> = ({ width, height, strength = 1 }) => {
  const r = Math.hypot(width, height);
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(${r * 0.75}px ${r * 0.62}px at ${width * 0.22}px ${height * 0.12}px, rgba(255, 246, 228, ${0.0}) 0%, rgba(255, 246, 228, 0) 45%, rgba(92, 70, 40, ${0.085 * strength}) 100%)`,
        mixBlendMode: "multiply",
        pointerEvents: "none",
      }}
    />
  );
};
