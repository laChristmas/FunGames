import { z } from "zod";

export const movePresets = [15_000, 30_000, 60_000, 300_000];
export const sidePresets = [300_000, 600_000, 900_000, 1_800_000];
export const moveMinMs = 5_000;
export const moveMaxMs = 60 * 60 * 1000;
export const sideMinMs = 60_000;
export const sideMaxMs = 180 * 60 * 1000;

const clockMessage = z.object({
  kind: z.enum(["none", "move", "side"]),
  ms: z.number().int().optional(),
});

export type ClockChoice = { kind: "none" | "move" | "side"; ms: number };

export function parseClock(input: unknown): ClockChoice | null {
  const parsed = clockMessage.safeParse(input);
  if (!parsed.success) return null;
  const { kind } = parsed.data;
  if (kind === "none") return { kind, ms: 0 };
  const ms = parsed.data.ms;
  if (ms === undefined) return null;
  if (kind === "move" && ms >= moveMinMs && ms <= moveMaxMs) return { kind, ms };
  if (kind === "side" && ms >= sideMinMs && ms <= sideMaxMs) return { kind, ms };
  return null;
}
