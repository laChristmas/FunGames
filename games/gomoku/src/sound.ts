"use client";

let ctx: AudioContext | null = null;

export function unlockStoneSound() {
  const Context = window.AudioContext;
  if (!Context) return;
  if (!ctx) ctx = new Context();
  if (ctx.state === "suspended") void ctx.resume();
}

export function playStoneSound() {
  if (!ctx) return;
  const start = () => {
    if (!ctx || ctx.state !== "running") return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(540, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.07);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  };
  if (ctx.state === "running") start();
  else void ctx.resume().then(start);
}
