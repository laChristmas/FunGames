"use client";

import { moveMaxMs, moveMinMs, movePresets, parseClock, sideMaxMs, sideMinMs, sidePresets, type ClockChoice } from "@fungames/shared/clock";
import { useState } from "react";

const moveLabels: Record<number, string> = {
  15_000: "15 秒",
  30_000: "30 秒",
  60_000: "1 分钟",
  300_000: "5 分钟",
};

const sideLabels: Record<number, string> = {
  300_000: "5 分钟",
  600_000: "10 分钟",
  900_000: "15 分钟",
  1_800_000: "30 分钟",
};

export function ClockSetup({ onStart }: { onStart: (choice: ClockChoice) => void }) {
  const [kind, setKind] = useState<"move" | "side">("move");
  const [custom, setCustom] = useState("");
  const [error, setError] = useState("");

  function startCustom() {
    const amount = Number(custom);
    const ms = kind === "move" ? amount * 1000 : amount * 60_000;
    const choice = parseClock({ kind, ms });
    if (!choice) {
      setError(kind === "move" ? "请填 5 秒到 60 分钟" : "请填 1 分钟到 180 分钟");
      return;
    }
    onStart(choice);
  }

  const presets = kind === "move" ? movePresets : sidePresets;
  const labels = kind === "move" ? moveLabels : sideLabels;

  return (
    <div className="clock-setup">
      <button type="button" onClick={() => onStart({ kind: "none", ms: 0 })}>
        不限时
      </button>
      <div className="clock-kind" role="group" aria-label="计时方式">
        <button type="button" aria-pressed={kind === "move"} onClick={() => setKind("move")}>
          每步
        </button>
        <button type="button" aria-pressed={kind === "side"} onClick={() => setKind("side")}>
          每方总时
        </button>
      </div>
      <div className="clock-presets">
        {presets.map((ms) => (
          <button key={ms} type="button" onClick={() => onStart({ kind, ms })}>
            {labels[ms]}
          </button>
        ))}
      </div>
      <label>
        自定义{kind === "move" ? `秒（${moveMinMs / 1000} 到 ${moveMaxMs / 1000}）` : `分钟（${sideMinMs / 60000} 到 ${sideMaxMs / 60000}）`}
        <input inputMode="numeric" value={custom} onChange={(event) => setCustom(event.target.value)} />
      </label>
      <button type="button" onClick={startCustom}>
        用这个时间
      </button>
      {error ? <p className="form-error">{error}</p> : null}
    </div>
  );
}
