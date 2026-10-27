import { headers } from "next/headers";
import { saveSoloMatch } from "@fungames/db/records";
import { auth } from "@/lib/auth";

const results = ["win", "loss", "draw"] as const;
type Result = (typeof results)[number];

function isResult(value: unknown): value is Result {
  return results.includes(value as Result);
}

export async function POST(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return Response.json({ error: "未登录" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!isResult(body?.result)) return Response.json({ error: "结果无效" }, { status: 400 });
  await saveSoloMatch({ userId: session.user.id, result: body.result });
  return Response.json({ ok: true });
}
