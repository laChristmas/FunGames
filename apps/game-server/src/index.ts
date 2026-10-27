import { Room, Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";

if (!process.env.TICKET_SECRET) {
  console.error("缺少 TICKET_SECRET，联机服务没有启动。");
  process.exit(1);
}

class PingRoom extends Room {
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
