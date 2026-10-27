import { toNextJsHandler } from "better-auth/next-js";
import { createLimiter } from "@fungames/shared/limit";
import { auth } from "@/lib/auth";

const handler = toNextJsHandler(auth);
const allowLogin = createLimiter(10, 60_000);

export const GET = handler.GET;

export async function POST(request: Request) {
  const url = new URL(request.url);
  if (url.pathname.endsWith("/sign-in/email")) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
    if (!allowLogin(ip)) return Response.json({ message: "登录太频繁" }, { status: 429 });
  }
  return handler.POST(request);
}
