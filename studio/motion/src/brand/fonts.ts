// The pitch.dog type system, pinned in package.json (v3.0.0, commit
// 54207202fbb557758ad7851941d8944e722c4af6), owns every family, size and axis
// value. This file loads it and holds the render until the faces the scenes
// use have loaded. The logo itself is outlined PD Head 820 from the brand's
// own drawing code (src/marks.json), so it needs no face here.
import "@pitchdog/type-system/fonts.css";
import "@pitchdog/type-system/typography.css";
import "@pitchdog/type-system/social.css";
import { cancelRender, continueRender, delayRender } from "remotion";

const faces = [
  '500 80px "PD Head"', // social.headline: the dates on the sheet
  '600 30px "PD Body"', // social.label: call names, the sign-off
  '400 47px "PD Body Alt"', // social.subhead: the line
  '500 28px "PD Eyebrow"', // social.metadata: typewriter labels
];

const handle = delayRender("Loading pitch.dog fonts");

Promise.all(faces.map((face) => document.fonts.load(face)))
  .then((loaded) => {
    const missing = faces.filter((_, i) => loaded[i].length === 0);
    if (missing.length > 0) {
      throw new Error(`pitch.dog fonts did not load: ${missing.join(", ")}`);
    }
    continueRender(handle);
  })
  .catch((err) => cancelRender(err));
