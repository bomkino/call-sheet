import type React from "react";
import { strike, typed } from "../cs/reveal";
import { CUSTOM } from "./custom";
import {
  Block,
  blockAt,
  CheckBox,
  Circled,
  Column,
  CountUp,
  ink,
  khCount,
  KickerHook,
  Label,
  labelInk,
  markFrame,
  Rule,
  Slip,
  Stamp,
  TYPE_RATE,
  Tx,
  useScene,
} from "./kit";
import { MotifSlot } from "./motifs";
import type {
  AmountScene,
  CardScene,
  CatchScene,
  ChecklistScene,
  CustomScene,
  DeadlineScene,
  LineScene,
  ListScene,
  Scene,
  TimezoneScene,
} from "./schema.mjs";

// The scene types. Each is one object with lots of air, laid out in the
// safe-zone column (kit.tsx), so nothing can overlap and long copy fails the
// render instead of crowding. Block indices set the order things arrive in.

const MONTH_NAMES: Record<string, string> = {
  Jan: "January", Feb: "February", Mar: "March", Apr: "April", May: "May", Jun: "June",
  Jul: "July", Aug: "August", Sep: "September", Oct: "October", Nov: "November", Dec: "December",
};

// Head of every scene: motif above (if placed there), kicker, hook.
const Head: React.FC = () => {
  const c = useScene();
  return (
    <>
      <MotifSlot place="above" i={0} />
      <KickerHook i={c.scene.motif?.place === "above" ? 1 : 0} />
    </>
  );
};
// The first block index after the head.
const after = (s: Scene) => (s.motif?.place === "above" ? 1 : 0) + khCount(s);

// ---------------------------------------------------------------- card

const Field: React.FC<{
  readonly label: string;
  readonly i: number;
  readonly children: React.ReactNode;
}> = ({ label, i, children }) => (
  <Block i={i} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <Label text={label} i={i} />
    {children}
  </Block>
);

const Card: React.FC<{ readonly s: CardScene }> = ({ s }) => {
  const c = useScene();
  const b = after(s);
  const mark = markFrame(c, b + 5);
  const loopOn = (k: CardScene["loop"]) => s.loop === k;
  return (
    <Column>
      <Head />
      <Slip i={b} style={{ gap: 30 }}>
        <Block i={b + 1}>
          <div data-pd-social="headline">
            {loopOn("name") ? (
              <Circled at={mark} id="name">
                <Tx text={s.name} i={b + 1} />
              </Circled>
            ) : (
              <Tx text={s.name} i={b + 1} />
            )}
          </div>
        </Block>
        <Rule i={b + 2} strong />
        <Field label="Who it's for" i={b + 2}>
          <div data-pd-social="subhead">
            <Tx text={s.for} i={b + 2} />
          </div>
        </Field>
        <Field label="You get" i={b + 3}>
          <div data-pd-social="subhead">
            {loopOn("gets") ? (
              <Circled at={mark} id="gets">
                <Tx text={s.gets} i={b + 3} />
              </Circled>
            ) : (
              <Tx text={s.gets} i={b + 3} />
            )}
          </div>
        </Field>
        <Field label="Closes" i={b + 4}>
          <div data-pd-social="headline" style={{ whiteSpace: "nowrap" }}>
            <Circled at={mark} on={loopOn("closes")} id="closes">
              <Tx text={s.closes} i={b + 4} />
            </Circled>
          </div>
        </Field>
      </Slip>
      <MotifSlot place="below" i={b + 5} />
    </Column>
  );
};

// ---------------------------------------------------------------- amount

const Amount: React.FC<{ readonly s: AmountScene }> = ({ s }) => {
  const c = useScene();
  const b = after(s);
  const at = blockAt(c, b + 1);
  const mark = Math.max(markFrame(c, b + 3), at + (s.reveal === "count" ? 22 : 10));
  return (
    <Column gap={40}>
      <Head />
      {s.label ? (
        <Block i={b}>
          <Label text={s.label} i={b} />
        </Block>
      ) : null}
      <Block i={b + 1} lift={20}>
        <div data-pd-social="metric" style={{ whiteSpace: "nowrap" }}>
          <Circled at={mark} on={s.loop} id="amount">
            {s.reveal === "count" ? (
              <CountUp text={s.amount} at={at} />
            ) : (
              typed(s.amount, c.f - at, 0.8)
            )}
          </Circled>
        </div>
      </Block>
      <Rule i={b + 2} />
      <Block i={b + 2}>
        <div data-pd-social="headline">
          <Tx text={s.name} i={b + 2} />
        </div>
      </Block>
      {s.line ? (
        <Block i={b + 3}>
          <div data-pd-social="subhead" style={{ color: labelInk }}>
            <Tx text={s.line} i={b + 3} />
          </div>
        </Block>
      ) : null}
      <MotifSlot place="below" i={b + 4} />
    </Column>
  );
};

// ---------------------------------------------------------------- deadline

const DateStrike: React.FC<{ readonly text: string; readonly at: number }> = ({ text, at }) => {
  const c = useScene();
  const st = strike(c.f, at);
  return <span style={{ display: "inline-block", opacity: st.opacity, scale: `${st.scale}` }}>{text}</span>;
};

const Deadline: React.FC<{ readonly s: DeadlineScene }> = ({ s }) => {
  const c = useScene();
  const b = after(s);
  const [day, mon] = s.date.split(" ");
  const strikeAt = blockAt(c, b + 1) + 2;
  const mark = Math.max(markFrame(c, b + 3), strikeAt + 8);
  const center = s.align === "center";
  if (s.style === "column") {
    return (
      <Column>
        <Head />
        <Slip i={b} pad="40px 44px 44px" style={{ gap: 0 }}>
          {/* A grid: the CLOSES column takes the date's own width. */}
          <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 0, textAlign: "left" }}>
            <Block i={b} style={{ textAlign: "center", padding: "0 34px 18px 10px" }}>
              <Label text={s.label} i={b} />
            </Block>
            <Block i={b} style={{ paddingLeft: 30 }}>
              <Label text="The opportunity" i={b} />
            </Block>
            <div style={{ gridColumn: "1 / 3" }}>
              <Rule i={b} strong />
            </div>
            <div
              data-pd-social="headline"
              style={{ textAlign: "center", whiteSpace: "nowrap", padding: "0 34px 0 10px", minHeight: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              <Circled at={mark} on={s.loop} id="date">
                <DateStrike text={s.date} at={strikeAt} />
              </Circled>
            </div>
            <div
              data-pd-social="subhead"
              style={{ borderLeft: "2px solid rgba(21,19,15,0.16)", paddingLeft: 30, display: "flex", alignItems: "center", minWidth: 0 }}
            >
              <Block i={b + 2}>
                <div data-max-lines="2">
                  <Tx text={s.name ?? ""} i={b + 2} />
                </div>
              </Block>
            </div>
          </div>
          <Rule i={b + 1} />
        </Slip>
        {s.note ? (
          <Block i={b + 3}>
            <div data-pd-social="headline">
              <Tx text={s.note} i={b + 3} />
            </div>
          </Block>
        ) : null}
        <MotifSlot place="below" i={b + 4} />
      </Column>
    );
  }
  // The calendar page: a month band, the label, one big day.
  return (
    <Column>
      <Head />
      <Slip i={b} width={560} pad="0" style={{ gap: 0, alignSelf: center ? "center" : "flex-start", textAlign: "center" }}>
        <div style={{ position: "relative", backgroundColor: ink, color: "#FBF9F3", padding: "22px 0 18px" }}>
          <div data-pd-social="metadata" style={{ color: "#FBF9F3" }}>
            {typed(`${MONTH_NAMES[mon] ?? mon}`, c.f - blockAt(c, b), 2)}
          </div>
          {/* the binding: two rings */}
          {[150, 410].map((x) => (
            <div key={x} style={{ position: "absolute", left: x - 9, top: -22, width: 18, height: 40, borderRadius: 9, backgroundColor: "#2a2620", border: "3px solid #15130F" }} />
          ))}
        </div>
        <div style={{ padding: "34px 0 44px", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <Label text={s.label} i={b} />
          <div data-pd-social="metric" style={{ whiteSpace: "nowrap", padding: "10px 0" }}>
            <Circled at={mark} on={s.loop} id="day">
              <DateStrike text={day} at={strikeAt} />
            </Circled>
          </div>
          {s.weekday ? <Label text={s.weekday} i={b + 1} /> : null}
        </div>
      </Slip>
      {s.note ? (
        <Block i={b + 2}>
          <div data-pd-social="headline">
            <Tx text={s.note} i={b + 2} />
          </div>
        </Block>
      ) : null}
      {s.name ? (
        <Block i={b + 3}>
          <div data-pd-social="subhead">
            <Tx text={s.name} i={b + 3} />
          </div>
        </Block>
      ) : null}
      <MotifSlot place="below" i={b + 4} />
    </Column>
  );
};

// ---------------------------------------------------------------- timezone

const Timezone: React.FC<{ readonly s: TimezoneScene }> = ({ s }) => {
  const c = useScene();
  const b = after(s);
  const rowAt = (j: number) => blockAt(c, b + 1) + j * 6;
  const lastAt = rowAt(s.cities.length - 1);
  const mark = Math.max(markFrame(c, b + 1), lastAt + 10);
  return (
    <Column gap={36}>
      <Head />
      {s.label ? (
        <Block i={b}>
          <Label text={s.label} i={b} />
        </Block>
      ) : null}
      <div style={{ display: "flex", flexDirection: "column", alignSelf: "stretch" }}>
        <Rule i={b} strong />
        {s.cities.map((city, j) => {
          const at = rowAt(j);
          const o = c.f >= at ? 1 : 0;
          const k = Math.min(1, Math.max(0, (c.f - at) / 10));
          const e = 1 - (1 - k) ** 3;
          const dim = s.loop === j || c.f < mark ? 1 : 0.55 + 0.45 * Math.max(0, 1 - (c.f - mark) / 10);
          return (
            <div key={j} style={{ display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 24,
                  minHeight: s.cities.length > 4 ? 112 : 140,
                  opacity: o * (0.0 + e) * dim,
                  translate: `${(1 - e) * -30}px 0`,
                  textAlign: "left",
                }}
              >
                <div data-pd-social="headline" style={{ whiteSpace: "nowrap" }}>
                  <Circled at={mark} on={s.loop === j} id={`city-${j}`}>
                    {city.city}
                  </Circled>
                </div>
                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", gap: 6, flex: "none" }}>
                  <div data-pd-social="subhead" style={{ whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>
                    {typed(city.time, c.f - at - 2, TYPE_RATE)}
                  </div>
                  {city.day ? (
                    <div data-pd-social="subhead" style={{ color: labelInk, whiteSpace: "nowrap" }}>
                      {typed(city.day, c.f - at - 3, TYPE_RATE)}
                    </div>
                  ) : null}
                </div>
              </div>
              <div style={{ height: 2, backgroundColor: "rgba(21,19,15,0.16)", scale: `${e} 1`, transformOrigin: "0 50%" }} />
            </div>
          );
        })}
      </div>
      <MotifSlot place="below" i={b + 2 + s.cities.length} />
    </Column>
  );
};

// ---------------------------------------------------------------- forwho / send

const Checklist: React.FC<{ readonly s: ChecklistScene }> = ({ s }) => {
  const c = useScene();
  const hasHook = Boolean(s.hook);
  // On a checklist the hook *is* the headline.
  const b = (s.motif?.place === "above" ? 1 : 0) + (s.kicker ? 1 : 0);
  const items0 = b + 1;
  const lastItem = items0 + s.items.length - 1;
  const red = s.mark === "ticks";
  const tickAt = (j: number) => blockAt(c, items0 + j) + 8 + j * 3;
  const mark = Math.max(markFrame(c, lastItem), tickAt(s.items.length - 1) + 8);
  const onSlip = s.type === "send";
  const list = (
    <div style={{ display: "flex", flexDirection: "column", alignSelf: "stretch", textAlign: "left" }}>
      {s.items.map((item, j) => (
        <Block key={j} i={items0 + j} lift={20}>
          <div style={{ display: "flex", gap: red ? 30 : 80, alignItems: "first baseline", padding: "26px 0" }}>
            <CheckBox tickAt={tickAt(j)} red={red} />
            <div data-pd-social="subhead" data-max-lines="3" style={{ paddingTop: 2 }}>
              <Circled at={mark} on={!red && s.loop === j} id={`item-${j}`} maxLeft={30}>
                <Tx text={item} i={items0 + j} />
              </Circled>
            </div>
          </div>
          <div style={{ height: 2, backgroundColor: "rgba(21,19,15,0.16)" }} />
        </Block>
      ))}
    </div>
  );
  return (
    <Column gap={36}>
      <MotifSlot place="above" i={0} />
      {s.kicker ? (
        <Block i={b - 1}>
          <Label text={s.kicker} i={b - 1} />
        </Block>
      ) : null}
      <Block i={b}>
        <div data-pd-social="headline">
          <Tx text={hasHook ? (s.hook as string) : s.headline} i={b} />
        </div>
      </Block>
      {onSlip ? (
        <Slip i={items0} pad="20px 48px 34px" style={{ gap: 0 }}>
          {list}
        </Slip>
      ) : (
        list
      )}
      {s.name ? (
        <Block i={lastItem + 1}>
          <div data-pd-social="subhead" style={{ color: labelInk }}>
            <Tx text={s.name} i={lastItem + 1} />
          </div>
        </Block>
      ) : null}
      <MotifSlot place="below" i={lastItem + 2} />
    </Column>
  );
};

// ---------------------------------------------------------------- list

const List: React.FC<{ readonly s: ListScene }> = ({ s }) => {
  const c = useScene();
  const b = after(s);
  const rowAt = (j: number) => blockAt(c, b + 1) + j * 5;
  const mark = Math.max(markFrame(c, b + 1), rowAt(s.items.length - 1) + 12);
  const dense = s.items.length >= 5;
  return (
    <Column>
      <Head />
      <Slip i={b} pad="40px 44px 30px" style={{ gap: 0, textAlign: "left" }}>
        <Block i={b} style={{ display: "flex", justifyContent: "space-between" }}>
          <Label text={s.label} i={b} />
        </Block>
        <div style={{ height: 16 }} />
        <Rule i={b} strong />
        {/* A grid: the CLOSES column takes the widest date's own width, and
            the names get the rest. */}
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center" }}>
          {s.items.map((it, j) => {
            const at = rowAt(j);
            const st = strike(c.f, at);
            const line = j < s.items.length - 1 ? "2px solid rgba(21,19,15,0.16)" : "2px solid transparent";
            return [
              <div
                key={`d${j}`}
                data-pd-social="headline"
                style={{
                  alignSelf: "stretch",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: dense ? 118 : 146,
                  padding: "0 40px 0 6px",
                  whiteSpace: "nowrap",
                  borderBottom: line,
                }}
              >
                <span style={{ display: "inline-block", opacity: st.opacity, scale: `${st.scale}` }}>
                  <Circled at={mark} on={s.loop === j} id={`row-${j}`}>
                    {it.closes}
                  </Circled>
                </span>
              </div>,
              <div
                key={`n${j}`}
                style={{
                  alignSelf: "stretch",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 6,
                  padding: "14px 0",
                  minWidth: 0,
                  borderBottom: line,
                  opacity: st.opacity,
                }}
              >
                <div data-pd-social="subhead" data-max-lines="2">
                  {typed(it.name, c.f - at - 1, TYPE_RATE)}
                </div>
                {it.gets ? (
                  <div data-pd-social="metadata" style={{ color: labelInk }}>
                    {typed(it.gets, c.f - at - 3, TYPE_RATE)}
                  </div>
                ) : null}
              </div>,
            ];
          })}
        </div>
      </Slip>
      <MotifSlot place="below" i={b + 2 + s.items.length} />
    </Column>
  );
};

// ---------------------------------------------------------------- catch

const Catch: React.FC<{ readonly s: CatchScene }> = ({ s }) => {
  const c = useScene();
  const b = after(s);
  const stampAt = Math.max(markFrame(c, b + 3), blockAt(c, b + 3) + 6);
  return (
    <Column>
      <Head />
      <Slip i={b} style={{ gap: 30 }}>
        <Stamp text={s.label} at={stampAt} />
        <Block i={b + 1}>
          <div data-pd-social="headline">
            <Tx text={s.text} i={b + 1} />
          </div>
        </Block>
        {s.note ? (
          <Block i={b + 2}>
            <div data-pd-social="subhead" style={{ color: labelInk }}>
              <Tx text={s.note} i={b + 2} />
            </div>
          </Block>
        ) : null}
        {s.name ? (
          <>
            <Rule i={b + 3} />
            <Block i={b + 3}>
              <Label text={s.name} i={b + 3} />
            </Block>
          </>
        ) : null}
      </Slip>
      <MotifSlot place="below" i={b + 4} />
    </Column>
  );
};

// ---------------------------------------------------------------- line

const Line: React.FC<{ readonly s: LineScene }> = ({ s }) => {
  const c = useScene();
  const b = after(s);
  const role = [...s.text].length <= 32 ? "display" : "headline";
  const at = blockAt(c, b);
  const mark = Math.max(markFrame(c, b + 1), at + Math.ceil([...s.text].length / TYPE_RATE) + 6);
  const parts = s.loop ? s.text.split(s.loop) : [s.text];
  // Type the text in one pass, with the looped words kept whole in their span.
  const typedRange = (text: string, offset: number) =>
    c.scene.entry === "type" ? typed(text, c.f - at - offset / TYPE_RATE, TYPE_RATE) : text;
  return (
    <Column gap={48}>
      <Head />
      <Block i={b}>
        <div data-pd-social={role} style={{ whiteSpace: "pre-line" }}>
          {typedRange(parts[0], 0)}
          {s.loop ? (
            <>
              <Circled at={mark} id="line">
                {typedRange(s.loop, [...parts[0]].length)}
              </Circled>
              {typedRange(parts[1], [...parts[0]].length + [...s.loop].length)}
            </>
          ) : null}
        </div>
      </Block>
      {s.sub ? (
        <Block i={b + 1}>
          <div data-pd-social="subhead">
            <Tx text={s.sub} i={b + 1} delay={Math.ceil([...s.text].length / TYPE_RATE) - 4} />
          </div>
        </Block>
      ) : null}
      <MotifSlot place="below" i={b + 2} />
    </Column>
  );
};

// ---------------------------------------------------------------- custom

const Custom: React.FC<{ readonly s: CustomScene }> = ({ s }) => {
  const Comp = CUSTOM[s.name];
  if (!Comp) throw new Error(`No custom insert scene "${s.name}" (expected src/inserts/custom/${s.name}.tsx)`);
  return <Comp scene={s} props={s.props} />;
};

export const SceneBody: React.FC<{ readonly s: Scene }> = ({ s }) => {
  switch (s.type) {
    case "card":
      return <Card s={s} />;
    case "amount":
      return <Amount s={s} />;
    case "deadline":
      return <Deadline s={s} />;
    case "timezone":
      return <Timezone s={s} />;
    case "forwho":
    case "send":
      return <Checklist s={s} />;
    case "list":
      return <List s={s} />;
    case "catch":
      return <Catch s={s} />;
    case "line":
      return <Line s={s} />;
    case "custom":
      return <Custom s={s} />;
    default:
      return null;
  }
};
