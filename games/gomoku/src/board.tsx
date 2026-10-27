"use client";

import { cellIndex, SIZE, type Cell } from "./rules";

const stars = [3, 9, 15];

export function GomokuBoard({
  cells,
  lastIndex,
  playable,
  onPlace,
}: {
  cells: Cell[];
  lastIndex: number | null;
  playable: (x: number, y: number) => boolean;
  onPlace: (x: number, y: number) => void;
}) {
  const lines = [];
  for (let line = 1; line <= SIZE; line += 1) {
    lines.push(<line key={`h${line}`} x1={1} y1={line} x2={SIZE} y2={line} />);
    lines.push(<line key={`v${line}`} x1={line} y1={1} x2={line} y2={SIZE} />);
  }

  return (
    <div className="goban" role="grid" aria-label="五子棋棋盘">
      <svg className="goban-lines" viewBox={`0 0 ${SIZE + 1} ${SIZE + 1}`} aria-hidden="true">
        {lines}
        {stars.flatMap((y) =>
          stars.map((x) => <circle key={`${x}-${y}`} cx={x + 1} cy={y + 1} r="0.16" />),
        )}
      </svg>
      {Array.from({ length: SIZE * SIZE }, (_, index) => {
        const x = index % SIZE;
        const y = Math.floor(index / SIZE);
        const cell = cells[cellIndex(x, y)] ?? 0;
        const last = index === lastIndex;
        return (
          <button
            key={index}
            type="button"
            className="goban-point"
            style={{
              left: `${((x + 1) / (SIZE + 1)) * 100}%`,
              top: `${((y + 1) / (SIZE + 1)) * 100}%`,
            }}
            aria-label={`第 ${y + 1} 路第 ${x + 1} 路`}
            disabled={!playable(x, y) || cell !== 0}
            onClick={() => onPlace(x, y)}
          >
            {cell === 1 ? <span className={last ? "stone black last" : "stone black"} /> : null}
            {cell === 2 ? <span className={last ? "stone white last" : "stone white"} /> : null}
          </button>
        );
      })}
    </div>
  );
}
