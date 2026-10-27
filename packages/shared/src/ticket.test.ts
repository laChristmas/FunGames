import assert from "node:assert/strict";
import test from "node:test";
import { issueTicket, verifyTicket } from "./ticket.ts";

const secret = "test-secret";
const player = { sub: "user-1", name: "CatalogUser", slug: "gomoku" };

test("凭证包含用户、显示名和游戏，两分钟内有效", () => {
  const now = 1_700_000_000_000;
  const token = issueTicket(player, secret, now);
  const payload = verifyTicket(token, secret, "gomoku", now + 60_000);
  assert.equal(payload.sub, player.sub);
  assert.equal(payload.name, player.name);
  assert.equal(payload.slug, "gomoku");
  assert.equal(payload.exp, now + 120_000);
});

test("过期凭证被拒绝", () => {
  const now = 1_700_000_000_000;
  const token = issueTicket(player, secret, now);
  assert.throws(() => verifyTicket(token, secret, "gomoku", now + 120_000), /过期/);
});

test("游戏不匹配的凭证被拒绝", () => {
  const token = issueTicket(player, secret, 1_700_000_000_000);
  assert.throws(() => verifyTicket(token, secret, "chess", 1_700_000_000_000), /不匹配/);
});
