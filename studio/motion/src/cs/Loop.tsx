import type React from "react";
import { cs } from "../brand/palette";
import type { Ring } from "./marks";

// The marker loop, drawn on the way the brand's web logo does it: the outline
// is revealed by a mask that follows the pen's centre line (pathLength 1), so
// it draws like a real nib. Where the overshoot crosses the start, a marker
// lays ink twice, so that patch is a touch darker. The edge is roughened a
// hair by the paper's tooth.
//
// Returns SVG content: place it inside an <svg> whose user units are the
// ring's own (logo units).
export const Loop: React.FC<{
  readonly ring: Ring;
  readonly progress: number;
  readonly id: string;
  readonly color?: string;
}> = ({ ring, progress, id, color = cs.marker }) => {
  if (progress <= 0.0005) return null;
  const p = Math.min(progress, 1);
  const full = p >= 0.9995;
  return (
    <g>
      <defs>
        <mask id={`${id}-pen`} maskUnits="userSpaceOnUse" x="-400" y="-400" width="1200" height="800">
          {full ? (
            <rect x="-400" y="-400" width="1200" height="800" fill="#fff" />
          ) : (
            <path
              d={ring.pen}
              pathLength={1}
              fill="none"
              stroke="#fff"
              strokeWidth={ring.maskWidth}
              strokeLinecap="round"
              strokeDasharray={`${p} 2`}
            />
          )}
        </mask>
        <filter id={`${id}-tooth`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="2" seed="4" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.1" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g mask={`url(#${id}-pen)`} filter={`url(#${id}-tooth)`}>
        <path d={ring.d} fill={color} />
        <path d={ring.overlap} fill="#7a1a0c" opacity={0.2} />
      </g>
    </g>
  );
};
