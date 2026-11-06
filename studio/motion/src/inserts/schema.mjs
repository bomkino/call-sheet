// The Reel insert spec: validation, defaults and timing. Plain JavaScript so
// the render script (Node) and the composition (the bundle) share one copy.
// Types live beside it in schema.d.mts. SPEC.md documents every field.
//
// Schema version 1. Once src/inserts/READY exists, only additive, optional
// changes are allowed: every spec that validates today must keep validating.

export const SCHEMA_VERSION = 1;
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

export const GROUNDS = {
  paper: "#F3EFE6",
  white: "#FBF9F3",
  blue: "#A8C8EA",
  pink: "#F3B5C8",
  yellow: "#F4DF77",
  green: "#B5D9A2",
  goldenrod: "#E6B640",
  buff: "#E9D5AE",
  salmon: "#F3A58A",
  cherry: "#CF3B52",
};

export const DIRS = ["none", "up", "down", "left", "right"];
export const ALIGNS = ["left", "center"];
export const ENTRIES = ["rise", "type", "slide"];
export const TRANSITIONS = ["cut", "page"];
export const MOTIFS = [
  "clock",
  "kettle",
  "mug",
  "calendar",
  "envelope",
  "sticky",
  "clapper",
  "filmstrip",
  "receipt",
  "tag",
  "tabs",
  "magnifier",
  "pinned",
  "piles",
  "laptop",
  "passport",
];
export const SCENE_TYPES = [
  "card",
  "amount",
  "deadline",
  "timezone",
  "forwho",
  "list",
  "catch",
  "send",
  "line",
  "custom",
];

// Default length of a scene, in seconds.
export const DEFAULT_SECONDS = {
  card: 4,
  amount: 3.5,
  deadline: 3.5,
  timezone: 4.5,
  forwho: 4.5,
  list: 4.5,
  catch: 3.5,
  send: 4,
  line: 3,
  custom: 3.5,
};

export const TOTAL_SECONDS = [2.5, 5];
export const SCENE_SECONDS = [1.2, 5];

// Maximum characters per text field, so the copy fits at its type role.
export const LIMITS = {
  kicker: 34,
  hook: 40,
  motifValue: 12,
  card: { name: 40, for: 56, gets: 40, closes: 14, loopedGets: 24, loopedName: 24 },
  amount: { amount: 9, label: 24, name: 40, line: 56 },
  deadline: { date: 6, weekday: 3, note: 24, label: 20, name: 40 },
  timezone: { label: 36, city: 12, time: 8, day: 10, min: 3, max: 6 },
  forwho: { headline: 28, item: 34, name: 40, min: 2, max: 4 },
  list: { label: 30, closes: 6, name: 34, gets: 30, min: 2, max: 5 },
  catch: { label: 18, text: 56, note: 40, name: 40 },
  send: { headline: 28, item: 30, name: 40, min: 2, max: 5 },
  line: { text: 64, displayMax: 32, loop: 16, sub: 48 },
  custom: { name: 40 },
};

const MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
const DATE_RE = /^([1-9]|[12][0-9]|3[01]) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)$/;

// "30 Nov" -> a sortable number in the Oct 2026 - Sep 2027 window.
export const dateKey = (s) => {
  const m = DATE_RE.exec(s);
  if (!m) return null;
  return MONTHS.indexOf(m[2]) * 40 + Number(m[1]);
};

class SpecError extends Error {
  constructor(problems, file) {
    super(
      `Invalid insert spec${file ? ` ${file}` : ""}:\n` +
        problems.map((p) => `  - ${p}`).join("\n") +
        "\nSee src/inserts/SPEC.md.",
    );
    this.name = "SpecError";
    this.problems = problems;
  }
}

const isObj = (v) => typeof v === "object" && v !== null && !Array.isArray(v);

// Validates a spec and returns it with every default filled in. Throws a
// SpecError listing every problem at once. `opts.customNames`, when given,
// is the list of custom scenes that exist (src/inserts/custom/*.tsx).
export const validateSpec = (raw, opts = {}) => {
  const P = [];
  const err = (path, msg) => P.push(`${path}: ${msg}`);
  if (!isObj(raw)) throw new SpecError(["the spec must be a JSON object"], opts.file);

  const known = (obj, path, keys) => {
    for (const k of Object.keys(obj)) {
      if (k.startsWith("_") || k === "$schema") continue; // comments
      if (!keys.includes(k)) err(path, `unknown field "${k}" (allowed: ${keys.join(", ")})`);
    }
  };
  const str = (obj, key, path, max, { required = false, def } = {}) => {
    const v = obj[key];
    if (v === undefined || v === null || v === "") {
      if (required) err(`${path}.${key}`, "is required");
      return def;
    }
    if (typeof v !== "string") {
      err(`${path}.${key}`, "must be a string");
      return def;
    }
    const len = [...v].length;
    if (len > max) err(`${path}.${key}`, `is ${len} characters; the limit is ${max} ("${v}")`);
    if (/https?:|www\.|\.(com|org|net|io|dog)\b/i.test(v)) err(`${path}.${key}`, `must not contain a URL ("${v}")`);
    if (/\bcalls?\b/i.test(v.replace(/Call Sheet/g, "")))
      err(`${path}.${key}`, `say "opportunities", never "calls" ("${v}")`);
    return v;
  };
  const oneOf = (obj, key, path, list, def) => {
    const v = obj[key];
    if (v === undefined) return def;
    if (!list.includes(v)) {
      err(`${path}.${key}`, `must be one of ${list.map((x) => JSON.stringify(x)).join(", ")}`);
      return def;
    }
    return v;
  };
  const bool = (obj, key, path, def) => {
    const v = obj[key];
    if (v === undefined) return def;
    if (typeof v !== "boolean") {
      err(`${path}.${key}`, "must be true or false");
      return def;
    }
    return v;
  };
  const num = (obj, key, path, [lo, hi], def) => {
    const v = obj[key];
    if (v === undefined) return def;
    if (typeof v !== "number" || !Number.isFinite(v) || v < lo || v > hi) {
      err(`${path}.${key}`, `must be a number from ${lo} to ${hi}`);
      return def;
    }
    return v;
  };
  const index = (obj, key, path, n, def) => {
    const v = obj[key];
    if (v === undefined) return def;
    if (!Number.isInteger(v) || v < 0 || v >= n) {
      err(`${path}.${key}`, `must be a whole number from 0 to ${n - 1} (0 is the first item)`);
      return def;
    }
    return v;
  };
  const date = (obj, key, path, required = true) => {
    const v = obj[key];
    if (v === undefined) {
      if (required) err(`${path}.${key}`, 'is required, as "D Mon", e.g. "30 Nov"');
      return undefined;
    }
    if (typeof v !== "string" || !DATE_RE.test(v)) {
      err(`${path}.${key}`, `must be "D Mon", e.g. "3 Nov" or "30 Nov" (got ${JSON.stringify(v)})`);
      return v;
    }
    return v;
  };
  const strList = (obj, key, path, [min, max], maxLen) => {
    const v = obj[key];
    if (!Array.isArray(v)) {
      err(`${path}.${key}`, `must be a list of ${min}–${max} strings`);
      return [];
    }
    if (v.length < min || v.length > max) err(`${path}.${key}`, `has ${v.length} items; it needs ${min}–${max}`);
    return v.map((_, i) => str(v, i, `${path}.${key}`, maxLen, { required: true }));
  };

  known(raw, "spec", ["ground", "align", "inFrom", "outTo", "scenes", "reel", "note"]);
  const spec = {
    ground: oneOf(raw, "ground", "spec", Object.keys(GROUNDS), "paper"),
    align: oneOf(raw, "align", "spec", ALIGNS, "left"),
    inFrom: oneOf(raw, "inFrom", "spec", DIRS, "none"),
    outTo: oneOf(raw, "outTo", "spec", DIRS, "none"),
    reel: typeof raw.reel === "string" ? raw.reel : undefined,
    note: typeof raw.note === "string" ? raw.note : undefined,
    scenes: [],
  };

  if (!Array.isArray(raw.scenes) || raw.scenes.length < 1 || raw.scenes.length > 3) {
    err("spec.scenes", "must be a list of 1–3 scenes");
    throw new SpecError(P, opts.file);
  }

  const COMMON = ["type", "seconds", "ground", "align", "entry", "transition", "inFrom", "kicker", "hook", "motif", "markAt"];

  raw.scenes.forEach((s, i) => {
    const path = `scenes[${i}]`;
    if (!isObj(s)) {
      err(path, "must be an object");
      return;
    }
    if (!SCENE_TYPES.includes(s.type)) {
      err(`${path}.type`, `must be one of ${SCENE_TYPES.join(", ")}`);
      return;
    }
    const t = s.type;
    const L = LIMITS[t];
    const out = {
      type: t,
      seconds: num(s, "seconds", path, SCENE_SECONDS, DEFAULT_SECONDS[t]),
      ground: oneOf(s, "ground", path, Object.keys(GROUNDS), undefined),
      align: oneOf(s, "align", path, ALIGNS, undefined),
      entry: oneOf(s, "entry", path, ENTRIES, undefined),
      // eslint-disable-next-line @remotion/non-pure-animation -- a spec field, not CSS
      transition: oneOf(s, "transition", path, TRANSITIONS, undefined),
      inFrom: oneOf(s, "inFrom", path, DIRS, undefined),
      kicker: str(s, "kicker", path, LIMITS.kicker),
      hook: str(s, "hook", path, LIMITS.hook),
      markAt: num(s, "markAt", path, [0.2, 4.5], undefined),
      motif: undefined,
    };
    out.ground = out.ground ?? spec.ground;
    out.align = out.align ?? spec.align;
    out.entry = out.entry ?? (t === "line" || t === "deadline" ? "type" : "rise");
    out.transition = out.transition ?? (i > 0 && out.ground !== spec.scenes[i - 1]?.ground ? "page" : "cut");
    out.inFrom = out.inFrom ?? (i === 0 ? spec.inFrom : out.transition === "page" ? "down" : "none");
    if (i === 0 && s.transition !== undefined) err(`${path}.transition`, "only scenes after the first take a transition");

    if (s.motif !== undefined) {
      const m = typeof s.motif === "string" ? { kind: s.motif } : s.motif;
      if (!isObj(m) || !MOTIFS.includes(m.kind)) {
        err(`${path}.motif`, `must be one of ${MOTIFS.join(", ")}, or { "kind": ..., "value": ..., "place": ..., "tint": ... }`);
      } else {
        known(m, `${path}.motif`, ["kind", "value", "place", "tint"]);
        out.motif = {
          kind: m.kind,
          value: str(m, "value", `${path}.motif`, LIMITS.motifValue),
          place: oneOf(m, "place", `${path}.motif`, ["above", "below"], "above"),
          tint: oneOf(m, "tint", `${path}.motif`, Object.keys(GROUNDS), undefined),
        };
      }
    }

    const looped = [];
    switch (t) {
      case "card": {
        known(s, path, [...COMMON, "name", "for", "gets", "closes", "loop"]);
        out.name = str(s, "name", path, L.name, { required: true });
        out.for = str(s, "for", path, L.for, { required: true });
        out.gets = str(s, "gets", path, L.gets, { required: true });
        out.closes = str(s, "closes", path, L.closes, { required: true });
        out.loop = oneOf(s, "loop", path, ["closes", "gets", "name", "none"], "closes");
        if (out.loop === "gets" && out.gets && [...out.gets].length > L.loopedGets)
          err(`${path}.gets`, `is looped, so keep it to ${L.loopedGets} characters`);
        if (out.loop === "name" && out.name && [...out.name].length > L.loopedName)
          err(`${path}.name`, `is looped, so keep it to ${L.loopedName} characters`);
        if (out.loop !== "none") looped.push(1);
        break;
      }
      case "amount": {
        known(s, path, [...COMMON, "amount", "label", "name", "line", "reveal", "loop"]);
        out.amount = str(s, "amount", path, L.amount, { required: true });
        out.label = str(s, "label", path, L.label);
        out.name = str(s, "name", path, L.name, { required: true });
        out.line = str(s, "line", path, L.line);
        const countable = /\d/.test(out.amount ?? "");
        out.reveal = oneOf(s, "reveal", path, ["count", "type"], countable ? "count" : "type");
        if (out.reveal === "count" && !countable) err(`${path}.reveal`, '"count" needs digits in the amount');
        else if (out.reveal === "count" && out.amount && countText(out.amount, 1) !== out.amount)
          err(`${path}.amount`, `counting up would land on "${countText(out.amount, 1)}", not "${out.amount}"; write it plainly or use "reveal": "type"`);
        out.loop = bool(s, "loop", path, true);
        if (out.loop) looped.push(1);
        break;
      }
      case "deadline": {
        known(s, path, [...COMMON, "date", "style", "weekday", "note", "label", "name", "loop"]);
        out.date = date(s, "date", path);
        out.style = oneOf(s, "style", path, ["calendar", "column"], "calendar");
        out.weekday = str(s, "weekday", path, L.weekday);
        out.note = str(s, "note", path, L.note);
        out.label = str(s, "label", path, L.label, { def: "Closes" });
        out.name = str(s, "name", path, L.name);
        out.loop = bool(s, "loop", path, true);
        if (out.loop) looped.push(1);
        break;
      }
      case "timezone": {
        known(s, path, [...COMMON, "label", "cities", "loop"]);
        out.label = str(s, "label", path, L.label);
        if (!Array.isArray(s.cities) || s.cities.length < L.min || s.cities.length > L.max) {
          err(`${path}.cities`, `must be a list of ${L.min}–${L.max} cities`);
          out.cities = [];
        } else {
          out.cities = s.cities.map((c, j) => {
            const cp = `${path}.cities[${j}]`;
            if (!isObj(c)) {
              err(cp, 'must be { "city": ..., "time": ..., "day": ... }');
              return { city: "", time: "" };
            }
            known(c, cp, ["city", "time", "day"]);
            return {
              city: str(c, "city", cp, L.city, { required: true }),
              time: str(c, "time", cp, L.time, { required: true }),
              day: str(c, "day", cp, L.day),
            };
          });
        }
        out.loop = index(s, "loop", path, Math.max(1, out.cities.length), 0);
        looped.push(1);
        break;
      }
      case "forwho":
      case "send": {
        known(s, path, [...COMMON, "headline", "items", "mark", "loop", "name"]);
        out.headline = str(s, "headline", path, L.headline, {
          def: t === "forwho" ? "This one's for you if…" : "What to send",
        });
        out.items = strList(s, "items", path, [L.min, L.max], L.item);
        out.mark = oneOf(s, "mark", path, ["loop", "ticks"], t === "forwho" ? "loop" : "ticks");
        out.loop = index(s, "loop", path, Math.max(1, out.items.length), out.items.length - 1);
        if (out.mark === "ticks" && s.loop !== undefined)
          err(`${path}.loop`, 'red ticks are the one red element, so there is no loop with "mark": "ticks"');
        out.name = str(s, "name", path, L.name);
        looped.push(1);
        break;
      }
      case "list": {
        known(s, path, [...COMMON, "label", "items", "loop"]);
        out.label = str(s, "label", path, L.label, { def: "Closes · soonest first" });
        if (!Array.isArray(s.items) || s.items.length < L.min || s.items.length > L.max) {
          err(`${path}.items`, `must be a list of ${L.min}–${L.max} opportunities`);
          out.items = [];
        } else {
          out.items = s.items.map((c, j) => {
            const cp = `${path}.items[${j}]`;
            if (!isObj(c)) {
              err(cp, 'must be { "closes": ..., "name": ..., "gets": ... }');
              return { closes: "", name: "" };
            }
            known(c, cp, ["closes", "name", "gets"]);
            return {
              closes: date(c, "closes", cp),
              name: str(c, "name", cp, L.name, { required: true }),
              gets: str(c, "gets", cp, L.gets),
            };
          });
          const keys = out.items.map((c) => dateKey(c.closes ?? ""));
          for (let j = 1; j < keys.length; j++) {
            if (keys[j] !== null && keys[j - 1] !== null && keys[j] < keys[j - 1])
              err(`${path}.items`, `must be soonest first (${out.items[j - 1].closes} comes before ${out.items[j].closes})`);
          }
        }
        out.loop = index(s, "loop", path, Math.max(1, out.items.length), 0);
        looped.push(1);
        break;
      }
      case "catch": {
        known(s, path, [...COMMON, "label", "text", "note", "name"]);
        out.label = str(s, "label", path, L.label, { def: "The catch" });
        out.text = str(s, "text", path, L.text, { required: true });
        out.note = str(s, "note", path, L.note);
        out.name = str(s, "name", path, L.name);
        break;
      }
      case "line": {
        known(s, path, [...COMMON, "text", "loop", "sub"]);
        out.text = str(s, "text", path, L.text, { required: true });
        out.sub = str(s, "sub", path, L.sub);
        out.loop = str(s, "loop", path, L.loop);
        if (out.text && (out.text.match(/\n/g) ?? []).length > 2) err(`${path}.text`, "has more than 3 lines");
        if (out.loop && out.text) {
          const n = out.text.split(out.loop).length - 1;
          if (n !== 1) err(`${path}.loop`, `must appear exactly once in the text (found ${n} times)`);
          if (out.loop.includes("\n")) err(`${path}.loop`, "can't span a line break");
          if (out.ground === "cherry") err(`${path}.loop`, "a red loop on a cherry ground won't read; pick another ground");
        }
        if (out.loop) looped.push(1);
        break;
      }
      case "custom": {
        known(s, path, [...COMMON, "name", "props"]);
        out.name = typeof s.name === "string" ? s.name : "";
        if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(out.name) || out.name.length > L.name)
          err(`${path}.name`, 'must be the custom scene\'s file name without ".tsx", like "trial-07"');
        else if (opts.customNames && !opts.customNames.includes(out.name))
          err(`${path}.name`, `no custom scene src/inserts/custom/${out.name}.tsx`);
        if (s.props !== undefined && !isObj(s.props)) err(`${path}.props`, "must be an object");
        out.props = isObj(s.props) ? s.props : {};
        break;
      }
      default:
        break;
    }
    spec.scenes.push(out);
  });

  const total = spec.scenes.reduce((a, s) => a + (s.seconds ?? 0), 0);
  if (total < TOTAL_SECONDS[0] - 1e-6 || total > TOTAL_SECONDS[1] + 1e-6)
    err("spec.scenes", `add up to ${total.toFixed(2)} s; an insert runs ${TOTAL_SECONDS[0]}–${TOTAL_SECONDS[1]} s (set each scene's "seconds")`);

  if (P.length > 0) throw new SpecError(P, opts.file);
  // Never break a compound at its hyphen or dash ("2-min", "15–20-page"): a
  // word joiner (U+2060, invisible) after it keeps the two halves together.
  for (const sc of spec.scenes) keepCompounds(sc);
  return spec;
};

const NOT_COPY = new Set(["type", "ground", "align", "entry", "transition", "inFrom", "style", "reveal", "mark", "kind", "place", "tint", "props", "value"]);
const COMPOUND = /([\p{L}\p{N}][-\u2013])(?=[\p{L}\p{N}])/gu;
const joinCompounds = (t) => t.replace(COMPOUND, "$1\u2060");
const keepCompounds = (obj) => {
  for (const [k, v] of Object.entries(obj)) {
    if (NOT_COPY.has(k) || (obj.type === "custom" && k === "name")) continue;
    if (typeof v === "string") obj[k] = joinCompounds(v);
    else if (Array.isArray(v)) v.forEach((x, i) => (typeof x === "string" ? (v[i] = joinCompounds(x)) : x && typeof x === "object" && keepCompounds(x)));
    else if (v && typeof v === "object") keepCompounds(v);
  }
};

// The count-up's text at progress k (0..1), keeping the amount's currency,
// suffix ("m", "k"), thousands separator and decimals: "$1.2m" counts
// 0.0, 0.1 … 1.2 and lands on exactly "$1.2m". A separator followed by
// exactly three digits is a thousands separator; otherwise it's a decimal
// mark. Returns null when the amount has no number to count.
export const countText = (text, k) => {
  const m = /\d[\d,.\u202f ]*\d|\d/.exec(text);
  if (!m) return null;
  const raw = m[0];
  const dec = /[.,](\d{1,2}|\d{4,})$/.exec(raw);
  const decMark = dec ? dec[0][0] : "";
  const decimals = dec ? dec[1].length : 0;
  const intRaw = dec ? raw.slice(0, raw.length - dec[0].length) : raw;
  const sepMatch = /\D/.exec(intRaw);
  const sep = sepMatch ? sepMatch[0] : "";
  const value = Number(intRaw.replace(/\D/g, "") + (dec ? "." + dec[1] : ""));
  const now = value * Math.min(Math.max(k, 0), 1);
  const fixed = now.toFixed(decimals);
  const [i, f] = fixed.split(".");
  const grouped = sep ? i.replace(/\B(?=(\d{3})+(?!\d))/g, sep) : i;
  const num = f !== undefined ? `${grouped}${decMark}${f}` : grouped;
  return text.slice(0, m.index) + num + text.slice(m.index + raw.length);
};

// Frame layout of a validated spec.
export const sceneFrames = (spec) => {
  let at = 0;
  return spec.scenes.map((s) => {
    const dur = Math.round(s.seconds * FPS);
    const r = { from: at, dur };
    at += dur;
    return r;
  });
};

export const durationInFrames = (spec) => sceneFrames(spec).reduce((a, s) => a + s.dur, 0);

// Frames the last scene spends leaving when the spec has an outTo.
export const OUT_FRAMES = 9;

// The poster: near the end, everything landed, before any exit move.
export const posterFrame = (spec) => {
  const d = durationInFrames(spec);
  return spec.outTo !== "none" ? d - OUT_FRAMES - 3 : d - 4;
};
