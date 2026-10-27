import { Room, ServerError, type Client } from "@colyseus/core";
import { verifyTicket, type TicketPayload } from "@fungames/shared/ticket";
import { releaseRoomCode, takeRoomCode } from "./code";
import { createBoard } from "./rules";
import { GomokuState } from "./state";

export class GomokuRoom extends Room<GomokuState, { code: string }, unknown, TicketPayload> {
  maxClients = 2;

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
    await this.setMetadata({ code });
  }

  onDispose() {
    if (this.state?.code) releaseRoomCode(this.state.code);
  }
}
