import type { Size } from "../sizes";
import { LOGO } from "./marks";

// Every size is laid out for its own frame, not cropped from another. Numbers
// are px in the frame at camera scale 1. Type sizes come from the type
// system's social roles (container units on the canvas); the estimates of
// them below are only for spacing, never to set type.

export type SheetLayout = {
  left: number;
  right: number;
  headerTop: number;
  headerRule: number;
  colTop: number;
  rowsTop: number;
  rowH: number;
  rows: number;
  dateW: number;
  nameX: number;
  givesX?: number; // wide frames: what each call gives gets its own column
  dateRole: "headline" | "display";
  gap: number;
  typeRate: number;
};

export type EndLayout = {
  logoX: number; // logo origin: baseline, left of the C
  logoY: number;
  logoScale: number; // px per logo unit
  lineX: number; // the line's left edge, or its centre when centred
  lineY: number;
  urlX: number;
  urlY: number;
  align: "left" | "center";
  // On landscape frames a phone shows the picture ~390 px wide, so the line
  // takes the headline role (PD Head) and the sign-off the subhead role there.
  lineRole: "subhead" | "headline";
  urlRole: UrlRole;
  ear: number;
};

// The sign-off's role. It is the call to action, so it is set big enough to
// read on a phone: headline on 9:16 and 1:1, subhead or headline on the
// landscape frames, and a step bigger on the 2s, where it is the only words.
// Never a role that would set it wider than the logo.
export type UrlRole = "subhead" | "headline" | "display";

export type Layout = {
  sheet: SheetLayout;
  end: EndLayout; // the 5s: logo, line and sign-off
  end2: EndLayout; // the 2s: the logo and the sign-off only
  // the circled date's visual centre on the sheet, and the loop's scale there
  dateDy: number;
  ringScale: number;
};

// The ellipse centre the logo's loop is drawn around (make_brand.py's
// wordmark): Call's centre, nudged 1 left and 3.5 down.
const [cx0, cy0, cx1, cy1] = LOGO.callBox;
export const LOOP_CENTRE = { x: (cx0 + cx1) / 2 - 1, y: (cy0 + cy1) / 2 + 3.5 };
const [bx0, by0, bx1, by1] = LOGO.box;

// Role sizes, as social.css sets them, for spacing only.
const role = (W: number, H: number, cqi: number, cqb: number) => Math.min((cqi * W) / 100, (cqb * H) / 100);
const subheadPx = (W: number, H: number) => role(W, H, 4.4, 3.9);
const headlinePx = (W: number, H: number) => role(W, H, 7.4, 6.5);
const displayPx = (W: number, H: number) => role(W, H, 10.2, 8.2);
const rolePx = (r: UrlRole, W: number, H: number) =>
  r === "display" ? displayPx(W, H) : r === "headline" ? headlinePx(W, H) : subheadPx(W, H);
// Line height of each role, as social.css sets it, for spacing only.
const leading = { subhead: 1.2, headline: 0.94, display: 0.88 } as const;

// The logo, line and sign-off stacked, the group centred on `cy`. On portrait
// and square frames the line and sign-off hang from the C; on landscape they
// centre under the logo.
const stack = (
  W: number, H: number, S: number, cy: number, withLine: boolean, ear: number, wide: boolean, urlRole: UrlRole,
): EndLayout => {
  const line = wide ? headlinePx(W, H) : subheadPx(W, H);
  const url = rolePx(urlRole, W, H);
  const lineH = withLine ? (wide ? 1.88 : 2.4) * line : 0;
  const gap1 = wide ? 1.05 * line : 2.0 * line;
  // the sign-off sits well clear of the line, as far below it as the line
  // sits below the logo; on the 2s it hangs a role-height under the logo
  const gap2 = withLine ? (wide ? 1.25 * line : 2.0 * line) : 0.95 * url;
  const above = -by0 * S; // ring top to baseline
  const below = by1 * S; // baseline to ring bottom
  const urlH = leading[urlRole] * url;
  const height = above + below + (withLine ? gap1 + lineH : 0) + gap2 + urlH;
  const baseline = cy - height / 2 + above;
  const logoX = W / 2 - ((bx0 + bx1) / 2) * S;
  const cLeft = logoX + cx0 * S;
  const lineY = baseline + below + gap1;
  const x = wide ? W / 2 : cLeft;
  return {
    logoX,
    logoY: baseline,
    logoScale: S,
    lineX: x,
    lineY,
    urlX: x,
    urlY: withLine ? lineY + lineH + gap2 : baseline + below + gap2,
    align: wide ? "center" : "left",
    lineRole: wide ? "headline" : "subhead",
    urlRole,
    ear,
  };
};

// Scope: the logo on the left, the line and sign-off beside it.
const side = (W: number, H: number, S: number, cy: number, ear: number, urlRole: UrlRole): EndLayout => {
  const line = headlinePx(W, H);
  const url = rolePx(urlRole, W, H);
  const textW = 15.4 * line; // the longer line, "and festivals before they close."
  const gap = 1.6 * (cy1 - cy0) * S;
  const logoW = (bx1 - bx0) * S;
  const x0 = (W - (logoW + gap + textW)) / 2;
  const logoX = x0 - bx0 * S;
  const letterMid = ((cy0 + cy1) / 2) * S;
  const baseline = cy - letterMid;
  const gap2 = 1.25 * line;
  const blockH = 1.88 * line + gap2 + leading[urlRole] * url;
  const lineY = cy - blockH / 2;
  return {
    logoX,
    logoY: baseline,
    logoScale: S,
    lineX: x0 + logoW + gap,
    lineY,
    urlX: x0 + logoW + gap,
    urlY: lineY + 1.88 * line + gap2,
    align: "left",
    lineRole: "headline",
    urlRole,
    ear,
  };
};

export const layoutFor = (size: Size): Layout => {
  const { width: W, height: H, safe } = size;
  const wide = W / H > 1.5;
  const head = wide ? displayPx(W, H) : headlinePx(W, H);
  const ringScale = 1.18 * (head / 80);
  const dateDy = 4 * (head / 80);
  const midY = (safe.top + (H - safe.bottom)) / 2;
  switch (size.id) {
    case "1080x1920":
      return {
        sheet: {
          left: 80, right: 1000, headerTop: 172, headerRule: 218, colTop: 236,
          rowsTop: 292, rowH: 180, rows: 9, dateW: 280, nameX: 392, dateRole: "headline", gap: 10, typeRate: 9,
        },
        end: stack(W, H, 1.56, midY + 31, true, 210, false, "headline"),
        end2: stack(W, H, 1.56, midY + 20, false, 210, false, "headline"),
        dateDy,
        ringScale,
      };
    case "1080x1080":
      return {
        sheet: {
          left: 80, right: 1000, headerTop: 64, headerRule: 106, colTop: 122,
          rowsTop: 172, rowH: 152, rows: 9, dateW: 250, nameX: 356, dateRole: "headline", gap: 8, typeRate: 9,
        },
        end: stack(W, H, 1.36, midY + 6, true, 176, false, "headline"),
        end2: stack(W, H, 1.42, midY + 10, false, 176, false, "headline"),
        dateDy,
        ringScale,
      };
    case "1440x1080":
      return {
        sheet: {
          left: 90, right: 1350, headerTop: 70, headerRule: 112, colTop: 128,
          rowsTop: 178, rowH: 140, rows: 9, dateW: 270, nameX: 392, dateRole: "headline", gap: 8, typeRate: 10,
        },
        end: stack(W, H, 1.5, midY + 6, true, 180, false, "subhead"),
        end2: stack(W, H, 1.56, midY + 10, false, 180, false, "headline"),
        dateDy,
        ringScale,
      };
    case "1920x1080":
      return {
        sheet: {
          left: 445, right: 1475, headerTop: 70, headerRule: 112, colTop: 128,
          rowsTop: 178, rowH: 140, rows: 9, dateW: 330, nameX: 815, dateRole: "display", gap: 6, typeRate: 12,
        },
        end: stack(W, H, 1.42, midY, true, 190, true, "headline"),
        end2: stack(W, H, 1.6, midY + 10, false, 190, true, "display"),
        dateDy,
        ringScale,
      };
    case "2576x1080":
      return {
        sheet: {
          left: 120, right: 2456, headerTop: 70, headerRule: 112, colTop: 128,
          rowsTop: 178, rowH: 138, rows: 9, dateW: 360, nameX: 520, givesX: 1500, dateRole: "display", gap: 0, typeRate: 14,
        },
        end: side(W, H, 1.42, midY, 200, "headline"),
        end2: stack(W, H, 1.6, midY + 10, false, 200, true, "display"),
        dateDy,
        ringScale,
      };
    default:
      throw new Error(`No layout for ${size.id}`);
  }
};
