"use client";

import { Client } from "colyseus.js";
import { GomokuState } from "@fungames/gomoku/state";
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
        return client.create("gomoku", { ticket: body.ticket }, GomokuState);
      })
      .then((joined) => {
        if (stopped) {
          joined.leave();
          return;
        }
        room = joined;
        const code = joined.state?.code;
        setStatus(code ? `房间码 ${code}` : "已创建房间");
        joined.onStateChange((next) => {
          if (next.code) setStatus(`房间码 ${next.code}`);
        });
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
