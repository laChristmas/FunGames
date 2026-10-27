import { Room, Server, ServerError } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { verifyTicket } from "@fungames/shared/ticket";

if (!process.env.TICKET_SECRET) {
  console.error("缺少 TICKET_SECRET，联机服务没有启动。");
  process.exit(1);
}

class PingRoom extends Room {
  async onAuth(_client: unknown, options: { ticket?: string }) {
    try {
      return verifyTicket(options?.ticket ?? "", process.env.TICKET_SECRET ?? "", "gomoku");
    } catch (error) {
      const message = error instanceof Error ? error.message : "凭证无效";
      throw new ServerError(401, message);
    }
  }

  onCreate() {
    this.onMessage("ping", (client) => {
      client.send("pong");
    });
  }
}

const gameServer = new Server({
  greet: false,
  transport: new WebSocketTransport(),
});

gameServer.define("ping", PingRoom);

await gameServer.listen(2567);
console.log("联机服务已监听 2567，共享密钥已加载。");
