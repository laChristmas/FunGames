import { db } from "./index";
import { game, match, matchPlayer } from "./schema";

export async function ensureGomoku() {
  await db
    .insert(game)
    .values({ slug: "gomoku", title: "五子棋", players: "2 人" })
    .onConflictDoNothing();
}

export async function saveOnlineMatch(input: {
  startedAt: Date;
  players: { userId: string; result: "win" | "loss" | "draw" }[];
}) {
  const matchId = crypto.randomUUID();
  await db.insert(match).values({
    id: matchId,
    gameSlug: "gomoku",
    mode: "online",
    startedAt: input.startedAt,
    endedAt: new Date(),
  });
  await db.insert(matchPlayer).values(
    input.players.map((player) => ({
      id: crypto.randomUUID(),
      matchId,
      userId: player.userId,
      result: player.result,
    })),
  );
  return matchId;
}
