import { Room, ServerError, type Client } from "@colyseus/core";
import { saveOnlineMatch } from "@fungames/db/records";
import { createLimiter } from "@fungames/shared/limit";
import { verifyTicket, type TicketPayload } from "@fungames/shared/ticket";
import { parseClock } from "@fungames/shared/clock";
import { releaseRoomCode, takeRoomCode } from "./code";
import { armTurn, clockRunning, tickClock, timedOut, type Clock } from "./clock";
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
  playTimer: ReturnType<typeof setInterval> | null = null;

  async onAuth(_client: Client, options: { ticket?: string }) {
    try {
      return verifyTicket(options?.ticket ?? "", process.env.TICKET_SECRET ?? "", "gomoku");
    } catch (error) {
      const message = error instanceof Error ? error.message : "凭证无效";
      throw new ServerError(401, message);
    }
  }

  async onCreate(options: { ticket?: string; clock?: unknown }) {
    let userId = "";
    try {
      userId = verifyTicket(options?.ticket ?? "", process.env.TICKET_SECRET ?? "", "gomoku").sub;
    } catch (error) {
      const message = error instanceof Error ? error.message : "凭证无效";
      throw new ServerError(401, message);
    }
    const choice = parseClock(options.clock ?? { kind: "none" });
    if (!choice) throw new ServerError(400, "计时无效");
    if (!allowRoomCreate(userId)) throw new ServerError(429, "创建房间太频繁");
    const code = takeRoomCode();
    this.setState(new GomokuState());
    this.state.code = code;
    this.state.board = createBoard().join("");
    this.state.turn = 1;
    this.state.winner = "";
    this.state.away = 0;
    this.state.endReason = "";
    this.state.clockKind = choice.kind;
    this.state.clockBudget = choice.ms;
    this.state.blackMs = choice.ms;
    this.state.whiteMs = choice.ms;
    (this.listing as { code?: string }).code = code;
    await this.setMetadata({ code });
    this.onMessage("move", (client, message: unknown) => {
      const seat = this.seats.get(client.sessionId);
      if (!seat || this.state.winner) {
        client.send("rejected", "还没轮到你");
        return;
      }
      const board = this.state.board.split("").map((cell) => Number(cell));
      const turn: Stone = this.state.turn === 2 ? 2 : 1;
      if (this.alreadyTimedOut(turn)) {
        client.send("rejected", "已超时");
        this.finishByTime(turn);
        return;
      }
      const result = acceptMove(board, turn, seat.stone, message);
      if (!result.ok) {
        client.send("rejected", result.reason);
        return;
      }
      this.state.board = result.board.join("");
      this.state.winner = result.winner ? String(result.winner) : "";
      if (!result.winner) {
        const nextTurn: Stone = seat.stone === 1 ? 2 : 1;
        this.state.turn = nextTurn;
        this.writeClock(armTurn(this.readClock(), nextTurn));
      } else {
        this.state.endReason = result.winner === "draw" ? "draw" : "five";
        void this.record();
      }
    });
    this.onMessage("hello", (client) => {
      const seat = this.seats.get(client.sessionId);
      if (seat) client.send("seat", seat.stone);
    });
    this.playTimer = setInterval(() => {
      if (roomExpired(this.seats.size, Date.now() - this.startedAt.getTime())) {
        this.stopPlayTimer();
        void this.disconnect();
        return;
      }
      this.advanceClock(1000);
    }, 1000);
  }

  stopPlayTimer() {
    if (!this.playTimer) return;
    clearInterval(this.playTimer);
    this.playTimer = null;
  }

  readClock(): Clock {
    const kind = this.state.clockKind === "move" || this.state.clockKind === "side" ? this.state.clockKind : "none";
    return {
      kind,
      budget: this.state.clockBudget,
      blackMs: this.state.blackMs,
      whiteMs: this.state.whiteMs,
    };
  }

  writeClock(clock: Clock) {
    this.state.blackMs = clock.blackMs;
    this.state.whiteMs = clock.whiteMs;
  }

  alreadyTimedOut(turn: Stone) {
    return (
      clockRunning({
        kind: this.state.clockKind,
        winner: this.state.winner,
        players: this.seats.size,
        away: this.state.away,
      }) && timedOut(this.readClock(), turn)
    );
  }

  finishByTime(turn: Stone) {
    if (this.state.winner) return;
    this.state.winner = turn === 1 ? "2" : "1";
    this.state.endReason = "timeout";
    void this.record();
  }

  advanceClock(elapsed: number) {
    if (
      !clockRunning({
        kind: this.state.clockKind,
        winner: this.state.winner,
        players: this.seats.size,
        away: this.state.away,
      })
    ) {
      return;
    }
    const turn: Stone = this.state.turn === 2 ? 2 : 1;
    const next = tickClock(this.readClock(), turn, elapsed);
    this.writeClock(next);
    if (timedOut(next, turn)) this.finishByTime(turn);
  }

  onJoin(client: Client, _options: unknown, auth?: TicketPayload) {
    if (!auth?.sub) throw new ServerError(401, "凭证无效");
    const seated = [...this.seats.values()].map((seat) => seat.userId);
    if (duplicateSeat(seated, auth.sub)) throw new ServerError(409, "已经在房间里");
    if (this.seats.size >= 2) throw new ServerError(409, "房间已满");
    const stone: Stone = this.seats.size === 0 ? 1 : 2;
    this.seats.set(client.sessionId, { stone, userId: auth.sub });
    if (stone === 1) this.state.blackName = auth.name;
    else this.state.whiteName = auth.name;
    this.state.players = this.seats.size;
    client.send("seat", stone);
  }

  async onLeave(client: Client, consented: boolean) {
    const seat = this.seats.get(client.sessionId);
    if (consented) {
      this.seats.delete(client.sessionId);
      if (seat?.stone === 1) this.state.blackName = "";
      if (seat?.stone === 2) this.state.whiteName = "";
      this.state.players = this.seats.size;
      return;
    }
    if (seat) this.state.away = seat.stone;
    try {
      await this.allowReconnection(client, 60);
      this.state.away = 0;
    } catch {
      this.seats.delete(client.sessionId);
      if (seat?.stone === 1) this.state.blackName = "";
      if (seat?.stone === 2) this.state.whiteName = "";
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
    this.stopPlayTimer();
    if (this.state?.code) releaseRoomCode(this.state.code);
  }
}

