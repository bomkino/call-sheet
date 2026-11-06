import { Composition, Folder } from "remotion";
import { Explainer } from "./explainer/Explainer";
import { SIZES } from "./sizes";
import { durationInFrames, fps } from "./timeline";

// One composition per size, named <Scene>-<width>x<height>, which is how
// scripts/render.mjs finds them. Each size is laid out from its own safe area.
export const RemotionRoot: React.FC = () => (
  <Folder name="Explainer">
    {SIZES.map((size) => (
      <Composition
        key={size.id}
        id={`Explainer-${size.id}`}
        component={Explainer}
        durationInFrames={durationInFrames}
        fps={fps}
        width={size.width}
        height={size.height}
      />
    ))}
  </Folder>
);
