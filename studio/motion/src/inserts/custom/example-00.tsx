import type React from "react";
import { Block, blockAt, Circled, Column, KickerHook, khCount, Label, markFrame, Slip, Tx, useScene } from "../kit";
import { MotifSlot } from "../motifs";
import type { CustomSceneProps } from ".";

// A template for custom insert scenes. Copy it to <series>-<nn>.tsx (for
// example trial-07.tsx), change what it draws, and use it from a spec as
//   { "type": "custom", "name": "trial-07", "seconds": 3, "props": { ... } }
//
// Stay inside the family: lay out in <Column> (it keeps to the safe zone and
// fails the render if the copy doesn't fit), use the type roles, at most one
// red mark (<Circled>, or <Tick red>), and arrive with <Block i={n}>.
//
// This one shows a word and a value on a slip, the value circled.
// props: { "label": string, "word": string, "value": string }
const Example: React.FC<CustomSceneProps> = ({ scene, props }) => {
  const c = useScene();
  const label = String(props.label ?? "Example");
  const word = String(props.word ?? "Custom scene");
  const value = String(props.value ?? "42");
  const b = (scene.motif?.place === "above" ? 1 : 0) + khCount(scene);
  return (
    <Column>
      <MotifSlot place="above" i={0} />
      <KickerHook i={scene.motif?.place === "above" ? 1 : 0} />
      <Slip i={b}>
        <Block i={b}>
          <Label text={label} i={b} />
        </Block>
        <Block i={b + 1}>
          <div data-pd-social="headline">
            <Tx text={word} i={b + 1} />
          </div>
        </Block>
        <Block i={b + 2}>
          <div data-pd-social="metric" style={{ whiteSpace: "nowrap" }}>
            <Circled at={Math.max(markFrame(c, b + 2), blockAt(c, b + 2) + 10)} id="custom">
              {value}
            </Circled>
          </div>
        </Block>
      </Slip>
      <MotifSlot place="below" i={b + 3} />
    </Column>
  );
};

export default Example;
