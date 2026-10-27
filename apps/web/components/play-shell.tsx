"use client";

import Link from "next/link";
import { useState } from "react";
import type { GameMeta } from "@/lib/games";

type PlayMode = "ai" | "local" | "online";

const choices: { id: PlayMode; label: string }[] = [
  { id: "ai", label: "人机" },
  { id: "local", label: "同设备双人" },
  { id: "online", label: "联机" },
];

export function PlayShell({ game }: { game: GameMeta }) {
  const [mode, setMode] = useState<PlayMode | null>(null);

  return (
    <main className="play-page">
      <div className="play-bar">
        <Link href="/">返回</Link>
        <h1>{game.title}</h1>
      </div>
      {mode === null ? (
        <div className="mode-choices" role="group" aria-label="选择开局方式">
          {choices.map((choice) => (
            <button key={choice.id} type="button" onClick={() => setMode(choice.id)}>
              {choice.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="stage-wrap">
          <div className="stage" style={{ aspectRatio: String(game.aspect) }}>
            <p>{mode === "online" ? "联机即将开放" : "棋盘即将放在这里"}</p>
            <button type="button" onClick={() => setMode(null)}>
              重新选择
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
