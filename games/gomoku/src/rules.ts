export const SIZE = 15;
export type Stone = 1 | 2;
export type Cell = 0 | Stone;
export type Board = Cell[];
export type Move = { x: number; y: number };

export function createBoard(): Board {
  return Array.from({ length: SIZE * SIZE }, () => 0);
}

export function inBounds(x: number, y: number) {
  return x >= 0 && y >= 0 && x < SIZE && y < SIZE;
}

export function cellIndex(x: number, y: number) {
  return y * SIZE + x;
}

export type ApplyResult =
  | { ok: true; board: Board; winner: Stone | "draw" | null }
  | { ok: false; reason: string };

export function winnerOf(board: Board): Stone | null {
  const directions = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ];
  for (let y = 0; y < SIZE; y += 1) {
    for (let x = 0; x < SIZE; x += 1) {
      const stone = board[cellIndex(x, y)];
      if (stone === 0) continue;
      for (const [dx, dy] of directions) {
        let count = 1;
        for (let step = 1; step < 5; step += 1) {
          const nx = x + dx * step;
          const ny = y + dy * step;
          if (!inBounds(nx, ny) || board[cellIndex(nx, ny)] !== stone) break;
          count += 1;
        }
        if (count >= 5) return stone;
      }
    }
  }
  return null;
}

export function applyMove(board: Board, move: Move, stone: Stone): ApplyResult {
  if (!inBounds(move.x, move.y)) return { ok: false, reason: "出界" };
  const index = cellIndex(move.x, move.y);
  if (board[index] !== 0) return { ok: false, reason: "已有棋子" };
  const next = board.slice();
  next[index] = stone;
  const winner = winnerOf(next);
  const draw = winner === null && next.every((cell) => cell !== 0);
  return { ok: true, board: next, winner: winner ?? (draw ? "draw" : null) };
}

export const sampleKifu: Array<Move & { stone: Stone }> = [
  { x: 3, y: 7, stone: 1 },
  { x: 3, y: 8, stone: 2 },
  { x: 4, y: 7, stone: 1 },
  { x: 4, y: 8, stone: 2 },
  { x: 5, y: 7, stone: 1 },
  { x: 5, y: 8, stone: 2 },
  { x: 6, y: 7, stone: 1 },
  { x: 6, y: 8, stone: 2 },
  { x: 7, y: 7, stone: 1 },
];

export function replay(moves: Array<Move & { stone: Stone }>) {
  let board = createBoard();
  let winner: Stone | "draw" | null = null;
  for (const move of moves) {
    const result = applyMove(board, move, move.stone);
    if (!result.ok) throw new Error(result.reason);
    board = result.board;
    winner = result.winner;
  }
  return { board, winner };
}
