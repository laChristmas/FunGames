import { Room, ServerError, type Client } from "@colyseus/core";
import { saveOnlineMatch } from "@fungames/db/records";
import { createLimiter } from "@fungames/shared/limit";
import { verifyTicket, type TicketPayload } from "@fungames/shared/ticket";
import { releaseRoomCode, takeRoomCode } from "./code";
import { acceptMove } from "./play";
import { duplicateSeat, roomExpired } from "./room-policy";
import { createBoard, type Stone } from "./rules";
import { GomokuState } from "./state";

const allowRoomCreate = createLimiter(5, 60_000);

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

  async onCreate(options: { ticket?: string }) {
    let userId = "";
    try {
      userId = verifyTicket(options?.ticket ?? "", process.env.TICKET_SECRET ?? "", "gomoku").sub;
    } catch (error) {
      const message = error instanceof Error ? error.message : "凭证无效";
      throw new ServerError(401, message);
    }
    if (!allowRoomCreate(userId)) throw new ServerError(429, "创建房间太频繁");
    const code = takeRoomCode();
    this.setState(new GomokuState());
    this.state.code = code;
    this.state.board = createBoard().join("");
    this.state.turn = 1;
    (this.listing as { code?: string }).code = code;
    await this.setMetadata({ code });
    this.onMessage("move", (client, message: unknown) => {
      const seat = this.seats.get(client.sessionId);
      if (!seat || this.state.winner) {
        client.send("rejected", "还没轮到你");
        return;
      }
      const board = this.state.board.split("").map((cell) => Number(cell));
      const result = acceptMove(board, this.state.turn === 2 ? 2 : 1, seat.stone, message);
      if (!result.ok) {
        client.send("rejected", result.reason);
        return;
      }
      this.state.board = result.board.join("");
      this.state.winner = result.winner ? String(result.winner) : "";
      if (!result.winner) this.state.turn = seat.stone === 1 ? 2 : 1;
      if (result.winner) void this.record();
    });
    this.onMessage("hello", (client) => {
      const seat = this.seats.get(client.sessionId);
      if (seat) client.send("seat", seat.stone);
    });
    this.clock.setInterval(() => {
      if (roomExpired(this.seats.size, Date.now() - this.startedAt.getTime())) {
        void this.disconnect();
      }
    }, 1000);
  }

  onJoin(client: Client, _options: unknown, auth?: TicketPayload) {
    if (!auth?.sub) throw new ServerError(401, "凭证无效");
    const seated = [...this.seats.values()].map((seat) => seat.userId);
    if (duplicateSeat(seated, auth.sub)) throw new ServerError(409, "已经在房间里");
    if (this.seats.size >= 2) throw new ServerError(409, "房间已满");
    const stone: Stone = this.seats.size === 0 ? 1 : 2;
    this.seats.set(client.sessionId, { stone, userId: auth.sub });
    this.state.players = this.seats.size;
    client.send("seat", stone);
  }

  async onLeave(client: Client, consented: boolean) {
    const seat = this.seats.get(client.sessionId);
    if (consented) {
      this.seats.delete(client.sessionId);
      this.state.players = this.seats.size;
      return;
    }
    if (seat) this.state.away = seat.stone;
    try {
      await this.allowReconnection(client, 60);
      this.state.away = 0;
    } catch {
      this.seats.delete(client.sessionId);
      this.state.away = 0;
      this.state.players = this.seats.size;
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

