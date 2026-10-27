import { schema } from "@colyseus/schema";

export const GomokuState = schema({
  code: "string",
  board: "string",
  turn: "uint8",
  winner: "string",
  players: "uint8",
  away: "uint8",
});
