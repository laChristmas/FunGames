import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { chooseMove } from "./ai.ts";
import { applyMove, createBoard, replay, sampleKifu } from "./rules.ts";

test("固定棋谱以黑棋五连结束", () => {
  const result = replay(sampleKifu);
  assert.equal(result.winner, 1);
});

test("不能落在已有棋子上", () => {
  const first = applyMove(createBoard(), { x: 1, y: 1 }, 1);
  assert.equal(first.ok, true);
  if (!first.ok) return;
  const second = applyMove(first.board, { x: 1, y: 1 }, 2);
  assert.equal(second.ok, false);
});

test("规则文件不依赖界面或联机框架", () => {
  const source = readFileSync(new URL("./rules.ts", import.meta.url), "utf8");
  assert.equal(/react|colyseus/i.test(source), false);
});

test("能一步取胜时 AI 会取胜", () => {
  const { board } = replay(sampleKifu.slice(0, -1));
  const move = chooseMove(board, 1);
  assert.ok(move);
  const result = applyMove(board, move, 1);
  assert.equal(result.ok && result.winner, 1);
});
