"use client";

import { Client, type Room } from "colyseus.js";
import { GomokuBoard } from "@fungames/gomoku/board";
import { SIZE, type Cell } from "@fungames/gomoku/rules";
import { GomokuState } from "@fungames/gomoku/state";
import { useEffect, useRef, useState } from "react";

type Seat = 1 | 2;

type View = {
  code: string;
  board: string;
  turn: number;
  winner: string;
  players: number;
  away: number;
};

function describe(view: View, seat: Seat | null) {
  if (view.winner === "draw") return "平局";
  if (view.winner === "1") return "黑棋胜";
  if (view.winner === "2") return "白棋胜";
  if (view.away && view.away !== seat) return "对方断线";
  if (view.players < 2) return "等待对手";
  if (seat === view.turn) return "轮到你";
  return "轮到对方";
}

export function OnlineMatch() {
  const roomRef = useRef<Room | null>(null);
  const [seat, setSeat] = useState<Seat | null>(null);
  const [view, setView] = useState<View | null>(null);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [lastIndex, setLastIndex] = useState<number | null>(null);
  const previousBoard = useRef("");

  useEffect(() => () => roomRef.current?.leave(), []);

  function bind(joined: Room) {
    roomRef.current = joined;
    joined.onMessage("seat", (value: Seat) => setSeat(value));
    const apply = (state: View) => {
      const board = state.board ?? "";
      const previous = previousBoard.current;
      if (previous && previous !== board) {
        let found: number | null = null;
        const limit = Math.max(previous.length, board.length);
        for (let index = 0; index < limit; index += 1) {
          const before = previous[index] ?? "0";
          const after = board[index] ?? "0";
          if (before !== after && after !== "0") found = index;
        }
        if (found !== null) setLastIndex(found);
      }
      previousBoard.current = board;
      setView({
        code: state.code ?? "",
        board: state.board ?? "",
        turn: state.turn ?? 1,
        winner: state.winner ?? "",
        players: state.players ?? 0,
        away: state.away ?? 0,
      });
    };
    if (joined.state) apply(joined.state as View);
    joined.onStateChange((state) => apply(state as View));
    joined.send("hello");
  }

  async function ticket() {
    const response = await fetch("/api/ticket", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug: "gomoku" }),
    });
    if (!response.ok) throw new Error("需要登录");
    const body = (await response.json()) as { ticket: string };
    return body.ticket;
  }

  async function connect(action: "create" | "join") {
    setError("");
    setCopied(false);
    try {
      const client = new Client(`${location.protocol}//${location.host}`);
      const pass = await ticket();
      const joined =
        action === "create"
          ? await client.create("gomoku", { ticket: pass }, GomokuState)
          : await client.join("gomoku", { code: joinCode.trim().toUpperCase(), ticket: pass }, GomokuState);
      bind(joined);
    } catch {
      setError(action === "create" ? "创建失败" : "没有这个房间");
    }
  }

  if (!view?.code) {
    return (
      <div className="match">
        <button className="lobby" type="button" onClick={() => connect("create")}>
          创建房间
        </button>
        <input
          className="online-code"
          aria-label="房间码"
          value={joinCode}
          onChange={(event) => setJoinCode(event.target.value)}
        />
        <button className="lobby" type="button" onClick={() => connect("join")}>
          加入房间
        </button>
        {error ? <p className="form-error">{error}</p> : null}
      </div>
    );
  }

  const cells: Cell[] = view.board
    .padEnd(SIZE * SIZE, "0")
    .slice(0, SIZE * SIZE)
    .split("")
    .map((cell) => (cell === "1" ? 1 : cell === "2" ? 2 : 0));
  return (
    <div className="match">
      <p>{describe(view, seat)}</p>
      <p>房间码 {view.code}</p>
      <button
        className="lobby"
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(view.code);
            setCopied(true);
          } catch {
            const field = document.createElement("textarea");
            field.value = view.code;
            document.body.append(field);
            field.select();
            setCopied(document.execCommand("copy"));
            field.remove();
          }
        }}
      >
        {copied ? "已复制" : "复制房间码"}
      </button>
      <GomokuBoard
        cells={cells}
        lastIndex={lastIndex}
        playable={() => !view.winner && seat === view.turn}
        onPlace={(x, y) => roomRef.current?.send("move", { x, y })}
      />
    </div>
  );
}
