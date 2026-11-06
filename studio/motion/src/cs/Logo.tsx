import type React from "react";
import { cs } from "../brand/palette";
import { Loop } from "./Loop";
import { LOGO } from "./marks";

// The logo, "Call Sheet" with Call circled, from the brand's outlines. It is
// placed by its origin (the baseline at the left of the C) and a scale in px
// per logo unit (the wordmark is drawn at 100 units).
export const Logo: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly scale: number;
  readonly loop: number;
  readonly id: string;
  readonly sheetOpacity?: number;
  readonly callOpacity?: number;
}> = ({ x, y, scale, loop, id, sheetOpacity = 1, callOpacity = 1 }) => {
  const pad = 60;
  const [x0, y0, x1, y1] = LOGO.box;
  const w = x1 - x0 + 2 * pad;
  const h = y1 - y0 + 2 * pad;
  return (
    <svg
      viewBox={`${x0 - pad} ${y0 - pad} ${w} ${h}`}
      width={w * scale}
      height={h * scale}
      style={{
        position: "absolute",
        left: x + (x0 - pad) * scale,
        top: y + (y0 - pad) * scale,
        overflow: "visible",
      }}
    >
      <path d={LOGO.call} fill={cs.ink} opacity={callOpacity} />
      <path d={LOGO.sheet} fill={cs.ink} opacity={sheetOpacity} />
      <Loop ring={LOGO.ring} progress={loop} id={id} />
    </svg>
  );
};
