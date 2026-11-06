import type React from "react";
import { AbsoluteFill } from "remotion";
import { cs } from "../brand/palette";
import { TOOTH } from "./Paper";

// The dog-ear. The frame is the page, so its own top-right corner folds down
// along a 45-degree crease and lands as the brand's red flap. Under the corner
// is the next edition: November's blue pages.
//
// `t` runs 0 (flat) to 1 (folded). The page above it should be clipped with
// earClip() so the corner's old place shows what is underneath.

export const earClip = (W: number, H: number, e: number, t: number) =>
  t <= 0
    ? "none"
    : `polygon(0 0, ${W - e}px 0, ${W}px ${e}px, ${W}px ${H}px, 0 ${H}px)`;

const deg = (r: number) => (r * 180) / Math.PI;

export const Underneath: React.FC<{
  readonly W: number;
  readonly e: number;
  readonly t: number;
  readonly color?: string;
}> = ({ W, e, t, color = cs.blue }) => {
  if (t <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: W - e,
        top: 0,
        width: e,
        height: e,
        backgroundColor: color,
        clipPath: `polygon(0 0, ${e}px 0, ${e}px ${e}px)`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          // eslint-disable-next-line @remotion/no-background-image -- preloaded in Paper.tsx
              backgroundImage: `url(${TOOTH})`,
          backgroundSize: "1024px 1024px",
          mixBlendMode: "soft-light",
        }}
      />
      {/* The top page's cut edge sits on this sheet and shades it a little. */}
      <div
        style={{
          position: "absolute",
          left: -e * 0.5,
          top: e * 0.5 - 14,
          width: e * 2,
          height: 28,
          transformOrigin: "50% 50%",
          rotate: "45deg",
          background:
            "linear-gradient(180deg, rgba(40,30,20,0) 0%, rgba(40,30,20,0.0) 35%, rgba(40,30,20,0.16) 50%, rgba(40,30,20,0) 100%)",
          filter: "blur(4px)",
        }}
      />
    </div>
  );
};

export const Flap: React.FC<{
  readonly W: number;
  readonly e: number;
  readonly t: number;
  readonly perspective: number;
  readonly originY: number;
}> = ({ W, e, t, perspective, originY }) => {
  if (t <= 0) return null;
  const theta = Math.PI * Math.min(t, 1);
  const h = (e / Math.SQRT2) * Math.sin(theta); // tip's height off the page
  const c = Math.cos(theta);
  // The tip's shadow on the page: light from above, a little to the right.
  const tipX = e / 2 + (e / 2) * c - 0.12 * h;
  const tipY = e / 2 - (e / 2) * c + 0.42 * h;
  const blur = 2.5 + 0.14 * h;
  const shadowA = 0.34 - 0.12 * Math.sin(theta);
  const frontShade = 0.22 * Math.sin(theta) ** 1.2;
  const backShade = 0.42 * Math.sin(theta) ** 1.1;
  const r = Math.min(10, e * 0.06); // the brand's flap has a soft tip
  return (
    <AbsoluteFill style={{ perspective, perspectiveOrigin: `${W / 2}px ${originY}px`, pointerEvents: "none" }}>
      {/* contact shadow on the page */}
      <svg
        width={e + 80}
        height={e + 120}
        viewBox={`-40 -20 ${e + 80} ${e + 120}`}
        style={{ position: "absolute", left: W - e - 40, top: -20, overflow: "visible" }}
      >
        <defs>
          <filter id="ear-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={blur} />
          </filter>
        </defs>
        <path
          d={`M0 0 L${tipX} ${tipY} L${e} ${e} Z`}
          fill={`rgba(46, 32, 18, ${shadowA})`}
          filter="url(#ear-shadow)"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: W - e,
          top: 0,
          width: e,
          height: e,
          transformOrigin: "0 0",
          transformStyle: "preserve-3d",
          transform: `rotate3d(1, 1, 0, ${-deg(theta)}deg)`,
        }}
      >
        {/* front: the page's own corner, paper side up */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            backgroundColor: cs.paper,
            clipPath: `polygon(0 0, ${e}px 0, ${e}px ${e}px)`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              // eslint-disable-next-line @remotion/no-background-image -- preloaded in Paper.tsx
              backgroundImage: `url(${TOOTH})`,
              backgroundSize: "1024px 1024px",
              backgroundPosition: `${-(W - e)}px 0px`,
              mixBlendMode: "soft-light",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(225deg, rgba(60,44,24,${frontShade * 0.4}) 0%, rgba(60,44,24,${frontShade}) 70%)`,
            }}
          />
        </div>
        {/* back: the brand's red flap */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            transformOrigin: `${e / 2}px ${e / 2}px`,
            transform: "rotate3d(1, -1, 0, 180deg)",
            backgroundColor: cs.marker,
            clipPath: `path("M0 0 L${e - r} 0 Q${e} 0 ${e} ${r} L${e} ${e} Z")`,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              // eslint-disable-next-line @remotion/no-background-image -- preloaded in Paper.tsx
              backgroundImage: `url(${TOOTH})`,
              backgroundSize: "1024px 1024px",
              mixBlendMode: "soft-light",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(45deg, rgba(40,10,4,${backShade}) 20%, rgba(40,10,4,${backShade * 0.5}) 100%)`,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
