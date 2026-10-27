import { type ClockChoice } from "@fungames/shared/clock";
import type { Stone } from "./rules";

export type Clock = {
  kind: ClockChoice["kind"];
  budget: number;
  blackMs: number;
  whiteMs: number;
};

export function createClock(choice: ClockChoice): Clock {
  return {
    kind: choice.kind,
    budget: choice.ms,
    blackMs: choice.ms,
    whiteMs: choice.ms,
  };
}

export function tickClock(clock: Clock, turn: Stone, elapsedMs: number): Clock {
  if (clock.kind === "none" || elapsedMs <= 0) return clock;
  const next = { ...clock };
  if (turn === 1) next.blackMs = Math.max(0, clock.blackMs - elapsedMs);
  else next.whiteMs = Math.max(0, clock.whiteMs - elapsedMs);
  return next;
}

export function timedOut(clock: Clock, turn: Stone) {
  if (clock.kind === "none") return false;
  return (turn === 1 ? clock.blackMs : clock.whiteMs) <= 0;
}

export function armTurn(clock: Clock, turn: Stone): Clock {
  if (clock.kind !== "move") return clock;
  const next = { ...clock };
  if (turn === 1) next.blackMs = clock.budget;
  else next.whiteMs = clock.budget;
  return next;
}

export function undoClock(clock: Clock, previous: Clock): Clock {
  if (clock.kind !== "move") return clock;
  return { ...clock, blackMs: previous.blackMs, whiteMs: previous.whiteMs };
}
