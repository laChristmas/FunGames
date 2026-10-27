export function MatchPlayers({
  black,
  white,
  active,
}: {
  black: string;
  white: string;
  active: 1 | 2 | null;
}) {
  return (
    <>
      <p className={active === 1 ? "player black active" : "player black"}>
        <span className="pip black" aria-hidden="true" />
        {black}
      </p>
      <p className={active === 2 ? "player white active" : "player white"}>
        <span className="pip white" aria-hidden="true" />
        {white}
      </p>
    </>
  );
}
