import assert from "node:assert/strict";
import test from "node:test";
import { parseMove } from "./messages.ts";

test("无法识别的字段会被丢掉", () => {
  assert.deepEqual(parseMove({ x: 3, y: 7, extra: "nope" }), { x: 3, y: 7 });
});

test("缺少坐标时不接受", () => {
  assert.equal(parseMove({ x: 3 }), null);
});
