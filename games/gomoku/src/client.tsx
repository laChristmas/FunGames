"use client";

import { useEffect, useState } from "react";
import { chooseMove } from "./ai";
import { GomokuBoard } from "./board";
import { applyMove, cellIndex, createBoard, type Board, type Stone } from "./rules";

type Mode = "ai" | "local";

function label(winner: Stone | "draw" | null, turn: Stone, mode: Mode) {
  if (winner === "draw") return "平局";
  if (winner === 1) return "黑棋胜";
  if (winner === 2) return "白棋胜";
  if (mode === "ai") return "你执黑";
  return turn === 1 ? "轮到黑棋" : "轮到白棋";
}

export function GomokuMatch({ mode, canSave = false }: { mode: Mode; canSave?: boolean }) {
  const [board, setBoard] = useState<Board>(createBoard);
  const [turn, setTurn] = useState<Stone>(1);
  const [winner, setWinner] = useState<Stone | "draw" | null>(null);
  const [history, setHistory] = useState<Array<{ board: Board; turn: Stone; last: number | null }>>([]);
  const [last, setLast] = useState<number | null>(null);
  const [paint, setPaint] = useState(0);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const onTheme = () => setPaint((value) => value + 1);
    window.addEventListener("fungames-theme", onTheme);
    return () => window.removeEventListener("fungames-theme", onTheme);
  }, []);

  function reset() {
    setBoard(createBoard());
    setTurn(1);
    setWinner(null);
    setHistory([]);
    setLast(null);
    setSaved(false);
  }

  async function save() {
    if (!winner || saved) return;
    const result = winner === "draw" ? "draw" : winner === 1 ? "win" : "loss";
    const response = await fetch("/api/matches", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ result }),
    });
    if (response.ok) setSaved(true);
  }

  function place(x: number, y: number) {
    if (winner) return;
    const result = applyMove(board, { x, y }, turn);
    if (!result.ok) return;
    const snapshot = { board, turn, last };
    setHistory((items) => [...items, snapshot]);
    const placed = cellIndex(x, y);
    if (mode === "local" || result.winner) {
      setBoard(result.board);
      setWinner(result.winner);
      setTurn(turn === 1 ? 2 : 1);
      setLast(placed);
      return;
    }
    const aiMove = chooseMove(result.board, 2);
    if (!aiMove) {
      setBoard(result.board);
      setWinner(result.winner);
      setLast(placed);
      return;
    }
    const aiResult = applyMove(result.board, aiMove, 2);
    if (!aiResult.ok) return;
    setBoard(aiResult.board);
    setWinner(aiResult.winner);
    setLast(cellIndex(aiMove.x, aiMove.y));
  }

  function undo() {
    const previous = history.at(-1);
    if (!previous) return;
    setBoard(previous.board);
    setTurn(previous.turn);
    setLast(previous.last);
    setWinner(null);
    setHistory((items) => items.slice(0, -1));
  }

  return (
    <div className="match" data-paint={paint}>
      <p>{label(winner, turn, mode)}</p>
      <GomokuBoard
        cells={board}
        lastIndex={last}
        playable={() => !winner}
        onPlace={place}
      />
      <div className="match-actions">
        <button type="button" onClick={undo} disabled={history.length === 0}>
          悔棋
        </button>
        <button type="button" onClick={reset}>
          再来一局
        </button>
        {canSave && mode === "ai" && winner ? (
          <button type="button" onClick={save} disabled={saved}>
            {saved ? "已保存" : "保存到账号"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
