import type React from "react";
import { strike, typed } from "../../cs/reveal";
import { Block, blockAt, Circled, Column, KickerHook, khCount, Label, labelInk, Rule, Slip, TYPE_RATE, useScene } from "../kit";
import { MotifSlot } from "../motifs";
import type { CustomScene } from "../schema.mjs";
import type { CustomSceneProps } from ".";

// orig 06, "The week on the wall": the hand-drawn week strip from the Reel,
// six ruled days with the empty ones left empty, so four deadlines in six days
// reads at a glance. The loop circles one day, as Manali's marker does.
//
// props: { "label"?: string, "days": [{ "day": "Sun 29 Nov", "name"?: string }] (3–6), "loop"?: number }
type Day = { readonly day: string; readonly name?: string };

const read = (props: Record<string, unknown>) => {
  const raw = Array.isArray(props.days) ? props.days : [];
  const days: Day[] = raw
    .filter((d): d is Record<string, unknown> => typeof d === "object" && d !== null)
    .map((d) => ({ day: String(d.day ?? ""), name: d.name === undefined ? undefined : String(d.name) }));
  if (days.length < 3 || days.length > 6) throw new Error("orig-06: props.days needs 3–6 days");
  for (const d of days) {
    if (!/^[A-Z][a-z]{2} \d{1,2} [A-Z][a-z]{2}$/.test(d.day)) throw new Error(`orig-06: day "${d.day}" should read like "Sun 29 Nov"`);
    if (d.name && [...d.name].length > 22) throw new Error(`orig-06: "${d.name}" is longer than 22 characters`);
  }
  const loop = typeof props.loop === "number" ? props.loop : -1;
  const label = typeof props.label === "string" ? props.label : "Closes";
  return { days, loop, label };
};

const WeekStrip: React.FC<CustomSceneProps> = ({ scene, props }) => {
  const c = useScene();
  const { days, loop, label } = read(props);
  const s = scene as CustomScene;
  const b = (s.motif?.place === "above" ? 1 : 0) + khCount(s);
  const rowAt = (j: number) => blockAt(c, b + 1) + j * 4;
  const mark = c.scene.markAt !== undefined ? Math.round(c.scene.markAt * 30) : rowAt(days.length - 1) + 8;
  return (
    <Column>
      <MotifSlot place="above" i={0} />
      <KickerHook i={s.motif?.place === "above" ? 1 : 0} />
      <Slip i={b} pad="38px 44px 26px" style={{ gap: 0, textAlign: "left" }}>
        <Block i={b}>
          <Label text={label} i={b} />
        </Block>
        <div style={{ height: 14 }} />
        <Rule i={b} strong />
        {days.map((d, j) => {
          const at = rowAt(j);
          const st = strike(c.f, at);
          return (
            <div key={j} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 40, minHeight: 118 }}>
                <div
                  data-pd-social="subhead"
                  style={{
                    flex: "none",
                    width: "10.5ch", // the days line up, at any scale
                    whiteSpace: "nowrap",
                    color: d.name ? undefined : labelInk,
                    opacity: st.opacity,
                    scale: `${st.scale}`,
                    transformOrigin: "0 50%",
                  }}
                >
                  <Circled at={mark} on={loop === j} id={`day-${j}`}>
                    {d.day}
                  </Circled>
                </div>
                {d.name ? (
                  <div data-pd-social="subhead" data-max-lines="2" style={{ minWidth: 0 }}>
                    {typed(d.name, c.f - at - 1, TYPE_RATE)}
                  </div>
                ) : null}
              </div>
              <div style={{ height: 2, backgroundColor: "rgba(21,19,15,0.16)", opacity: st.opacity }} />
            </div>
          );
        })}
      </Slip>
      <MotifSlot place="below" i={b + 2 + days.length} />
    </Column>
  );
};

export default WeekStrip;
