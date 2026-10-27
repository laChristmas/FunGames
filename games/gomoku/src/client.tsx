"use client";

import { useEffect, useRef, useState } from "react";
import type { ClockChoice } from "@fungames/shared/clock";
import { chooseMove } from "./ai";
import { GomokuBoard } from "./board";
import { armTurn, createClock, formatClock, tickClock, timedOut, undoClock, type Clock } from "./clock";
import { ClockSetup } from "./clock-setup";
import { MatchPlayers } from "./players";
import { applyMove, cellIndex, createBoard, type Board, type Stone } from "./rules";
import { playStoneSound } from "./sound";

type Mode = "ai" | "local";
type Reason = "" | "five" | "timeout" | "draw";
type Snapshot = { board: Board; turn: Stone; last: number | null; clock: Clock };

function label(winner: Stone | "draw" | null, turn: Stone, mode: Mode, reason: Reason) {
  if (winner === "draw" || reason === "draw") return "平局";
  if (reason === "timeout" && winner === 1) return "白棋超时，黑棋胜";
  if (reason === "timeout" && winner === 2) return "黑棋超时，白棋胜";
  if (winner === 1) return "黑棋胜";
  if (winner === 2) return "白棋胜";
  if (mode === "ai") return "你执黑";
  return turn === 1 ? "轮到黑棋" : "轮到白棋";
}

export function GomokuMatch({ mode, canSave = false }: { mode: Mode; canSave?: boolean }) {
  const [board, setBoard] = useState<Board>(createBoard);
  const [turn, setTurn] = useState<Stone>(1);
  const [winner, setWinner] = useState<Stone | "draw" | null>(null);
  const [reason, setReason] = useState<Reason>("");
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [last, setLast] = useState<number | null>(null);
  const [paint, setPaint] = useState(0);
  const [saved, setSaved] = useState(false);
  const [choice, setChoice] = useState<ClockChoice | null>(null);
  const [clock, setClock] = useState<Clock>(() => createClock({ kind: "none", ms: 0 }));
  const clockRef = useRef(clock);
  const turnRef = useRef<Stone>(1);
  const tickAt = useRef(Date.now());

  useEffect(() => {
    const onTheme = () => setPaint((value) => value + 1);
    window.addEventListener("fungames-theme", onTheme);
    return () => window.removeEventListener("fungames-theme", onTheme);
  }, []);

  useEffect(() => {
    if (!choice || winner || choice.kind === "none") return;
    tickAt.current = Date.now();
    const id = window.setInterval(() => {
      const now = Date.now();
      const elapsed = now - tickAt.current;
      tickAt.current = now;
      const next = tickClock(clockRef.current, turnRef.current, elapsed);
      clockRef.current = next;
      setClock(next);
      if (timedOut(next, turnRef.current)) {
        setWinner(turnRef.current === 1 ? 2 : 1);
        setReason("timeout");
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [choice, winner]);

  function adopt(next: Clock) {
    clockRef.current = next;
    setClock(next);
  }

  function begin(nextChoice: ClockChoice) {
    const created = createClock(nextChoice);
    setChoice(nextChoice);
    adopt(created);
    tickAt.current = Date.now();
  }

  function spend() {
    const now = Date.now();
    const elapsed = now - tickAt.current;
    tickAt.current = now;
    const next = tickClock(clockRef.current, turnRef.current, elapsed);
    adopt(next);
    return next;
  }

  function reset() {
    setBoard(createBoard());
    setTurn(1);
    turnRef.current = 1;
    setWinner(null);
    setReason("");
    setHistory([]);
    setLast(null);
    setSaved(false);
    if (choice) adopt(createClock(choice));
    tickAt.current = Date.now();
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
    const spent = spend();
    if (timedOut(spent, turnRef.current)) {
      setWinner(turnRef.current === 1 ? 2 : 1);
      setReason("timeout");
      return;
    }
    const result = applyMove(board, { x, y }, turnRef.current);
    if (!result.ok) return;
    if (!result.winner) playStoneSound();
    const snapshot = { board, turn: turnRef.current, last, clock: spent };
    setHistory((items) => [...items, snapshot]);
    const placed = cellIndex(x, y);
    if (mode === "local" || result.winner) {
      const nextTurn: Stone = turnRef.current === 1 ? 2 : 1;
      setBoard(result.board);
      setWinner(result.winner);
      setReason(result.winner === "draw" ? "draw" : result.winner ? "five" : "");
      setTurn(nextTurn);
      turnRef.current = nextTurn;
      setLast(placed);
      adopt(result.winner ? spent : armTurn(spent, nextTurn));
      tickAt.current = Date.now();
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
    if (!aiResult.winner) playStoneSound();
    setBoard(aiResult.board);
    setWinner(aiResult.winner);
    setReason(aiResult.winner === "draw" ? "draw" : aiResult.winner ? "five" : "");
    setLast(cellIndex(aiMove.x, aiMove.y));
    const afterWhite = armTurn(spent, 2);
    adopt(aiResult.winner ? afterWhite : armTurn(afterWhite, 1));
    tickAt.current = Date.now();
  }

  function undo() {
    const previous = history.at(-1);
    if (!previous) return;
    setBoard(previous.board);
    setTurn(previous.turn);
    turnRef.current = previous.turn;
    setLast(previous.last);
    setWinner(null);
    setReason("");
    adopt(undoClock(clockRef.current, previous.clock));
    setHistory((items) => items.slice(0, -1));
    tickAt.current = Date.now();
  }

  if (!choice) return <ClockSetup onStart={begin} />;

  const showTime = clock.kind !== "none";
  return (
    <div className="match" data-paint={paint}>
      <p>{label(winner, turn, mode, reason)}</p>
      <div className="match-board">
        <MatchPlayers
          black={mode === "ai" ? "你" : "黑方"}
          white={mode === "ai" ? "电脑" : "白方"}
          active={winner ? null : turn}
          blackTime={showTime ? formatClock(clock.blackMs) : ""}
          whiteTime={showTime ? formatClock(clock.whiteMs) : ""}
        />
        <GomokuBoard cells={board} lastIndex={last} playable={() => !winner} onPlace={place} />
      </div>
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
