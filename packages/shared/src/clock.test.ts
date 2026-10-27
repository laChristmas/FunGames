import assert from "node:assert/strict";
import test from "node:test";
import { movePresets, parseClock, sidePresets } from "./clock.ts";

test("不限时和预设都接受", () => {
  assert.deepEqual(parseClock({ kind: "none" }), { kind: "none", ms: 0 });
  for (const ms of movePresets) assert.deepEqual(parseClock({ kind: "move", ms }), { kind: "move", ms });
  for (const ms of sidePresets) assert.deepEqual(parseClock({ kind: "side", ms }), { kind: "side", ms });
});

test("自定义时间超出范围就拒绝", () => {
  assert.equal(parseClock({ kind: "move", ms: 4_999 }), null);
  assert.equal(parseClock({ kind: "move", ms: 60 * 60 * 1000 + 1 }), null);
  assert.equal(parseClock({ kind: "side", ms: 59_000 }), null);
  assert.equal(parseClock({ kind: "side", ms: 181 * 60 * 1000 }), null);
  assert.equal(parseClock({ kind: "move" }), null);
  assert.equal(parseClock({ kind: "later", ms: 15_000 }), null);
});

test("无法识别的字段会被丢掉", () => {
  assert.deepEqual(parseClock({ kind: "none", extra: true }), { kind: "none", ms: 0 });
});
