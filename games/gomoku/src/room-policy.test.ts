import assert from "node:assert/strict";
import test from "node:test";
import { duplicateSeat, roomExpired, roomWaitMs } from "./room-policy.ts";

test("只有一个人且超过等待时间就关闭房间", () => {
  assert.equal(roomExpired(1, roomWaitMs - 1), false);
  assert.equal(roomExpired(1, roomWaitMs), true);
  assert.equal(roomExpired(2, roomWaitMs + 1), false);
});

test("同一用户不能再次加入", () => {
  assert.equal(duplicateSeat(["user-a"], "user-a"), true);
  assert.equal(duplicateSeat(["user-a"], "user-b"), false);
});
