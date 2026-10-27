export const roomAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function makeRoomCode(roll: () => number) {
  const length = 4 + Math.floor(roll() * 3);
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += roomAlphabet[Math.floor(roll() * roomAlphabet.length)] ?? "A";
  }
  return code;
}

const used = new Set<string>();

export function takeRoomCode() {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const code = makeRoomCode(Math.random);
    if (used.has(code)) continue;
    used.add(code);
    return code;
  }
  throw new Error("房间码不够");
}

export function releaseRoomCode(code: string) {
  used.delete(code);
}
