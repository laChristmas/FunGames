import { Server } from "@colyseus/core";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { GomokuRoom } from "@fungames/gomoku/room";
import { ensureGomoku } from "@fungames/db/records";

if (!process.env.TICKET_SECRET) {
  console.error("缺少 TICKET_SECRET，联机服务没有启动。");
  process.exit(1);
}

// 启动前先写入游戏清单，终局记录才能引用它。
await ensureGomoku();

const gameServer = new Server({
  greet: false,
  transport: new WebSocketTransport(),
});

gameServer.define("gomoku", GomokuRoom).filterBy(["code"]);

await gameServer.listen(2567);
console.log("联机服务已监听 2567，共享密钥已加载。");
