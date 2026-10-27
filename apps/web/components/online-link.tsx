"use client";

import { Client } from "colyseus.js";
import { useEffect, useState } from "react";

export function OnlineLink() {
  const [status, setStatus] = useState("正在连接联机服务");

  useEffect(() => {
    const client = new Client(`${location.protocol}//${location.host}`);
    let room: { leave: () => void } | undefined;
    let stopped = false;
    fetch("/api/ticket", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ slug: "gomoku" }),
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("凭证申请失败");
        const body = (await response.json()) as { ticket: string };
        return client.joinOrCreate("ping", { ticket: body.ticket });
      })
      .then((joined) => {
        if (stopped) {
          joined.leave();
          return;
        }
        room = joined;
        setStatus("已连上联机服务");
      })
      .catch(() => {
        if (!stopped) setStatus("联机服务连不上");
      });
    return () => {
      stopped = true;
      room?.leave();
    };
  }, []);

  return <p>{status}</p>;
}
