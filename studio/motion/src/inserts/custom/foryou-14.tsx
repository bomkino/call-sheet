import type React from "react";
import { Block, blockAt, CheckBox, Circled, Column, Label, markFrame, rule, Tx, TYPE_RATE, useScene } from "../kit";
import { MotifSlot } from "../motifs";
import type { CustomSceneProps } from ".";

// foryou 14, "Five straight minutes" (Tribeca AT&T Untold Stories).
// The Reel tests saying who it's for in the data's exact words, which are
// longer than a forwho item allows (34). This is the forwho checklist with
// items that may wrap, and the loop round one phrase inside one item.
//
// props: {
//   "headline"?: string,            default "This one's for you if…"
//   "items": string[] (2–3, each ≤ 90),
//   "loop": { "item": number, "text": string }   text must occur in that item
// }
const ForYou14: React.FC<CustomSceneProps> = ({ scene, props }) => {
  const c = useScene();
  const headline = typeof props.headline === "string" ? props.headline : "This one's for you if…";
  const items = Array.isArray(props.items) ? props.items.map(String).slice(0, 3) : [];
  if (items.length < 2) throw new Error("foryou-14: props.items needs 2–3 strings");
  if (items.some((t) => t.length > 90)) throw new Error("foryou-14: each item must be 90 characters or fewer");
  const lp = (props.loop ?? {}) as { item?: unknown; text?: unknown };
  const loopItem = typeof lp.item === "number" ? lp.item : -1;
  const loopText = typeof lp.text === "string" ? lp.text : "";
  if (loopItem >= 0 && (!loopText || !items[loopItem]?.includes(loopText)))
    throw new Error("foryou-14: props.loop.text must occur in items[props.loop.item]");

  const b = (scene.motif?.place === "above" ? 1 : 0) + (scene.kicker ? 1 : 0);
  const items0 = b + 1;
  const lastItem = items0 + items.length - 1;
  const tickAt = (j: number) => blockAt(c, items0 + j) + 8 + j * 3;
  const mark = Math.max(markFrame(c, lastItem), tickAt(items.length - 1) + 8);

  const itemText = (text: string, j: number) => {
    if (j !== loopItem) return <Tx text={text} i={items0 + j} />;
    const at = text.indexOf(loopText);
    const pre = text.slice(0, at);
    const post = text.slice(at + loopText.length);
    const d1 = pre.length / TYPE_RATE;
    const d2 = (pre.length + loopText.length) / TYPE_RATE;
    return (
      <>
        <Tx text={pre} i={items0 + j} />
        <Circled at={mark} id={`f14-${j}`} maxLeft={30}>
          <span style={{ whiteSpace: "nowrap" }}>
            <Tx text={loopText} i={items0 + j} delay={d1} />
          </span>
        </Circled>
        <Tx text={post} i={items0 + j} delay={d2} />
      </>
    );
  };

  return (
    <Column gap={36}>
      <MotifSlot place="above" i={0} />
      {scene.kicker ? (
        <Block i={b - 1}>
          <Label text={scene.kicker} i={b - 1} />
        </Block>
      ) : null}
      <Block i={b}>
        <div data-pd-social="headline">
          <Tx text={headline} i={b} />
        </div>
      </Block>
      <div style={{ display: "flex", flexDirection: "column", alignSelf: "stretch", textAlign: "left" }}>
        {items.map((item, j) => (
          <Block key={j} i={items0 + j} lift={20}>
            <div style={{ display: "flex", gap: 80, alignItems: "first baseline", padding: "26px 0" }}>
              <CheckBox tickAt={tickAt(j)} red={false} />
              <div data-pd-social="subhead" style={{ paddingTop: 2 }}>
                {itemText(item, j)}
              </div>
            </div>
            <div style={{ height: 2, backgroundColor: rule }} />
          </Block>
        ))}
      </div>
      <MotifSlot place="below" i={lastItem + 1} />
    </Column>
  );
};

export default ForYou14;
