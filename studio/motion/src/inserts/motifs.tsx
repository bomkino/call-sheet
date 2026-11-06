import type React from "react";
import { cs } from "../brand/palette";
import { ease, mix } from "../lib/motion";
import { blockAt, ink, labelInk, slipHex, useScene } from "./kit";
import type { Ground, Motif, MotifKind } from "./schema.mjs";
import { GROUNDS } from "./schema.mjs";

// Small objects from a Reel's own story, drawn flat like the brand's marks:
// ink line, paper fill, one revision-colour accent. Never red (red is the
// hand's), never text-heavy, and always a single object. Each sits in the
// scene's column, above or below the copy, so it can never overlap it.
// Every motif has one quiet idle move.

const S = 5; // ink line
const line = { stroke: ink, strokeWidth: S, strokeLinecap: "round", strokeLinejoin: "round" } as const;

type P = { t: number; paper: string; tint: string; value?: string };

// "4pm", "16:00", "4:30" -> hours and minutes.
const parseTime = (v?: string) => {
  const m = /^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?/i.exec(v ?? "");
  if (!m) return { h: 4, m: 0 };
  let h = Number(m[1]) % 12;
  if (m[3]?.toLowerCase() === "pm" || Number(m[1]) >= 12) h = h % 12;
  return { h, m: Number(m[2] ?? 0) };
};

const Clock: React.FC<P> = ({ t, paper, tint, value }) => {
  const { h, m } = parseTime(value);
  const sec = Math.floor(t / 30) * 6 + 90 * mix(t % 30, [0, 4], ease.out) / 15;
  const ma = (m / 60) * 360;
  const ha = ((h + m / 60) / 12) * 360;
  const ring = Math.sin(t * 2.2) * Math.exp(-Math.max(0, t - 18) / 6) * (t > 18 ? 3 : 0);
  return (
    <g>
      <g style={{ transformOrigin: "120px 130px", rotate: `${ring}deg` }}>
        <path d="M58 70 A30 30 0 0 1 98 42" {...line} fill={tint} />
        <path d="M182 70 A30 30 0 0 0 142 42" {...line} fill={tint} />
        <path d="M60 72 L98 44 M180 72 L142 44" {...line} fill="none" />
        <line x1={84} y1={200} x2={72} y2={220} {...line} />
        <line x1={156} y1={200} x2={168} y2={220} {...line} />
        <circle cx={120} cy={132} r={78} {...line} fill={paper} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const r0 = i % 3 === 0 ? 58 : 64;
          return <line key={i} x1={120 + Math.sin(a) * r0} y1={132 - Math.cos(a) * r0} x2={120 + Math.sin(a) * 70} y2={132 - Math.cos(a) * 70} stroke={ink} strokeWidth={i % 3 === 0 ? 5 : 3} strokeLinecap="round" />;
        })}
        <line x1={120} y1={132} x2={120 + Math.sin((ha * Math.PI) / 180) * 38} y2={132 - Math.cos((ha * Math.PI) / 180) * 38} {...line} strokeWidth={8} />
        <line x1={120} y1={132} x2={120 + Math.sin((ma * Math.PI) / 180) * 56} y2={132 - Math.cos((ma * Math.PI) / 180) * 56} {...line} strokeWidth={6} />
        <line x1={120} y1={132} x2={120 + Math.sin((sec * Math.PI) / 180) * 60} y2={132 - Math.cos((sec * Math.PI) / 180) * 60} stroke={labelInk} strokeWidth={2.5} strokeLinecap="round" />
        <circle cx={120} cy={132} r={6} fill={ink} />
      </g>
    </g>
  );
};

const Steam: React.FC<{ t: number; x: number; y: number }> = ({ t, x, y }) => (
  <g opacity={0.55}>
    {[0, 1, 2].map((i) => {
      const ph = (t / 40 + i / 3) % 1;
      const yy = y - ph * 40;
      return (
        <path
          key={i}
          d={`M${x + (i - 1) * 18} ${yy} q 8 -10 0 -20 q -8 -10 0 -20`}
          fill="none"
          stroke={ink}
          strokeWidth={4}
          strokeLinecap="round"
          opacity={Math.sin(ph * Math.PI)}
        />
      );
    })}
  </g>
);

const Kettle: React.FC<P> = ({ t, paper, tint }) => (
  <g>
    <Steam t={t} x={186} y={76} />
    <path d="M70 92 Q120 66 170 92 L186 196 Q120 210 54 196 Z" {...line} fill={paper} />
    <path d="M178 140 L214 104 L222 110 L196 158" {...line} fill={paper} />
    <path d="M88 86 Q120 26 152 86" {...line} fill="none" strokeWidth={9} />
    <path d="M60 160 Q120 172 180 160" {...line} fill="none" stroke={tint} strokeWidth={14} />
    <ellipse cx={120} cy={80} rx={16} ry={6} {...line} fill={tint} />
  </g>
);

const Mug: React.FC<P> = ({ t, paper, tint }) => (
  <g>
    <Steam t={t} x={110} y={70} />
    <path d="M58 92 L66 206 Q110 216 154 206 L162 92 Z" {...line} fill={paper} />
    <path d="M160 116 Q206 112 202 148 Q198 180 156 178" {...line} fill="none" strokeWidth={9} />
    <ellipse cx={110} cy={92} rx={52} ry={10} {...line} fill={tint} />
    <path d="M64 140 Q110 150 158 140" fill="none" stroke={tint} strokeWidth={16} />
  </g>
);

const Calendar: React.FC<P> = ({ t, paper, tint, value }) => {
  const m = /^(\d{1,2})\s+([A-Za-z]{3})/.exec(value ?? "");
  const flip = mix(t, [6, 16], ease.out);
  return (
    <g>
      <rect x={42} y={46} width={156} height={170} rx={8} {...line} fill={paper} />
      <path d={`M42 54 Q42 46 50 46 L190 46 Q198 46 198 54 L198 ${88} L42 88 Z`} {...line} fill={tint} />
      <line x1={82} y1={34} x2={82} y2={60} {...line} strokeWidth={8} />
      <line x1={158} y1={34} x2={158} y2={60} {...line} strokeWidth={8} />
      {m ? (
        <>
          <text x={120} y={78} textAnchor="middle" fontFamily="PD Eyebrow" fontWeight={500} fontSize={24} letterSpacing={2} fill={ink}>
            {m[2].toUpperCase()}
          </text>
          <text x={120} y={178} textAnchor="middle" fontFamily="PD Head" fontWeight={600} fontSize={78} fill={ink} opacity={flip}>
            {m[1]}
          </text>
        </>
      ) : (
        [0, 1, 2, 3].map((r) => (
          <g key={r}>
            {[0, 1, 2, 3, 4].map((c) => (
              <rect key={c} x={58 + c * 26} y={104 + r * 26} width={16} height={14} rx={2} fill={labelInk} opacity={0.35} />
            ))}
          </g>
        ))
      )}
    </g>
  );
};

const Envelope: React.FC<P> = ({ t, paper, tint }) => {
  const lift = 26 * mix(t, [8, 24], ease.out);
  return (
    <g>
      <rect x={58} y={96 - lift} width={124} height={86} {...line} fill={cs.white} />
      <line x1={76} y1={118 - lift} x2={160} y2={118 - lift} stroke={labelInk} strokeWidth={4} strokeLinecap="round" />
      <line x1={76} y1={136 - lift} x2={140} y2={136 - lift} stroke={labelInk} strokeWidth={4} strokeLinecap="round" />
      <path d="M30 96 L120 156 L210 96 L210 206 L30 206 Z" {...line} fill={tint} />
      <path d="M30 206 L104 146 M210 206 L136 146" {...line} fill="none" />
      <path d="M30 96 L120 40 L210 96" {...line} fill={paper} opacity={0} />
    </g>
  );
};

const Sticky: React.FC<P> = ({ t, tint, value }) => {
  const sway = Math.sin(t / 18) * 0.8;
  return (
    <g style={{ transformOrigin: "120px 40px", rotate: `${-4 + sway}deg` }}>
      <path d="M40 40 L200 40 L200 168 L168 200 L40 200 Z" {...line} fill={tint} />
      <path d="M200 168 L172 172 L168 200" {...line} fill="rgba(21,19,15,0.12)" />
      {value ? (
        <text x={120} y={132} textAnchor="middle" fontFamily="PD Head" fontWeight={500} fontSize={value.length > 7 ? 30 : 42} fill={ink}>
          {value}
        </text>
      ) : (
        <>
          <path d="M66 96 q 30 -8 60 0 t 50 -4" fill="none" stroke={ink} strokeWidth={5} strokeLinecap="round" />
          <path d="M66 132 q 24 -6 46 0 t 40 -2" fill="none" stroke={ink} strokeWidth={5} strokeLinecap="round" />
        </>
      )}
    </g>
  );
};

const Clapper: React.FC<P> = ({ t, paper, tint }) => {
  const open = 16 * (1 - mix(t, [10, 15], ease.in)) + (t > 15 ? 3 * Math.exp(-(t - 15) / 2) * Math.sin((t - 15) * 1.5) : 0);
  const stripes = (y: number) =>
    [0, 1, 2, 3, 4].map((i) => (
      <path key={i} d={`M${46 + i * 32} ${y} l 18 0 l -14 26 l -18 0 Z`} fill={ink} />
    ));
  return (
    <g>
      <rect x={40} y={92} width={164} height={112} rx={6} {...line} fill={paper} />
      <rect x={40} y={92} width={164} height={28} {...line} fill={cs.white} />
      {stripes(93)}
      <line x1={58} y1={150} x2={186} y2={150} stroke={labelInk} strokeWidth={4} />
      <line x1={58} y1={176} x2={140} y2={176} stroke={labelInk} strokeWidth={4} />
      <rect x={150} y={160} width={36} height={28} fill={tint} />
      <g style={{ transformOrigin: "42px 90px", rotate: `${-open}deg` }}>
        <rect x={40} y={62} width={164} height={28} {...line} fill={cs.white} />
        {stripes(63)}
      </g>
    </g>
  );
};

const Filmstrip: React.FC<P> = ({ t, tint }) => {
  const dx = -((t * 0.8) % 44);
  return (
    <g>
      <defs>
        <clipPath id="strip">
          <rect x={20} y={60} width={200} height={120} rx={4} />
        </clipPath>
      </defs>
      <rect x={20} y={60} width={200} height={120} rx={4} fill={ink} />
      <g clipPath="url(#strip)">
        {Array.from({ length: 8 }, (_, i) => (
          <g key={i} transform={`translate(${dx + i * 44} 0)`}>
            <rect x={14} y={68} width={18} height={12} rx={2} fill={cs.paper} />
            <rect x={14} y={160} width={18} height={12} rx={2} fill={cs.paper} />
          </g>
        ))}
        {Array.from({ length: 4 }, (_, i) => (
          <rect key={i} x={dx * 2 + 4 + i * 88 - 10} y={88} width={76} height={64} rx={3} fill={i % 2 ? tint : cs.paper} />
        ))}
      </g>
    </g>
  );
};

const Receipt: React.FC<P> = ({ paper, value }) => {
  return (
    <g>
      <path d={`M62 28 L182 28 L182 208 ${Array.from({ length: 9 }, (_, i) => `L${182 - (i + 1) * 13.3} ${i % 2 ? 208 : 198}`).join(" ")} Z`} {...line} fill={paper} />
      {[56, 80, 104, 128].map((y, i) => (
        <g key={y}>
          <line x1={80} y1={y} x2={128 - (i % 2) * 16} y2={y} stroke={labelInk} strokeWidth={4} strokeLinecap="round" />
          <line x1={146} y1={y} x2={164} y2={y} stroke={labelInk} strokeWidth={4} strokeLinecap="round" />
        </g>
      ))}
      <line x1={80} y1={150} x2={164} y2={150} stroke={ink} strokeWidth={3} strokeDasharray="6 6" />
      {value ? (
        <text x={164} y={184} textAnchor="end" fontFamily="PD Head" fontWeight={600} fontSize={value.length > 6 ? 24 : 30} fill={ink}>
          {value}
        </text>
      ) : (
        <line x1={120} y1={176} x2={164} y2={176} {...line} strokeWidth={8} />
      )}
    </g>
  );
};

const Tag: React.FC<P> = ({ t, tint, value }) => {
  const swing = Math.sin(t / 14) * 3 * Math.exp(-t / 60) + 5;
  return (
    <g>
      <path d="M120 6 Q 118 24 124 40" fill="none" stroke={ink} strokeWidth={3} />
      <g style={{ transformOrigin: "124px 44px", rotate: `${swing}deg` }}>
        <path d="M124 30 L190 90 L190 222 L58 222 L58 90 Z" {...line} fill={tint} />
        <circle cx={124} cy={72} r={10} {...line} fill={cs.paper} />
        {value ? (
          <text x={124} y={170} textAnchor="middle" fontFamily="PD Head" fontWeight={600} fontSize={[...value].length > 5 ? 32 : 40} fill={ink}>
            {value}
          </text>
        ) : (
          <line x1={92} y1={160} x2={156} y2={160} {...line} strokeWidth={8} />
        )}
      </g>
    </g>
  );
};

const Tabs: React.FC<P> = ({ t, paper, tint, value }) => {
  const n = Math.min(Math.max(Number(value) || 7, 2), 12);
  const shown = Math.min(n, 1 + Math.floor(Math.max(0, t - 4) / 3));
  const tw = 196 / n;
  return (
    <g>
      <rect x={16} y={64} width={208} height={140} rx={8} {...line} fill={paper} />
      {Array.from({ length: shown }, (_, i) => (
        <path
          key={i}
          d={`M${22 + i * tw} 66 L${22 + i * tw + 4} 44 L${22 + (i + 1) * tw - 4} 44 L${22 + (i + 1) * tw} 66`}
          {...line}
          strokeWidth={3.5}
          fill={i === shown - 1 ? cs.white : tint}
        />
      ))}
      <line x1={16} y1={84} x2={224} y2={84} stroke={ink} strokeWidth={3} />
      {[108, 132, 156, 180].map((y, i) => (
        <line key={y} x1={36} y1={y} x2={196 - (i % 3) * 30} y2={y} stroke={labelInk} strokeWidth={5} strokeLinecap="round" />
      ))}
    </g>
  );
};

const Magnifier: React.FC<P> = ({ t, paper, tint }) => {
  const x = Math.sin(t / 22) * 8;
  const y = Math.cos(t / 30) * 4;
  return (
    <g>
      <rect x={30} y={70} width={150} height={130} rx={4} {...line} fill={paper} />
      {[96, 118, 140, 162, 184].map((yy, i) => (
        <line key={yy} x1={48} y1={yy} x2={160 - (i % 2) * 26} y2={yy} stroke={labelInk} strokeWidth={4} strokeLinecap="round" />
      ))}
      <g transform={`translate(${x} ${y})`}>
        <line x1={170} y1={130} x2={214} y2={176} {...line} strokeWidth={14} />
        <circle cx={140} cy={100} r={44} {...line} strokeWidth={7} fill={tint} fillOpacity={0.45} />
      </g>
    </g>
  );
};

// "Pinned" is the brand's saved page: a dog-eared sheet, not a pushpin (the
// owner ruled out pins and tape).
const Pinned: React.FC<P> = ({ t, paper, tint }) => {
  const fold = mix(t, [8, 20], ease.out);
  const e = 46 * fold;
  return (
    <g>
      <rect x={44} y={34} width={152} height={184} fill={tint} />
      <path d={`M44 34 L${196 - e} 34 L196 ${34 + e} L196 218 L44 218 Z`} {...line} fill={paper} />
      {e > 1 ? <path d={`M${196 - e} 34 L${196 - e} ${34 + e} L196 ${34 + e} Z`} {...line} strokeWidth={4} fill={cs.white} /> : null}
      {[74, 98, 122, 146, 170].map((y, i) => (
        <line key={y} x1={66} y1={y} x2={(i === 0 ? 140 : 172) - (i % 2) * 24} y2={y} stroke={labelInk} strokeWidth={4} strokeLinecap="round" />
      ))}
    </g>
  );
};

const Piles: React.FC<P> = ({ t, paper, tint }) => {
  const heights = [5, 8, 3];
  return (
    <g>
      {heights.map((n, p) => (
        <g key={p}>
          {Array.from({ length: n }, (_, i) => {
            const show = mix(t, [p * 4 + i * 1.5, p * 4 + i * 1.5 + 5], ease.out);
            const y = 206 - i * 16 - (1 - show) * 20;
            return (
              <rect
                key={i}
                x={18 + p * 72 + ((i * 7) % 5) - 2}
                y={y}
                width={60}
                height={12}
                rx={1.5}
                {...line}
                strokeWidth={3.5}
                fill={i === n - 1 ? tint : paper}
                opacity={show}
              />
            );
          })}
        </g>
      ))}
      <line x1={8} y1={220} x2={232} y2={220} {...line} strokeWidth={4} />
    </g>
  );
};

const Laptop: React.FC<P> = ({ t, paper, tint }) => {
  const scroll = (t * 0.6) % 24;
  return (
    <g>
      <defs>
        <clipPath id="screen">
          <rect x={46} y={56} width={148} height={98} />
        </clipPath>
      </defs>
      <rect x={36} y={46} width={168} height={118} rx={8} {...line} fill={paper} />
      <g clipPath="url(#screen)">
        {Array.from({ length: 7 }, (_, i) => (
          <g key={i} transform={`translate(0 ${-scroll})`}>
            <rect x={56} y={64 + i * 24} width={22} height={10} rx={2} fill={tint} />
            <rect x={86} y={66 + i * 24} width={92 - (i % 3) * 22} height={6} rx={3} fill={labelInk} opacity={0.6} />
          </g>
        ))}
      </g>
      <path d="M14 172 L226 172 L214 194 L26 194 Z" {...line} fill={paper} />
      <line x1={104} y1={182} x2={136} y2={182} stroke={labelInk} strokeWidth={4} strokeLinecap="round" />
    </g>
  );
};

const Passport: React.FC<P> = ({ t, tint }) => {
  const tilt = Math.sin(t / 26) * 1.5;
  return (
    <g style={{ transformOrigin: "120px 124px", rotate: `${-5 + tilt}deg` }}>
      <rect x={58} y={30} width={132} height={186} rx={10} {...line} fill={tint} />
      <line x1={70} y1={30} x2={70} y2={216} stroke={ink} strokeWidth={3} opacity={0.5} />
      <circle cx={124} cy={110} r={30} {...line} strokeWidth={4} fill="none" />
      <path d="M94 110 L154 110 M124 80 Q104 110 124 140 M124 80 Q144 110 124 140" fill="none" stroke={ink} strokeWidth={3} />
      <line x1={92} y1={168} x2={156} y2={168} stroke={ink} strokeWidth={4} strokeLinecap="round" />
      <line x1={102} y1={184} x2={146} y2={184} stroke={ink} strokeWidth={4} strokeLinecap="round" />
    </g>
  );
};

const DRAW: Record<MotifKind, React.FC<P>> = {
  clock: Clock,
  kettle: Kettle,
  mug: Mug,
  calendar: Calendar,
  envelope: Envelope,
  sticky: Sticky,
  clapper: Clapper,
  filmstrip: Filmstrip,
  receipt: Receipt,
  tag: Tag,
  tabs: Tabs,
  magnifier: Magnifier,
  pinned: Pinned,
  piles: Piles,
  laptop: Laptop,
  passport: Passport,
};

// The accent: a revision colour that isn't the ground.
const accentFor = (g: Ground, tint?: Ground) => {
  if (tint) return GROUNDS[tint];
  if (g === "blue") return GROUNDS.yellow;
  if (g === "yellow" || g === "goldenrod") return GROUNDS.blue;
  return GROUNDS.blue;
};

export const MOTIF_SIZE = 220; // px on screen

// The scene's motif, if it has one in this place. `i` is its block index.
export const MotifSlot: React.FC<{ readonly place: "above" | "below"; readonly i: number }> = ({ place, i }) => {
  const c = useScene();
  const m: Motif | undefined = c.scene.motif;
  if (!m || m.place !== place) return null;
  const at = blockAt(c, i);
  const t = c.f - at;
  const k = mix(c.f, [at, at + 16], ease.out);
  const Draw = DRAW[m.kind];
  const center = c.scene.align === "center";
  // A fixed size on screen, whatever the column's scale (--fit).
  const size = `calc(${MOTIF_SIZE}px / var(--fit, 1))`;
  return (
    <div
      style={{
        alignSelf: center ? "center" : "flex-start",
        width: size,
        height: size,
        flex: "none",
        opacity: k,
        translate: `0 ${c.moving ? 0 : 24 * (1 - k)}px`,
        scale: `${0.94 + 0.06 * k}`,
      }}
    >
      <svg viewBox="0 0 240 240" width="100%" height="100%" style={{ overflow: "visible" }}>
        <Draw t={Math.max(0, t)} paper={slipHex(c.scene.ground)} tint={accentFor(c.scene.ground, m.tint)} value={m.value} />
      </svg>
    </div>
  );
};
