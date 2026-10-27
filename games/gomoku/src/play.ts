import { parseMove } from "@fungames/shared/messages";
import { applyMove, type Board, type Stone } from "./rules";

export function acceptMove(board: Board, turn: Stone, seat: Stone, message: unknown) {
  if (seat !== turn) return { ok: false as const, reason: "还没轮到你" };
  const move = parseMove(message);
  if (!move) return { ok: false as const, reason: "落子无效" };
  return applyMove(board, move, seat);
}
