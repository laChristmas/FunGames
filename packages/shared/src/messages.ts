import { z } from "zod";

export const moveMessage = z.object({
  x: z.number().int().min(0).max(18),
  y: z.number().int().min(0).max(18),
});

export function parseMove(input: unknown) {
  const parsed = moveMessage.safeParse(input);
  if (!parsed.success) return null;
  return { x: parsed.data.x, y: parsed.data.y };
}
