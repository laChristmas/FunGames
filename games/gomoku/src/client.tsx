"use client";

import { useEffect, useState } from "react";
import { chooseMove } from "./ai";
import { applyMove, createBoard, type Board, type Stone } from "./rules";

type Mode = "ai" | "local";

function label(winner: Stone | "draw" | null, turn: Stone, mode: Mode) {
  if (winner === "draw") return "平局";
  if (winner === 1) return "黑棋胜";
  if (winner === 2) return "白棋胜";
  if (mode === "ai") return "你执黑";
  return turn === 1 ? "轮到黑棋" : "轮到白棋";
}

export function GomokuMatch({ mode }: { mode: Mode }) {
  const [board, setBoard] = useState<Board>(createBoard);
  const [turn, setTurn] = useState<Stone>(1);
  const [winner, setWinner] = useState<Stone | "draw" | null>(null);
  const [history, setHistory] = useState<Array<{ board: Board; turn: Stone }>>([]);
  const [paint, setPaint] = useState(0);

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
  }

  function place(x: number, y: number) {
    if (winner) return;
    const result = applyMove(board, { x, y }, turn);
    if (!result.ok) return;
    const snapshot = { board, turn };
    setHistory((items) => [...items, snapshot]);
    if (mode === "local" || result.winner) {
      setBoard(result.board);
      setWinner(result.winner);
      setTurn(turn === 1 ? 2 : 1);
      return;
    }
    const aiMove = chooseMove(result.board, 2);
    if (!aiMove) {
      setBoard(result.board);
      setWinner(result.winner);
      return;
    }
    const aiResult = applyMove(result.board, aiMove, 2);
    if (!aiResult.ok) return;
    setBoard(aiResult.board);
    setWinner(aiResult.winner);
  }

  function undo() {
    const previous = history.at(-1);
    if (!previous) return;
    setBoard(previous.board);
    setTurn(previous.turn);
    setWinner(null);
    setHistory((items) => items.slice(0, -1));
  }

  return (
    <div className="match" data-paint={paint}>
      <p>{label(winner, turn, mode)}</p>
      <div className="gomoku" role="grid" aria-label="五子棋棋盘">
        {board.map((cell, index) => {
          const x = index % 15;
          const y = Math.floor(index / 15);
          return (
            <button
              key={index}
              type="button"
              role="gridcell"
              aria-label={`第 ${y + 1} 行第 ${x + 1} 列`}
              disabled={Boolean(winner) || cell !== 0}
              onClick={() => place(x, y)}
            >
              {cell === 1 ? <span className="stone black" /> : null}
              {cell === 2 ? <span className="stone white" /> : null}
            </button>
          );
        })}
      </div>
      <div className="match-actions">
        <button type="button" onClick={undo} disabled={history.length === 0}>
          悔棋
        </button>
        <button type="button" onClick={reset}>
          再来一局
        </button>
      </div>
    </div>
  );
}
