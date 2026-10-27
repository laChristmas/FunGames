import assert from "node:assert/strict";
import test from "node:test";
import { makeRoomCode, roomAlphabet } from "./code.ts";

test("房间码是四到六位，并且避开容易看混的字符", () => {
  const shortest = makeRoomCode(() => 0);
  const longest = makeRoomCode(() => 0.999);
  assert.equal(shortest, "AAAA");
  assert.equal(longest.length, 6);
  assert.match(shortest, /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4,6}$/);
  assert.match(longest, /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4,6}$/);
  assert.equal(/[01IOl]/.test(roomAlphabet), false);
});
