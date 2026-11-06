import { Composition, Folder } from "remotion";
import { ExploreMacro, ExploreRiffle } from "./cs/Explore";
import { Sting } from "./cs/Sting";
import { TIMELINES } from "./cs/time";
import { SIZES } from "./sizes";
import { calculateInsertMetadata, Insert } from "./inserts/Insert";
import exampleInsert from "../inserts/specs/_examples/foryou-11-doc-edge-timezone.json";

// One composition per size, named <Scene>-<width>x<height>, which is how
// scripts/render.mjs finds them. Each size is laid out from its own safe area
// rather than cropped from another.
export const RemotionRoot: React.FC = () => (
  <>
    {(["5s", "2s"] as const).map((variant) => (
      <Folder key={variant} name={`Sting${variant}`}>
        {SIZES.map((size) => (
          <Composition
            key={size.id}
            id={`Sting${variant}-${size.id}`}
            component={Sting}
            defaultProps={{ variant, audio: true }}
            durationInFrames={TIMELINES[variant].durationInFrames}
            fps={TIMELINES[variant].fps}
            width={size.width}
            height={size.height}
          />
        ))}
      </Folder>
    ))}
    {/* Reel inserts: one composition, driven by a JSON spec (src/inserts/SPEC.md). */}
    <Composition
      id="Insert"
      component={Insert}
      defaultProps={{ spec: exampleInsert as Record<string, unknown> }}
      calculateMetadata={calculateInsertMetadata}
      durationInFrames={120}
      fps={30}
      width={1080}
      height={1920}
    />
    <Folder name="Explore">
      <Composition id="ExploreRiffle" component={ExploreRiffle} durationInFrames={60} fps={30} width={1080} height={1920} />
      <Composition id="ExploreMacro" component={ExploreMacro} durationInFrames={60} fps={30} width={1080} height={1920} />
    </Folder>
  </>
);
