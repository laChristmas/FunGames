"use client";

import { Client } from "colyseus.js";
import { useEffect, useState } from "react";

export function OnlineLink() {
  const [status, setStatus] = useState("正在连接联机服务");

  useEffect(() => {
    const client = new Client(`${location.protocol}//${location.host}`);
    let room: { leave: () => void } | undefined;
    let stopped = false;
    client
      .joinOrCreate("ping")
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
