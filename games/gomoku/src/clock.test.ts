import assert from "node:assert/strict";
import test from "node:test";
import { armTurn, clockRunning, createClock, tickClock, timedOut, undoClock } from "./clock.ts";

test("只有双方都在且没有断线时才走表", () => {
  assert.equal(clockRunning({ kind: "move", winner: "", players: 2, away: 0 }), true);
  assert.equal(clockRunning({ kind: "move", players: 2 }), true);
  assert.equal(clockRunning({ kind: "none", winner: "", players: 2, away: 0 }), false);
  assert.equal(clockRunning({ kind: "side", winner: "", players: 1, away: 0 }), false);
  assert.equal(clockRunning({ kind: "side", winner: "", players: 2, away: 1 }), false);
  assert.equal(clockRunning({ kind: "side", winner: "1", players: 2, away: 0 }), false);
});

test("不限时不会减少，也不会超时", () => {
  const clock = createClock({ kind: "none", ms: 0 });
  const next = tickClock(clock, 1, 10_000);
  assert.equal(next, clock);
  assert.equal(timedOut(next, 1), false);
});

test("每步只减少当前一方，轮到时重新计满", () => {
  const clock = createClock({ kind: "move", ms: 15_000 });
  const spent = tickClock(clock, 1, 4_000);
  assert.equal(spent.blackMs, 11_000);
  assert.equal(spent.whiteMs, 15_000);
  const armed = armTurn(spent, 2);
  assert.equal(armed.whiteMs, 15_000);
  assert.equal(timedOut(tickClock(armed, 2, 15_000), 2), true);
});

test("每方总时只减少自己的时间，悔棋不退回", () => {
  const clock = createClock({ kind: "side", ms: 300_000 });
  const spent = tickClock(clock, 1, 20_000);
  assert.equal(spent.blackMs, 280_000);
  assert.equal(spent.whiteMs, 300_000);
  assert.equal(armTurn(spent, 2), spent);
  assert.equal(undoClock(spent, clock), spent);
});

test("每步悔棋退回上一手剩余时间", () => {
  const start = createClock({ kind: "move", ms: 15_000 });
  const afterBlack = armTurn(tickClock(start, 1, 4_000), 2);
  const afterWhite = armTurn(tickClock(afterBlack, 2, 2_000), 1);
  const restored = undoClock(afterWhite, afterBlack);
  assert.equal(restored.blackMs, 11_000);
  assert.equal(restored.whiteMs, 15_000);
});
