export const roomWaitMs = 120_000;

export function roomExpired(players: number, elapsedMs: number) {
  return players < 2 && elapsedMs >= roomWaitMs;
}

export function duplicateSeat(userIds: string[], userId: string) {
  return userIds.includes(userId);
}
