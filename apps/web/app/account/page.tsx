import { desc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db, game, match, matchPlayer } from "@fungames/db";
import { auth } from "@/lib/auth";

const modeText: Record<string, string> = { online: "联机", solo: "单机" };
const resultText: Record<string, string> = { win: "胜", loss: "负", draw: "平" };

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login?next=/account");
  const rows = await db
    .select({
      id: match.id,
      title: game.title,
      mode: match.mode,
      result: matchPlayer.result,
      endedAt: match.endedAt,
    })
    .from(matchPlayer)
    .innerJoin(match, eq(match.id, matchPlayer.matchId))
    .innerJoin(game, eq(game.slug, match.gameSlug))
    .where(eq(matchPlayer.userId, session.user.id))
    .orderBy(desc(match.endedAt))
    .limit(20);

  return (
    <main className="page">
      <h1>{session.user.name}</h1>
      {rows.length === 0 ? (
        <p>还没有对局。</p>
      ) : (
        <ul className="matches">
          {rows.map((row) => (
            <li key={row.id}>
              <span>{row.title}</span>
              <span>{modeText[row.mode] ?? row.mode}</span>
              <span>{resultText[row.result] ?? row.result}</span>
              <time dateTime={row.endedAt?.toISOString()}>
                {row.endedAt
                  ? new Intl.DateTimeFormat("zh-CN", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(row.endedAt)
                  : ""}
              </time>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
