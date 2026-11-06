// Types for schema.mjs. SPEC.md documents every field.
export type Ground = "paper" | "white" | "blue" | "pink" | "yellow" | "green" | "goldenrod" | "buff" | "salmon" | "cherry";
export type Dir = "none" | "up" | "down" | "left" | "right";
export type Align = "left" | "center";
export type Entry = "rise" | "type" | "slide";
export type MotifKind =
  | "clock" | "kettle" | "mug" | "calendar" | "envelope" | "sticky" | "clapper" | "filmstrip"
  | "receipt" | "tag" | "tabs" | "magnifier" | "pinned" | "piles" | "laptop" | "passport";
export type Motif = { kind: MotifKind; value?: string; place: "above" | "below"; tint?: Ground };

type Common = {
  seconds: number;
  ground: Ground;
  align: Align;
  entry: Entry;
  transition: "cut" | "page";
  inFrom: Dir;
  kicker?: string;
  hook?: string;
  motif?: Motif;
  markAt?: number;
};

export type CardScene = Common & { type: "card"; name: string; for: string; gets: string; closes: string; loop: "closes" | "gets" | "name" | "none" };
export type AmountScene = Common & { type: "amount"; amount: string; label?: string; name: string; line?: string; reveal: "count" | "type"; loop: boolean };
export type DeadlineScene = Common & { type: "deadline"; date: string; style: "calendar" | "column"; weekday?: string; note?: string; label: string; name?: string; loop: boolean };
export type TimezoneScene = Common & { type: "timezone"; label?: string; cities: { city: string; time: string; day?: string }[]; loop: number };
export type ChecklistScene = Common & { type: "forwho" | "send"; headline: string; items: string[]; mark: "loop" | "ticks"; loop: number; name?: string };
export type ListScene = Common & { type: "list"; label: string; items: { closes: string; name: string; gets?: string }[]; loop: number };
export type CatchScene = Common & { type: "catch"; label: string; text: string; note?: string; name?: string };
export type LineScene = Common & { type: "line"; text: string; sub?: string; loop?: string };
export type CustomScene = Common & { type: "custom"; name: string; props: Record<string, unknown> };

export type Scene = CardScene | AmountScene | DeadlineScene | TimezoneScene | ChecklistScene | ListScene | CatchScene | LineScene | CustomScene;

export type InsertSpec = {
  ground: Ground;
  align: Align;
  inFrom: Dir;
  outTo: Dir;
  reel?: string;
  note?: string;
  scenes: Scene[];
};

export const SCHEMA_VERSION: number;
export const FPS: number;
export const WIDTH: number;
export const HEIGHT: number;
export const OUT_FRAMES: number;
export const GROUNDS: Record<Ground, string>;
export const MOTIFS: MotifKind[];
export const LIMITS: Record<string, unknown>;
export function validateSpec(raw: unknown, opts?: { customNames?: string[]; file?: string }): InsertSpec;
export function sceneFrames(spec: InsertSpec): { from: number; dur: number }[];
export function durationInFrames(spec: InsertSpec): number;
export function posterFrame(spec: InsertSpec): number;
export function dateKey(s: string): number | null;
export function countText(text: string, k: number): string | null;
