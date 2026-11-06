// Beat grids for the two stings. 120 BPM: 15 frames a beat at 30 fps, so an
// eighth is 7.5 frames and a sixteenth 3.75. Beat 1 falls on frame 0, so the
// sting can cut in on a downbeat. scripts/make_score.py reads the same files.
import t2 from "./timeline-2s.json";
import t5 from "./timeline-5s.json";

export type Timeline = typeof t5;
export const TIMELINES = { "2s": t2, "5s": t5 } as const;
export type Variant = keyof typeof TIMELINES;

export const beatFrame = (tl: { firstBeat: number; framesPerBeat: number }, beat: number) =>
  Math.round(tl.firstBeat + (beat - 1) * tl.framesPerBeat);

// Every event's frame. The 5s has the sheet's events too; the 2s is the ending.
export type Frames = {
  header?: number;
  rows?: number[];
  loopStart: number;
  loopEnd: number;
  settle?: number;
  cut?: number;
  earStart: number;
  earEnd: number;
  line1?: number;
  line2?: number;
  url: number;
  urlRate: number;
  ding: number;
  end: number;
};
