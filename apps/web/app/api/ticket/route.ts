import { headers } from "next/headers";
import { issueTicket } from "@fungames/shared/ticket";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "未登录" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (body?.slug !== "gomoku") return Response.json({ error: "游戏不存在" }, { status: 400 });
  const secret = process.env.TICKET_SECRET;
  if (!secret) return Response.json({ error: "服务未配置" }, { status: 500 });
  const ticket = issueTicket(
    { sub: session.user.id, name: session.user.name, slug: "gomoku" },
    secret,
  );
  return Response.json({ ticket });
}
