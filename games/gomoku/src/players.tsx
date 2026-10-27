export function MatchPlayers({
  black,
  white,
  active,
  blackTime = "",
  whiteTime = "",
}: {
  black: string;
  white: string;
  active: 1 | 2 | null;
  blackTime?: string;
  whiteTime?: string;
}) {
  return (
    <>
      <p className={active === 1 ? "player black active" : "player black"}>
        <span className="pip black" aria-hidden="true" />
        <span className="player-name">{black}</span>
        {blackTime ? <span className="player-time">{blackTime}</span> : null}
      </p>
      <p className={active === 2 ? "player white active" : "player white"}>
        <span className="pip white" aria-hidden="true" />
        <span className="player-name">{white}</span>
        {whiteTime ? <span className="player-time">{whiteTime}</span> : null}
      </p>
    </>
  );
}
