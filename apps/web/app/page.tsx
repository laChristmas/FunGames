import Link from "next/link";
import { GameCover } from "@/components/game-cover";
import { games, modeLabel } from "@/lib/games";

export default function HomePage() {
  return (
    <main className="page">
      <h1>游戏</h1>
      <ul className="catalog">
        {games.map((game) => (
          <li key={game.slug}>
            <Link className="game-card" href={`/play/${game.slug}`}>
              <GameCover title={game.title} />
              <span className="game-title">{game.title}</span>
              <span className="game-players">{game.players}</span>
              <span className="mode-list">
                {game.modes.map((mode) => (
                  <span key={mode} className="mode-tag">
                    {modeLabel[mode]}
                  </span>
                ))}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
