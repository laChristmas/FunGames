import assert from "node:assert/strict";
import test from "node:test";
import { parseMove } from "./messages.ts";

test("无法识别的字段会被丢掉", () => {
  assert.deepEqual(parseMove({ x: 3, y: 7, extra: "nope" }), { x: 3, y: 7 });
});

test("棋盘边缘坐标可以落下", () => {
  assert.deepEqual(parseMove({ x: 18, y: 0 }), { x: 18, y: 0 });
  assert.equal(parseMove({ x: 19, y: 0 }), null);
});

test("缺少坐标时不接受", () => {
  assert.equal(parseMove({ x: 3 }), null);
});
