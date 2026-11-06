// The pitch.dog type system, pinned in package.json, owns every family, size
// and axis value. This file loads it and holds the render until the faces the
// scenes use have loaded; add a face here when a scene uses a new role.
import "@pitchdog/type-system/fonts.css";
import "@pitchdog/type-system/typography.css";
import "@pitchdog/type-system/social.css";
import { cancelRender, continueRender, delayRender } from "remotion";

const faces = [
  '600 110px "PD Head"',
  '500 80px "PD Head"',
  '400 48px "PD Body Alt"',
  '400 20px "PD Body"',
  '600 20px "PD Body"',
  '500 28px "PD Eyebrow"',
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
