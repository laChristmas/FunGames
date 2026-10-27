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

export function clockRunning(input: { kind: string; winner?: string; players: number; away?: number }) {
  return Boolean(input.kind) && input.kind !== "none" && !input.winner && input.players >= 2 && !input.away;
}

export function formatClock(ms: number) {
  const seconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}
