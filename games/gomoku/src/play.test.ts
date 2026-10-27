import assert from "node:assert/strict";
import test from "node:test";
import { acceptMove } from "./play.ts";
import { createBoard, sampleKifu } from "./rules.ts";

test("固定棋谱在房间规则里以黑棋获胜", () => {
  let board = createBoard();
  let turn = 1 as 1 | 2;
  let winner: 1 | 2 | "draw" | null = null;
  for (const move of sampleKifu) {
    const result = acceptMove(board, turn, move.stone, { x: move.x, y: move.y, noise: true });
    assert.equal(result.ok, true);
    if (!result.ok) return;
    board = result.board;
    winner = result.winner;
    if (!winner) turn = move.stone === 1 ? 2 : 1;
  }
  assert.equal(winner, 1);
});
