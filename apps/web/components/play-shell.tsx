"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { GomokuMatch } from "@fungames/gomoku/client";
import { OnlineMatch } from "@/components/online-match";
import { authClient } from "@/lib/auth-client";
import type { GameMeta } from "@/lib/games";

type PlayMode = "ai" | "local" | "online";

const choices: { id: PlayMode; label: string }[] = [
  { id: "ai", label: "人机" },
  { id: "local", label: "同设备双人" },
  { id: "online", label: "联机" },
];

export function PlayShell({ game }: { game: GameMeta }) {
  const router = useRouter();
  const params = useSearchParams();
  const { data } = authClient.useSession();
  const [mode, setMode] = useState<PlayMode | null>(null);

  useEffect(() => {
    if (params.get("mode") === "online" && data) setMode("online");
  }, [params, data]);

  function choose(next: PlayMode) {
    if (next === "online" && !data) {
      const back = `/play/${game.slug}?mode=online`;
      router.push(`/login?next=${encodeURIComponent(back)}`);
      return;
    }
    setMode(next);
  }

  return (
    <main className="play-page">
      <div className="play-bar">
        <Link href="/">返回</Link>
        <h1>{game.title}</h1>
      </div>
      {mode === null ? (
        <div className="mode-choices" role="group" aria-label="选择开局方式">
          {choices.map((choice) => (
            <button key={choice.id} type="button" onClick={() => choose(choice.id)}>
              {choice.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="stage-wrap">
          {mode === "online" ? (
            <OnlineMatch />
          ) : (
            <GomokuMatch mode={mode} />
          )}
          <button type="button" className="reselect" onClick={() => setMode(null)}>
            重新选择
          </button>
        </div>
      )}
    </main>
  );
}
