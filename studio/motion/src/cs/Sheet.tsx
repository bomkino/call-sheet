import type React from "react";
import { cs } from "../brand/palette";
import { CALLS, CIRCLED } from "./calls";
import type { SheetLayout } from "./layout";
import { strike, typed } from "./reveal";

// The printed call sheet: ruled like production paperwork, typewriter labels
// in the corners of each box, the calls soonest first, one big date per row.
// Each row arrives on its own frame: the date strikes, then the words type.
export const Sheet: React.FC<{
  readonly L: SheetLayout;
  readonly frame: number;
  readonly arrivals: number[];
  readonly headerAt: number;
}> = ({ L, frame, arrivals, headerAt }) => {
  const rows = CALLS.slice(0, L.rows);
  const ruleW = L.right - L.left;
  return (
    <>
      {/* header: typewriter labels, the way a call sheet labels its boxes */}
      <div
        data-pd-social="metadata"
        style={{
          position: "absolute",
          left: L.left,
          top: L.headerTop,
          width: ruleW,
          display: "flex",
          justifyContent: "space-between",
          color: cs.toner,
        }}
      >
        <span>{typed(L.givesX ? "Film & TV calls · soonest first" : "Film & TV calls", frame - headerAt, 3)}</span>
        <span>{typed("Edition 1 · White pages", frame - headerAt - 2, 3)}</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: L.left,
          top: L.headerRule,
          width: ruleW,
          height: 3,
          backgroundColor: cs.ruleStrong,
        }}
      />
      <div
        data-pd-social="metadata"
        style={{
          position: "absolute",
          left: L.left,
          top: L.colTop,
          width: L.dateW,
          textAlign: "center",
          color: cs.toner,
        }}
      >
        {typed("Closes", frame - headerAt - 1, 3)}
      </div>
      <div
        data-pd-social="metadata"
        style={{ position: "absolute", left: L.nameX, top: L.colTop, color: cs.toner }}
      >
        {typed(
          L.givesX ? "The call" : L.right - L.nameX >= 650 ? "The call · what you get · soonest first" : "The call · what you get",
          frame - headerAt - 3,
          3,
        )}
      </div>
      {L.givesX ? (
        <div
          data-pd-social="metadata"
          style={{ position: "absolute", left: L.givesX, top: L.colTop, color: cs.toner }}
        >
          {typed("What you get", frame - headerAt - 4, 3)}
        </div>
      ) : null}
      {/* the column rule */}
      <div
        style={{
          position: "absolute",
          left: L.left + L.dateW,
          top: L.headerRule,
          width: 2,
          height: L.rowsTop + L.rowH * rows.length - L.headerRule,
          backgroundColor: cs.rule,
        }}
      />
      {rows.map((call, i) => {
        const at = arrivals[i];
        const top = L.rowsTop + i * L.rowH;
        const s = strike(frame, at);
        return (
          <div key={i}>
            <div
              style={{
                position: "absolute",
                left: L.left,
                top: top + L.rowH,
                width: ruleW,
                height: 2,
                backgroundColor: cs.rule,
              }}
            />
            <div
              data-pd-social={L.dateRole}
              style={{
                position: "absolute",
                left: L.left,
                top,
                width: L.dateW,
                height: L.rowH,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: cs.ink,
                opacity: s.opacity,
                scale: `${s.scale}`,
                whiteSpace: "nowrap",
              }}
              data-circled={i === CIRCLED ? "" : undefined}
            >
              {call.closes}
            </div>
            {L.givesX ? (
              <>
                <div
                  data-pd-social="label"
                  style={{
                    position: "absolute", left: L.nameX, top, width: L.givesX - L.nameX - 32, height: L.rowH,
                    display: "flex", alignItems: "center", color: cs.ink,
                  }}
                >
                  <div>{typed(call.name, frame - at - 1, L.typeRate)}</div>
                </div>
                <div
                  data-pd-social="metadata"
                  style={{
                    position: "absolute", left: L.givesX, top, width: L.right - L.givesX, height: L.rowH,
                    display: "flex", alignItems: "center", color: cs.toner,
                  }}
                >
                  <div>{typed(call.gives, frame - at - 2, L.typeRate)}</div>
                </div>
              </>
            ) : (
              <div
                style={{
                  position: "absolute",
                  left: L.nameX,
                  top,
                  width: L.right - L.nameX,
                  height: L.rowH,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: L.gap,
                }}
              >
                <div data-pd-social="label" style={{ color: cs.ink }}>
                  {typed(call.name, frame - at - 1, L.typeRate)}
                </div>
                <div data-pd-social="metadata" style={{ color: cs.toner }}>
                  {typed(call.gives, frame - at - 3, L.typeRate)}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};
