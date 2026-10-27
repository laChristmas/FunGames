export function GameCover({ title }: { title: string }) {
  return (
    <svg className="game-cover" viewBox="0 0 160 160" role="img" aria-label={`${title}封面`}>
      <rect width="160" height="160" rx="12" fill="#d7a15e" />
      <g stroke="#8a5a2b" strokeWidth="2">
        {Array.from({ length: 7 }, (_, index) => {
          const pos = 20 + index * 20;
          return (
            <g key={pos}>
              <line x1="20" y1={pos} x2="140" y2={pos} />
              <line x1={pos} y1="20" x2={pos} y2="140" />
            </g>
          );
        })}
      </g>
      <circle cx="60" cy="80" r="8" fill="#1a1a1a" />
      <circle cx="80" cy="80" r="8" fill="#f7f4ee" stroke="#1a1a1a" />
      <circle cx="100" cy="80" r="8" fill="#1a1a1a" />
    </svg>
  );
}
