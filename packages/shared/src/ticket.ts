import { createHmac, timingSafeEqual } from "node:crypto";

export type TicketPayload = {
  sub: string;
  name: string;
  slug: string;
  exp: number;
};

const ttlMs = 2 * 60 * 1000;

export function issueTicket(
  input: { sub: string; name: string; slug: string },
  secret: string,
  now = Date.now(),
) {
  const payload: TicketPayload = { ...input, exp: now + ttlMs };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

export function verifyTicket(token: string, secret: string, slug: string, now = Date.now()) {
  const [body, signature, extra] = token.split(".");
  if (!body || !signature || extra) throw new Error("凭证无效");
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  const actualBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) {
    throw new Error("凭证无效");
  }
  const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as TicketPayload;
  if (!payload.sub || !payload.name || !payload.slug || typeof payload.exp !== "number") {
    throw new Error("凭证无效");
  }
  if (payload.exp <= now) throw new Error("凭证已过期");
  if (payload.slug !== slug) throw new Error("游戏不匹配");
  return payload;
}
