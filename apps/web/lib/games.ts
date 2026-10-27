export type GameMode = "solo" | "online";

export type GameMeta = {
  slug: string;
  title: string;
  players: string;
  modes: GameMode[];
  aspect: number;
};

export const games: GameMeta[] = [
  {
    slug: "gomoku",
    title: "五子棋",
    players: "2 人",
    modes: ["solo", "online"],
    aspect: 1,
  },
];

export function getGame(slug: string) {
  return games.find((game) => game.slug === slug);
}

export const modeLabel: Record<GameMode, string> = {
  solo: "单机",
  online: "联机",
};
