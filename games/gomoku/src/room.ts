import { Room, ServerError, type Client } from "@colyseus/core";
import { saveOnlineMatch } from "@fungames/db/records";
import { verifyTicket, type TicketPayload } from "@fungames/shared/ticket";
import { releaseRoomCode, takeRoomCode } from "./code";
import { applyMove, createBoard, type Stone } from "./rules";
import { GomokuState } from "./state";

export class GomokuRoom extends Room<GomokuState, { code: string }, unknown, TicketPayload> {
  maxClients = 2;
  seats = new Map<string, { stone: Stone; userId: string }>();
  startedAt = new Date();
  saved = false;

  async onAuth(_client: Client, options: { ticket?: string }) {
    try {
      return verifyTicket(options?.ticket ?? "", process.env.TICKET_SECRET ?? "", "gomoku");
    } catch (error) {
      const message = error instanceof Error ? error.message : "凭证无效";
      throw new ServerError(401, message);
    }
  }

  async onCreate() {
    const code = takeRoomCode();
    this.setState(new GomokuState());
    this.state.code = code;
    this.state.board = createBoard().join("");
    this.state.turn = 1;
    (this.listing as { code?: string }).code = code;
    await this.setMetadata({ code });
    this.onMessage("move", (client, message: { x?: unknown; y?: unknown }) => {
      const seat = this.seats.get(client.sessionId);
      if (!seat || seat.stone !== this.state.turn || this.state.winner) {
        client.send("rejected", "还没轮到你");
        return;
      }
      if (typeof message?.x !== "number" || typeof message?.y !== "number") {
        client.send("rejected", "落子无效");
        return;
      }
      const board = this.state.board.split("").map((cell) => Number(cell));
      const result = applyMove(board, { x: message.x, y: message.y }, seat.stone);
      if (!result.ok) {
        client.send("rejected", result.reason);
        return;
      }
      this.state.board = result.board.join("");
      this.state.winner = result.winner ? String(result.winner) : "";
      if (!result.winner) this.state.turn = seat.stone === 1 ? 2 : 1;
      if (result.winner) void this.record();
    });
  }

  onJoin(client: Client, _options: unknown, auth?: TicketPayload) {
    if (this.seats.has(client.sessionId) || this.seats.size >= 2 || !auth?.sub) return;
    const stone: Stone = this.seats.size === 0 ? 1 : 2;
    this.seats.set(client.sessionId, { stone, userId: auth.sub });
  }

  async onLeave(client: Client, consented: boolean) {
    if (consented) {
      this.seats.delete(client.sessionId);
      return;
    }
    try {
      await this.allowReconnection(client, 60);
    } catch {
      this.seats.delete(client.sessionId);
    }
  }

  async record() {
    if (this.saved || this.seats.size < 2 || !this.state.winner) return;
    this.saved = true;
    const outcome = this.state.winner;
    await saveOnlineMatch({
      startedAt: this.startedAt,
      players: [...this.seats.values()].map((seat) => ({
        userId: seat.userId,
        result: outcome === "draw" ? "draw" : outcome === String(seat.stone) ? "win" : "loss",
      })),
    });
  }

  onDispose() {
    if (this.state?.code) releaseRoomCode(this.state.code);
  }
}

