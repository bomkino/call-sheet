import "../brand/fonts";
import type React from "react";
import { Audio } from "@remotion/media";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, ease, mix } from "../lib/motion";
import { type Size, sizeOf } from "../sizes";
import { beatFrame, durationInFrames, T } from "../timeline";
import meta from "../../public/ui/meta.json";
import hostsData from "./hosts.json";
import { CropShot, dried, grainFrame, Label, labels, LoopMark, LoopText, part, Sheet, Shot, shotMeta, Slip, TOOTH, Words } from "./kit";
import { type Box, fit, type Kind, kindOf, listRegions, regions, roles, stacked } from "./layout";
import { LETTERS, LINE, LOCKUP_TITLE, LOCKUP_VIEWBOX, LOOP, PEN } from "./logoPaths";
import { C } from "./palette";

// The story: a question first (are you looking for funding?), then the pain (found
// the perfect opportunity the day after it closed), then four more, each named
// plainly; then one free list, and one fix for each, ticked off.

type P = { readonly frame: number; readonly size: Size; readonly kind: Kind };

const lab = (key: string) => ({ at: beatFrame(labels[key].at), text: labels[key].text });

// Lines printed on a page are already there as it slides in.
const PRINTED = 40;

// --------------------------------------------------------------- layout helpers

const Text: React.FC<{ readonly size: Size; readonly kind: Kind; readonly children: React.ReactNode; readonly box?: Box; readonly center?: boolean; readonly top?: boolean }> = ({ size, kind, children, box, center, top }) => {
  const b = box ?? regions(size).text;
  const j = top ? "flex-start" : center || !stacked(kind) ? "center" : "flex-start";
  return (
    <div style={{ position: "absolute", left: b.x, top: b.y, width: b.w, height: b.h, display: "flex", flexDirection: "column", justifyContent: j, gap: kind === "tall" ? 34 : 26 }}>
      {children}
    </div>
  );
};

// Paper art at its natural CSS size, scaled into the art box. `zoom` and
// `focus` move a camera over it, kept inside the box.
const Art: React.FC<{ readonly size: Size; readonly w: number; readonly h: number; readonly children: React.ReactNode; readonly max?: number; readonly room?: number; readonly zoom?: number; readonly focus?: [number, number]; readonly box?: Box }> = ({ size, w, h, children, max = 2.6, room = 1, zoom = 1, focus, box }) => {
  const B = box ?? regions(size).art;
  const f = fit(B, w, h, max);
  const k = f.k * room;
  const cx = f.x + (w * f.k) / 2, cy = f.y + (h * f.k) / 2;
  const [fx, fy] = focus ?? [w / 2, h / 2];
  const px = cx - (w * k) / 2 + fx * k, py = cy - (h * k) / 2 + fy * k;
  const a = 0.7 * Math.min(1, Math.max(0, (zoom - 1) / 0.1));
  const qx = px + (cx - px) * a, qy = py + (cy - py) * a;
  const z = k * zoom;
  const keep = (v: number, len: number, lo: number, span: number) => (len <= span + 20 ? Math.min(Math.max(v, lo - 10), lo + span + 10 - len) : v);
  const tx = keep(qx - fx * z, w * z, B.x, B.w), ty = keep(qy - fy * z, h * z, B.y, B.h);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, transformOrigin: "0 0", translate: `${tx}px ${ty}px`, scale: `${z}` }}>
      {children}
    </div>
  );
};

// The scale fit() gives a piece of art, so a pen stroke inside it reads ~8 px.
const artScale = (size: Size, w: number, h: number, room = 1) => fit(regions(size).art, w, h).k * room;
const penWidth = (size: Size) => (kindOf(size) === "tall" ? 9 : 8);

// Captured states of one piece of UI: each cross-fades in as the last fades out.
const States: React.FC<{ readonly frame: number; readonly names: string[]; readonly at: number[]; readonly d?: number }> = ({ frame, names, at, d = 3 }) => (
  <>
    {names.map((n, i) => {
      const inn = i === 0 ? 1 : mix(frame, [at[i - 1] - 1, at[i - 1] + d]);
      const out = i === names.length - 1 ? 0 : mix(frame, [at[i] - 1, at[i] + d]);
      const o = inn * (1 - out);
      return o > 0.001 ? <Shot key={n} name={n} opacity={o} /> : null;
    })}
  </>
);

// A slip arrives: up from below, turning a little, settling at a slight angle.
const arrive = (frame: number, at: number, rest = -1, dist = 160) => {
  const p = mix(frame, [at - 12, at], ease.out);
  return { opacity: mix(frame, [at - 12, at - 7]), translate: `0 ${(1 - p) * dist}px`, rotate: `${rest + (1 - p) * -5}deg` };
};

// A tiny seeded random, so the scatter is the same every render.
const rand = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// Plain paper and the words, for the question and for pitch.dog: the whole safe area.
const plainBox = (size: Size, kind: Kind): Box => {
  const s = size.safe;
  return stacked(kind)
    ? { x: s.left, y: s.top, w: size.width - s.left - s.right - 40, h: size.height - s.top - s.bottom }
    : { x: s.left, y: s.top, w: Math.min(1180, size.width - s.left - s.right - 120), h: size.height - s.top - s.bottom };
};

// --------------------------------------------------------------- the question

const Ask: React.FC<P> = ({ frame, size, kind }) => {
  const R = roles(kind);
  const L = lab("q");
  return (
    <Text size={size} kind={kind} box={plainBox(size, kind)} center>
      <Label frame={frame} at={L.at} text={L.text} />
      <Words frame={frame} at={T.qText} text="Are you looking for funding for your film?" role={R.main} />
    </Text>
  );
};

// --------------------------------------------------------------- found the perfect opportunity the day after it closed

const Open: React.FC<P> = ({ frame, size, kind }) => {
  const R = roles(kind);
  const m = shotMeta("perfect-open");
  const pad = 22;
  const W = m.w + 2 * pad, H = m.h + 2 * pad;
  // In 1:1 the art box is short, and the slip sags 26 px (at its own scale) as it
  // closes: smaller there, so it stays inside the safe area.
  const room = kind === "square" ? 0.76 : 1;
  const k = artScale(size, W, H, room);
  const title = part("perfect-open", "title");
  const droop = mix(frame, [T.oDroop, T.oDroop + 16], ease.inOut);
  const a = arrive(frame, T.o + 2, -1.2, 220);
  return (
    <>
      <Text size={size} kind={kind}>
        <div>
          <Words frame={frame} at={T.oText} text="Found the perfect opportunity" role={R.main} />
          <Words frame={frame} at={T.oClosed + 2} text="the day after it closed?" role={R.main} />
        </div>
      </Text>
      <Art size={size} w={W} h={H} room={room}>
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, opacity: a.opacity, translate: `${droop * 6}px ${droop * 26}px`, rotate: `${-1.2 + droop * 4.2}deg`, transformOrigin: "20% 0%" }}>
          <div style={{ position: "absolute", inset: 0, translate: a.translate, rotate: `${(1 - mix(frame, [T.o - 10, T.o + 2], ease.out)) * -5}deg` }}>
            <Slip w={m.w} h={m.h} pad={pad}>
              <States frame={frame} names={["perfect-open", "perfect-closed"]} at={[T.oClosed]} d={2} />
              <LoopMark frame={frame} at={T.oLoop} box={title} width={penWidth(size) / k} id="l-open" opts={{ seed: 2, tilt: -3 }} />
            </Slip>
          </div>
        </div>
      </Art>
    </>
  );
};

// --------------------------------------------------------------- 1. grants are scattered: real organisers' websites

const HOSTS = (hostsData.hosts as string[]).filter((h) => !/forms\.gle|jotform|vimeo|google|blcklst|festicine|filmfreeway|airtable|typeform|surveymonkey/.test(h));

const Tabs: React.FC<{ readonly frame: number; readonly at: number; readonly n: number }> = ({ frame, at, n }) => {
  const r = rand(9);
  return (
    <>
      {HOSTS.slice(0, n).map((h, i) => {
        const est = 46 + h.length * 10.2; // the slip's rough width at title.functional
        const x = r() * Math.max(10, 400 - est), y = r() * 330, rot = (r() - 0.5) * 16;
        const t0 = at + i * 1.05;
        const p = mix(frame, [t0, t0 + 5], ease.out);
        if (p <= 0) return null;
        return (
          <div key={h} style={{ position: "absolute", left: x, top: y, rotate: `${rot}deg`, opacity: Math.min(1, p * 2), translate: `0 ${(1 - p) * -26}px`, scale: `${1.08 - 0.08 * p}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px 9px 10px", backgroundColor: C.white, boxShadow: "0 1px 2px rgba(21,19,15,0.12), 0 6px 14px -6px rgba(21,19,15,0.3)", whiteSpace: "nowrap" }}>
              <div style={{ width: 14, height: 14, borderRadius: 3, backgroundColor: i % 5 === 0 ? C.ink : C.toner, opacity: 0.7, flex: "none" }} />
              <div data-pd-type="title.functional" style={{ color: C.ink }}>{h}</div>
            </div>
          </div>
        );
      })}
    </>
  );
};

const P1: React.FC<P> = ({ frame, size, kind }) => {
  const R = roles(kind);
  const L = lab("p1");
  return (
    <>
      <Text size={size} kind={kind}>
        <Label frame={frame} at={L.at} text={L.text} />
        <Words frame={frame} at={T.p1 - PRINTED} text="Raising money for your film is confusing." role={R.main} />
        <Words frame={frame} at={T.p1Sub} text="Each fund has its own rules." role={R.sub} color={C.toner} />
      </Text>
      <Art size={size} w={400} h={380} room={0.98}>
        <Tabs frame={frame} at={T.p1Tabs} n={46} />
      </Art>
    </>
  );
};

// --------------------------------------------------------------- 2. the fine print: the rule on page 9

const PAGE_W = 360, PAGE_H = 480;
// The one legible line, measured in a render at title.functional (298 px), plus a little air: the loop goes round it.
const REAL_W = 316;

const Page: React.FC<{ readonly n: number; readonly frame: number; readonly real?: boolean }> = ({ n, frame, real }) => {
  const r = rand(100 + n);
  const lines: { y: number; w: number }[] = [];
  let y = 64;
  while (y < PAGE_H - 70) {
    const para = 3 + Math.floor(r() * 4);
    for (let i = 0; i < para && y < PAGE_H - 70; i++) {
      lines.push({ y, w: i === para - 1 ? 0.35 + r() * 0.4 : 0.82 + r() * 0.18 });
      y += 16;
    }
    y += 14;
  }
  const realY = 240;
  return (
    <Slip w={PAGE_W} h={PAGE_H} pad={0}>
      <div data-pd-type="metadata" style={{ position: "absolute", left: 26, top: 22, color: C.toner, textTransform: "uppercase" }}>Guidelines</div>
      <div data-pd-type="metadata" style={{ position: "absolute", right: 26, top: 22, color: C.toner, textTransform: "uppercase" }}>Page {n} of 14</div>
      {lines
        .filter((l) => !real || Math.abs(l.y - realY) > 22)
        .map((l, i) => (
          <div key={i} style={{ position: "absolute", left: 26, top: l.y, width: (PAGE_W - 52) * l.w, height: 6, borderRadius: 3, backgroundColor: C.ink, opacity: 0.13 }} />
        ))}
      {real ? (
        <div data-pd-type="title.functional" style={{ position: "absolute", left: 26, top: realY - 18, color: C.ink, whiteSpace: "nowrap" }}>
          Open only to applicants under 30.
        </div>
      ) : null}
      {real ? <LoopMark frame={frame} at={T.p2Loop} box={{ x: 20, y: realY - 18, w: REAL_W, h: 26 }} width={4.5} id="l-p2" opts={{ seed: 3, tilt: -2, padX: 10, padY: 12 }} /> : null}
    </Slip>
  );
};

const P2: React.FC<P> = ({ frame, size, kind }) => {
  const R = roles(kind);
  const L = lab("p2");
  const w = PAGE_W + 60, h = PAGE_H + 30;
  return (
    <>
      <Text size={size} kind={kind}>
        <Label frame={frame} at={L.at} text={L.text} />
        <div>
          <Words frame={frame} at={T.p2 - PRINTED} text="You spend hours scanning through rules" role={R.long} />
          <Words frame={frame} at={T.p2Nine} text="only to find out you’re too old for this one." role={R.long} />
        </div>
      </Text>
      <Art size={size} w={w} h={h} room={kind === "square" ? 0.92 : 1}>
        {Array.from({ length: 9 }, (_, i) => {
          const n = i + 1;
          const at = n === 9 ? T.p2Nine : T.p2Flip + i * 3;
          const p = mix(frame, [at - 5, at], ease.out);
          if (p <= 0) return null;
          const rest = n === 9 ? -0.6 : ((n * 37) % 7) - 3;
          return (
            <div key={n} style={{ position: "absolute", left: 20 + (n % 3) * 6, top: 10 + (n % 2) * 6, translate: `${(1 - p) * 220}px ${(1 - p) * -30}px`, rotate: `${rest + (1 - p) * 9}deg`, opacity: Math.min(1, p * 3) }}>
              <Page n={n} frame={frame} real={n === 9} />
            </div>
          );
        })}
      </Art>
    </>
  );
};

// --------------------------------------------------------------- 3. time zones are confusing

const TimeBox: React.FC<{ readonly frame: number; readonly at: number; readonly label: string; readonly time: string; readonly note: string; readonly kind: Kind; readonly loopAt?: number }> = ({ frame, at, label, time, note, kind, loopAt }) => {
  const t = mix(frame, [at - 2, at + 9], ease.out);
  return (
    <div style={{ flex: 1, borderTop: `2px solid ${C.ink}`, paddingTop: kind === "tall" ? 18 : 14, opacity: t, translate: `0 ${(1 - t) * 18}px` }}>
      <div data-pd-social="metadata" style={{ color: C.toner }}>{label}</div>
      <div data-pd-social="display" style={{ color: C.ink, marginTop: 22 }}>
        {loopAt !== undefined ? <LoopText frame={frame} at={loopAt} id="l-p3" aspect={2.6} seed={9}>{time}</LoopText> : time}
      </div>
      <div data-pd-social={kind === "wide" ? "headline" : "subhead"} style={{ color: C.ink, marginTop: 12 }}>{note}</div>
    </div>
  );
};

const P3: React.FC<P> = ({ frame, size, kind }) => {
  const R = roles(kind);
  const L = lab("p3");
  const LR = listRegions(size);
  const art = LR.art;
  const row = kind === "wide" || kind === "square" || kind === "classic";
  return (
    <>
      <Text size={size} kind={kind} box={LR.text} top={LR.stack}>
        <Label frame={frame} at={L.at} text={L.text} />
        <Words frame={frame} at={T.p3 - PRINTED} text="16:00 in Paris is 02:00 the next day in Sydney." role={R.main} />
      </Text>
      <div style={{ position: "absolute", left: art.x, top: art.y, width: art.w, height: art.h, display: "flex", flexDirection: row ? "row" : "column", justifyContent: "center", alignItems: row ? "center" : "stretch", gap: row ? 48 : 56 }}>
        <TimeBox frame={frame} at={T.p3 + 4} label="Closes, Paris" time="16:00" note="Thursday 5 November" kind={kind} />
        <TimeBox frame={frame} at={T.p3Box2} label="Meanwhile, in Sydney" time="02:00" note="Friday 6 November" kind={kind} loopAt={T.p3Loop} />
      </div>
    </>
  );
};

// --------------------------------------------------------------- 4. hidden fees

const NOT_PUBLISHED = [
  "Finnish Film Foundation development support",
  "Screen Australia First Nations Development",
  "CNC documentary innovation: writing",
  "TorinoFilmLab FeatureLab",
];

const P4: React.FC<P> = ({ frame, size, kind }) => {
  const R = roles(kind);
  const L = lab("p4");
  const LR = listRegions(size);
  const art = LR.art;
  const feeW = 300;
  const name = R.sub === "headline" ? "subhead" : R.sub;
  return (
    <>
      <Text size={size} kind={kind} box={LR.text} top={LR.stack}>
        <Label frame={frame} at={L.at} text={L.text} />
        <Words frame={frame} at={T.p4 - PRINTED} text="Some funds don’t publish entry fees." role={R.main} />
        <Words frame={frame} at={T.p4Sub} text="And “not published” doesn’t mean free." role={R.sub} color={C.toner} />
      </Text>
      <div style={{ position: "absolute", left: art.x, top: art.y, width: art.w, height: art.h, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div data-pd-social="metadata" style={{ display: "flex", color: C.toner, paddingBottom: 14, opacity: mix(frame, [T.p4Rows - 8, T.p4Rows]) }}>
          <span style={{ flex: 1 }}>Opportunity</span>
          <span style={{ width: feeW }}>Entry fee</span>
        </div>
        {NOT_PUBLISHED.map((n, i) => {
          const at = T.p4Rows + i * 6;
          const t = mix(frame, [at - 1, at + 8], ease.out);
          return (
            <div key={n} style={{ display: "flex", alignItems: "baseline", gap: 24, borderTop: `2px solid ${C.rule}`, padding: kind === "tall" ? "20px 0 18px" : "14px 0 12px", opacity: t, translate: `0 ${(1 - t) * 12}px` }}>
              <div data-pd-social={name} style={{ color: C.ink, flex: 1 }}>{n}</div>
              <div data-pd-social={name} style={{ color: C.toner, width: feeW, flex: "none" }}>Not published</div>
            </div>
          );
        })}
        <div style={{ borderTop: `2px solid ${C.rule}` }} />
      </div>
    </>
  );
};

// --------------------------------------------------------------- fix 1: one free list

const LIST = [
  ["20 Oct", "Finnish Film Foundation development support"],
  ["22 Oct", "Screen Australia First Nations Development"],
  ["31 Oct", "Roy W. Dean Fall Grant"],
  ["2 Nov", "CNC documentary innovation: writing"],
];

const List: React.FC<{ readonly frame: number; readonly size: Size; readonly kind: Kind; readonly rows: string[][]; readonly at: number; readonly loopRow?: number; readonly loopAt?: number; readonly roomy?: boolean }> = ({ frame, size, kind, rows, at, loopRow, loopAt, roomy }) => {
  const art = listRegions(size, roomy).art;
  const dense = roomy && kind === "square";
  const dateW = kind === "tall" ? 260 : 245;
  const name = roles(kind).sub === "headline" ? "subhead" : roles(kind).sub;
  return (
    <div style={{ position: "absolute", left: art.x, top: art.y, width: art.w, height: art.h, display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <div data-pd-social="metadata" style={{ display: "flex", color: C.toner, paddingBottom: 14, opacity: mix(frame, [at - 8, at]) }}>
        <span style={{ width: dateW }}>Closes</span>
        <span style={{ paddingLeft: 16 }}>Opportunity</span>
      </div>
      {rows.map(([d, n], i) => {
        const t0 = at + i * 8;
        const t = mix(frame, [t0 - 1, t0 + 9], ease.out);
        return (
          <div key={i} style={{ display: "flex", alignItems: "baseline", borderTop: `2px solid ${C.rule}`, padding: kind === "tall" ? "22px 0 20px" : dense ? "10px 0 9px" : "16px 0 14px", opacity: t, translate: `0 ${(1 - t) * 14}px` }}>
            <div data-pd-social="headline" style={{ width: dateW, flex: "none", color: C.ink }}>
              {loopRow === i && loopAt !== undefined ? <LoopText frame={frame} at={loopAt} id="l-row" aspect={2.4} seed={10}>{d}</LoopText> : d}
            </div>
            <div data-pd-social={name} style={{ color: C.ink, flex: 1, paddingLeft: 16 }}>{n}</div>
          </div>
        );
      })}
      <div style={{ borderTop: `2px solid ${C.rule}`, opacity: mix(frame, [at + rows.length * 8, at + rows.length * 8 + 6]) }} />
    </div>
  );
};

const F1: React.FC<P> = ({ frame, size, kind }) => {
  const R = roles(kind);
  const L = lab("f1");
  const LR = listRegions(size, true);
  return (
    <>
      <Text size={size} kind={kind} box={LR.text} top={LR.stack}>
        <Label frame={frame} at={L.at} text={L.text} tickAt={T.f1Tick} />
        <Words frame={frame} at={T.f1 - PRINTED} text="We put 180+ film and TV funding opportunities on one free list." role={R.long} />
        <Words frame={frame} at={T.f1Sub} text="Soonest deadline first." role={R.sub} color={C.toner} />
      </Text>
      <List frame={frame} size={size} kind={kind} rows={LIST} at={T.f1Rows} roomy />
    </>
  );
};

// --------------------------------------------------------------- fix 2: say where you're based

const F2: React.FC<P> = ({ frame, size, kind }) => {
  const R = roles(kind);
  const L = lab("f2");
  const pad = 24;
  const w = 422, gap = 8;
  const yPlace = shotMeta("making-0").h + gap;
  const yOnly = yPlace + shotMeta("place-0").h + gap;
  const ySee = yOnly + shotMeta("only-0").h - 4;
  // Once a choice is made, "Start again" prints under the button: room for the tallest state.
  const seeH = Math.max(...["see-0", "see-1", "see-2"].map((n) => shotMeta(n).h));
  const h = ySee + seeH - 10;
  const k = artScale(size, w + 2 * pad, h + 2 * pad);
  const btn = part("see-2", "button");
  const pulse = (at: number) => 1 + 0.035 * Math.exp(-Math.max(0, frame - at) / 4) * (frame >= at ? 1 : 0);
  const seeK = pulse(T.f2Place) * pulse(T.f2Doc);
  const a = arrive(frame, T.f2 + 2, -0.8, 200);
  return (
    <>
      <Text size={size} kind={kind}>
        <Label frame={frame} at={L.at} text={L.text} tickAt={T.f2Tick} tickDryAt={T.f2Loop - 4} />
        <Words frame={frame} at={T.f2 - PRINTED} text="Say where you’re based." role={R.main} />
        <Words frame={frame} at={T.f2Sub} text="Opportunities that rule you out aren’t displayed." role={R.sub} color={C.toner} />
      </Text>
      <Art size={size} w={w + 2 * pad} h={h + 2 * pad}>
        <div style={{ position: "absolute", inset: 0, ...a }}>
          <Slip w={w} h={h} pad={pad}>
            <div style={{ position: "absolute", left: 32, top: 0 }}>
              <States frame={frame} names={["making-0", "making-1"]} at={[T.f2Doc]} />
            </div>
            <div style={{ position: "absolute", left: 32, top: yPlace }}>
              <States frame={frame} names={["place-0", "place-1"]} at={[T.f2Place]} />
            </div>
            <div style={{ position: "absolute", left: 32, top: yOnly }}>
              <Shot name="only-0" />
            </div>
            <div style={{ position: "absolute", left: 0, top: ySee - 16 }}>
              <div style={{ position: "absolute", left: 0, top: 0, width: 422, height: seeH, transformOrigin: `${btn.x + btn.w / 2}px ${btn.y + btn.h / 2}px`, scale: `${seeK}` }}>
                <States frame={frame} names={["see-0", "see-1", "see-2"]} at={[T.f2Place, T.f2Doc]} />
              </div>
              <LoopMark frame={frame} at={T.f2Loop} box={{ x: btn.x - 4, y: btn.y, w: btn.w + 18, h: btn.h }} width={penWidth(size) / k} id="l-f2" opts={{ seed: 4, tilt: -4 }} />
            </div>
          </Slip>
        </div>
      </Art>
    </>
  );
};

// --------------------------------------------------------------- fix 3: every deadline in your own time

const F3: React.FC<P> = ({ frame, size, kind }) => {
  const R = roles(kind);
  const L = lab("f3");
  const pad = 22;
  const cd = shotMeta("countdown-syd");
  const W = cd.w + 2 * pad, H = cd.h + 2 * pad;
  const k = artScale(size, W, H);
  const a = arrive(frame, T.f3 + 2, -0.8, 200);
  return (
    <>
      <Text size={size} kind={kind}>
        <Label frame={frame} at={L.at} text={L.text} tickAt={T.f3Tick} tickDryAt={T.f3Loop - 4} />
        <Words frame={frame} at={T.f3 - PRINTED} text="Every deadline, in your own time." role={R.main} />
      </Text>
      <Art size={size} w={W} h={H}>
        <div style={{ position: "absolute", inset: 0, ...a }}>
          <Slip w={cd.w} h={cd.h} pad={pad}>
            <Shot name="countdown-syd" />
            <LoopMark frame={frame} at={T.f3Loop} box={part("countdown-syd", "time")} width={penWidth(size) / k} id="l-f3" opts={{ seed: 8, tilt: -4 }} />
          </Slip>
        </div>
      </Art>
    </>
  );
};

// --------------------------------------------------------------- fix 4: the fee, as published

const FEES = ["row-sundance-merata-mita-fellowship-2027", "row-roy-w-dean-fall-grant-2026", "row-torinofilmlab-featurelab"];

const F4: React.FC<P> = ({ frame, size, kind }) => {
  const R = roles(kind);
  const L = lab("f4");
  const pad = 22;
  const gap = 18;
  let y = 0;
  const placed = FEES.map((name) => {
    const title = part(name, "title"), fee = part(name, "fee");
    const head = { x: 0, y: 12, w: 300, h: title.y + title.h - 6 };
    const strip = { x: 74, y: fee.y - 9, w: 230, h: fee.h + 18 };
    const top = y;
    y += head.h + strip.h + gap;
    return { name, head, strip, fee, top };
  });
  const w = 300, h = y - gap;
  const k = artScale(size, w + 2 * pad, h + 2 * pad);
  const a = arrive(frame, T.f4 + 2, -0.8, 200);
  const last = placed[placed.length - 1];
  return (
    <>
      <Text size={size} kind={kind}>
        <Label frame={frame} at={L.at} text={L.text} tickAt={T.f4Tick} tickDryAt={T.f4Loop - 4} />
        <Words frame={frame} at={T.f4 - PRINTED} text="The fee, as published." role={R.main} />
        <Words frame={frame} at={T.f4Sub} text="Or a plain “Not published”." role={R.sub} color={C.toner} />
      </Text>
      <Art size={size} w={w + 2 * pad} h={h + 2 * pad}>
        <div style={{ position: "absolute", inset: 0, ...a }}>
          <Slip w={w} h={h} pad={pad}>
            {placed.map((s, i) => (
              <div key={s.name} style={{ position: "absolute", left: 0, top: s.top, width: w }}>
                <CropShot name={s.name} r={s.head} />
                <CropShot name={s.name} r={s.strip} style={{ top: s.head.h, left: s.strip.x }} />
                {i < placed.length - 1 ? <div style={{ position: "absolute", left: 0, right: 0, top: s.head.h + s.strip.h + gap / 2, height: 1.5, backgroundColor: C.rule }} /> : null}
              </div>
            ))}
            <LoopMark
              frame={frame}
              at={T.f4Loop}
              box={{ x: last.fee.x, y: last.top + last.head.h + (last.fee.y - last.strip.y), w: last.fee.w, h: last.fee.h }}
              width={penWidth(size) / k}
              id="l-f4"
              opts={{ seed: 5, tilt: -5 }}
            />
          </Slip>
        </div>
      </Art>
    </>
  );
};

// --------------------------------------------------------------- fix 5a: save the ones that fit

const F5a: React.FC<P> = ({ frame, size, kind }) => {
  const R = roles(kind);
  const L = lab("f5a");
  const pad = 22;
  const slips = [
    { name: "row-roy-w-dean-fall-grant-2026", x: 0, y: 0, rot: -2.4, at: T.f5aFold1, in: T.f5a + 1 },
    { name: "row-cph-forum", x: 26, y: 64, rot: 1.3, at: T.f5aFold2, in: T.f5a + 4 },
    { name: "row-doc-edge-pitch", x: 8, y: 130, rot: -0.5, at: T.f5aFold3, in: T.f5a + 7 },
  ];
  const w = 358 + 2 * pad + 30, h = 130 + 370 + 2 * pad + 56;
  const bar = shotMeta("sheetbar");
  const barIn = mix(frame, [T.f5aBar - 10, T.f5aBar], ease.out);
  return (
    <>
      <Text size={size} kind={kind}>
        <Label frame={frame} at={L.at} text={L.text} />
        <Words frame={frame} at={T.f5a - PRINTED} text="Save the ones that fit." role={R.main} />
        <Words frame={frame} at={T.f5aSub} text="No account. They stay in your browser." role={R.sub} color={C.toner} />
      </Text>
      <Art size={size} w={w} h={h} room={0.95}>
        {slips.map((s, i) => {
          const m = shotMeta(s.name);
          const fold = mix(frame, [s.at, s.at + 11], ease.inOut);
          const next = slips[i + 1]?.at;
          return (
            <div key={s.name} style={{ position: "absolute", left: s.x, top: s.y, ...arrive(frame, s.in, s.rot, 240) }}>
              <Slip w={m.w} h={m.h} pad={pad} fold={fold} ear={50} earColor={dried(frame, next === undefined ? undefined : next - 2)}>
                <States frame={frame} names={[s.name, `${s.name}-saved`]} at={[s.at + 5]} />
              </Slip>
            </div>
          );
        })}
        <div style={{ position: "absolute", left: (w - bar.w) / 2, top: h - bar.h - 4, width: bar.w, height: bar.h, opacity: barIn, translate: `0 ${(1 - barIn) * 40}px`, filter: "drop-shadow(0 10px 16px rgba(21,19,15,0.25))" }}>
          <Shot name="sheetbar" />
        </div>
      </Art>
    </>
  );
};

// --------------------------------------------------------------- fix 5b: the calendar

const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
const WEEKS = [12, 19, 26].map((m) => Array.from({ length: 7 }, (_, i) => (m + i > 31 ? { n: m + i - 31, out: true } : { n: m + i, out: false })));
const CAL_W = 392, CAL_H = 404;

// A phone-sized calendar after "Add deadlines to calendar": the two reminders
// the site's .ics file carries, word for word, and the deadline circled.
// The deadline, the way a calendar marks an event day: an ink disc behind the date.
// The red stays with the label's tick, so the page carries one red mark.
const DeadlineDay: React.FC<{ readonly frame: number; readonly at: number; readonly x: number; readonly y: number; readonly w: number }> = ({ frame, at, x, y, w }) => {
  const t = mix(frame, [at, at + 8], ease.out);
  if (t <= 0) return null;
  const d = 34;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: 50 }}>
      <div style={{ position: "absolute", left: (w - d) / 2, top: 22 - d / 2 + 0.5, width: d, height: d, borderRadius: d / 2, backgroundColor: C.ink, opacity: t, scale: `${0.6 + 0.4 * t}` }} />
      <div data-pd-type="title.functional" style={{ position: "absolute", left: 0, right: 0, top: 11, textAlign: "center", color: C.white, opacity: t }}>31</div>
    </div>
  );
};

const Calendar: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const cw = 52, ch = 50, left = 14, gridTop = 96;
  const agenda = [
    { at: T.f5bWeek, day: "Sat 24 Oct", text: "A week to go: Roy W. Dean Fall Grant 2026" },
    { at: T.f5bDay, day: "Fri 30 Oct", text: "Closes tomorrow: Roy W. Dean Fall Grant 2026" },
  ];
  const dot = (n: number) => (n === 24 ? T.f5bWeek : n === 30 ? T.f5bDay : null);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div data-pd-type="metadata" style={{ position: "absolute", left, top: 0, color: C.toner, textTransform: "uppercase" }}>Your calendar</div>
      <div data-pd-type="title.card" style={{ position: "absolute", left, top: 22, color: C.ink }}>October 2026</div>
      {DAYS.map((d, i) => (
        <div key={i} data-pd-type="metadata" style={{ position: "absolute", left: left + i * cw, width: cw, top: gridTop - 22, textAlign: "center", color: C.toner }}>{d}</div>
      ))}
      {WEEKS.map((week, r) =>
        week.map((c, i) => {
          const at = c.out ? null : dot(c.n);
          const on = at === null ? 0 : mix(frame, [at - 2, at + 5], ease.out);
          return (
            <div key={`${r}-${i}`} style={{ position: "absolute", left: left + i * cw, top: gridTop + r * ch, width: cw, height: ch, borderTop: `1.5px solid ${C.rule}` }}>
              <div data-pd-type="title.functional" style={{ position: "absolute", left: 0, right: 0, top: 11, textAlign: "center", color: c.out ? "rgba(21,19,15,0.3)" : C.ink }}>{c.n}</div>
              {!c.out && c.n === 17 ? <div style={{ position: "absolute", left: cw / 2 - 3, bottom: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: C.toner }} /> : null}
              {on > 0 ? <div style={{ position: "absolute", left: cw / 2 - 3, bottom: 4, width: 6, height: 6, borderRadius: 3, backgroundColor: C.ink, opacity: on, scale: `${0.4 + 0.6 * on}` }} /> : null}
            </div>
          );
        }),
      )}
      <div style={{ position: "absolute", left, width: 7 * cw, top: gridTop + 3 * ch, borderTop: `1.5px solid ${C.rule}` }} />
      <DeadlineDay frame={frame} at={T.f5bLoop} x={left + 5 * cw} y={gridTop + 2 * ch} w={cw} />
      {agenda.map((a, i) => {
        const t = mix(frame, [a.at - 3, a.at + 7], ease.out);
        return (
          <div key={i} style={{ position: "absolute", left, right: 14, top: gridTop + 3 * ch + 22 + i * 76, display: "flex", gap: 14, opacity: t, translate: `0 ${(1 - t) * 10}px` }}>
            <div data-pd-type="metadata" style={{ width: 84, flex: "none", color: C.toner, textTransform: "uppercase", paddingTop: 4 }}>{a.day}</div>
            <div data-pd-type="title.functional" style={{ color: C.ink }}>{a.text}</div>
          </div>
        );
      })}
    </div>
  );
};

const F5b: React.FC<P> = ({ frame, size, kind }) => {
  const R = roles(kind);
  const L = lab("f5b");
  const pad = 22;
  const act = shotMeta("sheet-actions");
  const press = 1 - 0.035 * Math.max(0, Math.sin(Math.PI * Math.min(1, Math.max(0, (frame - T.f5bPress) / 6))));
  return (
    <>
      <Text size={size} kind={kind}>
        <Label frame={frame} at={L.at} text={L.text} tickAt={T.f5bTick} />
        <div>
          <Words frame={frame} at={T.f5b - PRINTED} text="Easily save every deadline" role={R.long} />
          <Words frame={frame} at={T.f5b - PRINTED + 4} text="in your calendar." role={R.long} />
        </div>
        <Words frame={frame} at={T.f5bSub} text="With a nudge a week before, and the day before." role={R.sub} color={C.toner} />
      </Text>
      <Art size={size} w={CAL_W + 2 * pad} h={CAL_H + 2 * pad}>
        <div style={{ position: "absolute", left: (CAL_W + 2 * pad - act.w - 44) / 2, top: 90, ...arrive(frame, T.f5b + 1, -1, 180), scale: `${press}` }}>
          <Slip w={act.w} h={act.h} pad={22}>
            <Shot name="sheet-actions" />
          </Slip>
        </div>
        <div style={{ position: "absolute", left: 0, top: 0, ...arrive(frame, T.f5bCal, 0.8, 300) }}>
          <Slip w={CAL_W} h={CAL_H} pad={pad} lift={0.2}>
            <Calendar frame={frame} />
          </Slip>
        </div>
      </Art>
    </>
  );
};

// --------------------------------------------------------------- fix 5c: new pages every month

const F5c: React.FC<P> = ({ frame, size, kind }) => {
  const R = roles(kind);
  const L = lab("f5c");
  const pad = 22;
  const row = shotMeta("row-doc-edge-pitch-new");
  const wel = shotMeta("welcome");
  const w = row.w + 2 * pad + 40, h = row.h + 2 * pad + 90;
  return (
    <>
      <Text size={size} kind={kind}>
        <Label frame={frame} at={L.at} text={L.text} color={C.ink} />
        <Words frame={frame} at={T.f5c - PRINTED} text="Updated every month." role={R.main} />
        <Words frame={frame} at={T.f5cSub} text="New opportunities get a New tag." role={R.sub} color={C.ink} />
      </Text>
      <Art size={size} w={w} h={h}>
        <div style={{ position: "absolute", left: 0, top: 0, ...arrive(frame, T.f5c + 2, -1.2, 200) }}>
          <Slip w={row.w} h={row.h} pad={pad}>
            <Shot name="row-doc-edge-pitch-new" />
          </Slip>
        </div>
        <div style={{ position: "absolute", left: 40, top: h - wel.h - 2 * pad, ...arrive(frame, T.f5cNew, 1.2, 240) }}>
          <Slip w={wel.w} h={wel.h} pad={pad} lift={0.4}>
            <Shot name="welcome" />
          </Slip>
        </div>
      </Art>
    </>
  );
};

// --------------------------------------------------------------- pitch.dog, quietly

const PD: React.FC<P> = ({ frame, size, kind }) => {
  const R = roles(kind);
  const L = lab("pd");
  return (
    <Text size={size} kind={kind} box={plainBox(size, kind)} center>
      <Label frame={frame} at={L.at} text={L.text} />
      <Words frame={frame} at={T.pd - PRINTED} text="Applying for one?" role={R.main} />
      <Words frame={frame} at={T.pdSub} text="We make the decks that go with it." role="headline" />
      <Words frame={frame} at={T.pdFree} text="The list stays free either way." role={R.sub} color={C.toner} />
    </Text>
  );
};

// The page's corner folds down into a red dog-ear, and the blue page shows under it.
const PageEar: React.FC<{ readonly frame: number; readonly size: Size; readonly at: number }> = ({ frame, size, at }) => {
  const fold = mix(frame, [at, at + 12], ease.inOut);
  if (fold <= 0) return null;
  const ear = size.width > size.height ? 150 : 170;
  const W = size.width;
  const cos = Math.cos(Math.PI * fold);
  const mx = W - ear / 2, my = ear / 2;
  const ax = mx + (ear / 2) * cos, ay = my - (ear / 2) * cos;
  const front = cos > 0;
  return (
    <svg width={W} height={size.height} style={{ position: "absolute", left: 0, top: 0, zIndex: 50 }}>
      <defs>
        <filter id="ear-shadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" /></filter>
      </defs>
      <polygon points={`${W - ear},0 ${W},0 ${W},${ear}`} fill={C.blue} />
      {!front ? <polygon points={`${W - ear - 2},0 ${W},${ear + 2} ${ax - 4},${ay + 7}`} fill="rgba(21,19,15,0.22)" filter="url(#ear-shadow)" /> : null}
      <polygon points={`${W - ear},0 ${W},${ear} ${ax},${ay}`} fill={front ? C.paper : C.marker} />
    </svg>
  );
};

// --------------------------------------------------------------- find the one that's yours

// The closing list is what a documentary-maker based in the US sees in the finder
// (captured as us-doc-rows), soonest first, ending on the opportunity the film has followed.
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const usRows = (meta as unknown as { "us-doc-rows": { slug: string; title: string; closes: string }[] })["us-doc-rows"];
const YOURS = ["roy-w-dean-fall-grant-2026", "big-sky-pitch-2027", "cph-forum", "doc-edge-pitch"].map((slug) => {
  const r = usRows.find((x) => x.slug === slug);
  if (!r) throw new Error(`${slug} isn't in the captured US documentary list`);
  const [, m, d] = r.closes.split("-").map(Number);
  return [`${d} ${MONTHS[m - 1]}`, r.title];
});

const CTA: React.FC<P> = ({ frame, size, kind }) => {
  const R = roles(kind);
  const LR = listRegions(size);
  return (
    <>
      <Text size={size} kind={kind} box={LR.text} top={LR.stack}>
        <Words frame={frame} at={T.cta - PRINTED} text="Find the one that’s yours." role={R.main} />
      </Text>
      <List frame={frame} size={size} kind={kind} rows={YOURS} at={T.ctaRows - 24} loopRow={3} loopAt={T.ctaLoop} />
    </>
  );
};

// --------------------------------------------------------------- the logo, and the end card

const LOGO_W: Record<Kind, number> = { tall: 860, square: 820, classic: 1040, wide: 1120 };

const Lockup: React.FC<{ readonly frame: number; readonly size: Size; readonly kind: Kind; readonly loopAt: number; readonly lineAt: number; readonly dy?: number }> = ({ frame, size, kind, loopAt, lineAt, dy = 0 }) => {
  const [vx, vy, vw, vh] = LOCKUP_VIEWBOX.split(" ").map(Number);
  const w = LOGO_W[kind];
  const h = (w * vh) / vw;
  const s = size.safe;
  const cx = s.left + (size.width - s.left - s.right) / 2;
  const cy = s.top + (size.height - s.top - s.bottom) / 2 + dy;
  const pen = interpolate(frame, [loopAt, loopAt + 20], [0, 1], { ...clamp, easing: (t) => 1 - (1 - t) ** 1.6 });
  const line = mix(frame, [lineAt, lineAt + 14], ease.out);
  return (
    <svg viewBox={LOCKUP_VIEWBOX} width={w} height={h} role="img" aria-label={LOCKUP_TITLE} style={{ position: "absolute", left: cx - w / 2, top: cy - h / 2, overflow: "visible" }}>
      <defs>
        <mask id="logo-pen" maskUnits="userSpaceOnUse" x={vx - 50} y={vy - 50} width={vw + 100} height={vh + 100}>
          <path d={PEN} pathLength={1} fill="none" stroke="#fff" strokeWidth={13} strokeLinecap="round" strokeDasharray="1 2" strokeDashoffset={1 - pen} />
        </mask>
      </defs>
      <path d={LETTERS} fill={C.ink} />
      {pen > 0.001 ? <path d={LOOP} fill={C.marker} mask={pen < 1 ? "url(#logo-pen)" : undefined} /> : null}
      <g style={{ opacity: line, translate: `0 ${(1 - line) * 8}px` }}>
        <path d={LINE} fill={C.ink} />
      </g>
    </svg>
  );
};

const End: React.FC<P> = ({ frame, size, kind }) => {
  const [, , vw, vh] = LOCKUP_VIEWBOX.split(" ").map(Number);
  const h = (LOGO_W[kind] * vh) / vw;
  const s = size.safe;
  const cy = s.top + (size.height - s.top - s.bottom) / 2;
  const url = mix(frame, [T.endUrl, T.endUrl + 12], ease.out);
  const lift = kind === "tall" ? 70 : 54;
  return (
    <>
      <Lockup frame={frame} size={size} kind={kind} loopAt={T.endLoop} lineAt={T.endLine} dy={-lift} />
      <div style={{ position: "absolute", left: 0, right: 0, top: cy - lift + h / 2 + (kind === "tall" ? 70 : 52), textAlign: "center", opacity: url, translate: `0 ${(1 - url) * 10}px` }}>
        <span data-pd-social="headline" style={{ color: C.ink }}>pitch.dog/call-sheet</span>
      </div>
    </>
  );
};

// --------------------------------------------------------------- the reel

type Scene = { at: number; C: React.FC<P>; color?: string; ear?: boolean };
const SCENES: Scene[] = [
  { at: T.q, C: Ask },
  { at: T.o, C: Open },
  { at: T.p1, C: P1 },
  { at: T.p2, C: P2 },
  { at: T.p3, C: P3 },
  { at: T.p4, C: P4 },
  { at: T.f1, C: F1 },
  { at: T.f2, C: F2 },
  { at: T.f3, C: F3 },
  { at: T.f4, C: F4 },
  { at: T.f5a, C: F5a },
  { at: T.f5b, C: F5b },
  { at: T.f5c, C: F5c, color: C.blue },
  { at: T.pd, C: PD, ear: true },
  { at: T.cta, C: CTA },
  { at: T.end, C: End },
];

// Film grain, a little: tileable noise, a new frame each frame, lightly overlaid.
// The eight grain frames are preloaded as <Img> in Explainer, which the render
// waits for, so this background paints from cache on every frame.
const Grain: React.FC<{ readonly frame: number }> = ({ frame }) => {
  const ox = (frame * 7919) % 512, oy = (frame * 104729) % 512;
  return (
    // eslint-disable-next-line @remotion/no-background-image
    <AbsoluteFill style={{ zIndex: 100, pointerEvents: "none", backgroundImage: `url(${grainFrame(frame)})`, backgroundSize: "1024px 1024px", backgroundPosition: `${ox}px ${oy}px`, mixBlendMode: "overlay", opacity: 0.09 }} />
  );
};

export const Explainer: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const size = sizeOf(width, height);
  const kind = kindOf(size);
  const from = stacked(kind) ? "bottom" : "right";
  return (
    <AbsoluteFill data-pd-canvas={size.canvas} style={{ backgroundColor: C.paper }}>
      <div style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0 }}>
        <Img src={TOOTH} />
        {Array.from({ length: 8 }, (_, i) => <Img key={i} src={grainFrame(i)} />)}
      </div>
      {SCENES.map((s, i) => {
        const next = SCENES[i + 1]?.at ?? durationInFrames + 20;
        const enter = i === 0 ? -100 : s.at;
        if (frame < enter - 18 || frame >= next) return null;
        const drift = interpolate(frame, [s.at - 16, next], [0, 1], clamp);
        const Scene = s.C;
        return (
          <Sheet key={i} frame={frame} land={enter} from={from} width={width} height={height} color={s.color} z={i + 1}>
            <AbsoluteFill style={{ scale: `${1 + 0.018 * drift}`, transformOrigin: "50% 45%" }}>
              <Scene frame={frame} size={size} kind={kind} />
            </AbsoluteFill>
            {s.ear ? <PageEar frame={frame} size={size} at={T.pdEar} /> : null}
          </Sheet>
        );
      })}
      <Grain frame={frame} />
      <Audio name="Score" src={staticFile("audio/score.wav")} />
    </AbsoluteFill>
  );
};
