import assert from "node:assert/strict";
import test from "node:test";
import { createLimiter } from "./limit.ts";

test("窗口内超过次数会被拒绝，窗口过后可以再来", () => {
  const allow = createLimiter(2, 1000);
  assert.equal(allow("login", 0), true);
  assert.equal(allow("login", 10), true);
  assert.equal(allow("login", 20), false);
  assert.equal(allow("login", 1000), true);
});
