import { applyMove, cellIndex, inBounds, SIZE, type Board, type Move, type Stone } from "./rules";

function emptyCells(board: Board): Move[] {
  const moves: Move[] = [];
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      if (board[cellIndex(x, y)] === 0) moves.push({ x, y });
    }
  }
  return moves;
}

function neighborScore(board: Board, move: Move) {
  let score = 0;
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      if (dx === 0 && dy === 0) continue;
      const x = move.x + dx;
      const y = move.y + dy;
      if (!inBounds(x, y)) continue;
      if (board[cellIndex(x, y)] !== 0) score += 2;
    }
  }
  const middle = (SIZE - 1) / 2;
  const center = Math.abs(move.x - middle) + Math.abs(move.y - middle);
  return score * 10 - center;
}

export function chooseMove(board: Board, stone: Stone): Move | null {
  const empty = emptyCells(board);
  if (empty.length === 0) return null;
  const opponent: Stone = stone === 1 ? 2 : 1;
  for (const move of empty) {
    const result = applyMove(board, move, stone);
    if (result.ok && result.winner === stone) return move;
  }
  for (const move of empty) {
    const result = applyMove(board, move, opponent);
    if (result.ok && result.winner === opponent) return move;
  }
  return empty.reduce((best, move) =>
    neighborScore(board, move) > neighborScore(board, best) ? move : best,
  );
}
