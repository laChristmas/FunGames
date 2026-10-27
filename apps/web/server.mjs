import { createServer } from "node:http";
import { parse } from "node:url";
import httpProxy from "http-proxy";
import next from "next";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev, hostname: "127.0.0.1", port: 3000 });
const handle = app.getRequestHandler();
const proxy = httpProxy.createProxyServer({
  target: process.env.GAME_SERVER_URL || "http://127.0.0.1:2567",
  ws: true,
});

proxy.on("error", (_error, _req, response) => {
  if (response && "writeHead" in response && !response.headersSent) {
    response.writeHead(502);
    response.end("联机服务未启动");
  }
});

await app.prepare();
const upgrade = app.getUpgradeHandler();
const server = createServer((req, res) => {
  const url = req.url || "/";
  if (url.startsWith("/matchmake")) {
    proxy.web(req, res);
    return;
  }
  handle(req, res, parse(url, true));
});

server.on("upgrade", (req, socket, head) => {
  const url = req.url || "/";
  if (url.startsWith("/_next")) {
    upgrade(req, socket, head);
    return;
  }
  proxy.ws(req, socket, head);
});

server.listen(3000, "127.0.0.1", () => {
  console.log("网页已监听 3000，WebSocket 转发到联机服务。");
});
