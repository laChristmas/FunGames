import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db, profile } from "@fungames/db";
import { auth } from "@/lib/auth";

const themes = ["light", "dark", "system"] as const;
type ThemePreference = (typeof themes)[number];

function isTheme(value: unknown): value is ThemePreference {
  return themes.includes(value as ThemePreference);
}

async function currentUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return Response.json({ error: "未登录" }, { status: 401 });
  const rows = await db.select().from(profile).where(eq(profile.userId, userId)).limit(1);
  const row = rows[0];
  return Response.json({
    displayName: row?.displayName ?? "",
    theme: row?.theme ?? "system",
  });
}

export async function PATCH(request: Request) {
  const userId = await currentUserId();
  if (!userId) return Response.json({ error: "未登录" }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!isTheme(body?.theme)) return Response.json({ error: "外观无效" }, { status: 400 });
  await db.update(profile).set({ theme: body.theme }).where(eq(profile.userId, userId));
  return Response.json({ theme: body.theme });
}
