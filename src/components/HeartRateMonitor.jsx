import React, { useState, useEffect, useRef } from "react";
import { HeartPulse } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, YAxis } from "recharts";
import { useBracelet } from "@/components/BraceletStatus";

export default function HeartRateMonitor() {
  const { connected } = useBracelet();
  const [bpm, setBpm] = useState(72);
  const [history, setHistory] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({ i, v: 68 + Math.round(Math.sin(i / 3) * 6 + Math.random() * 4) }))
  );
  const baseRef = useRef(72);

  useEffect(() => {
    if (!connected) return;
    const id = setInterval(() => {
      const drift = (Math.random() - 0.5) * 4;
      const spike = Math.random() < 0.05 ? Math.random() * 30 : 0;
      const next = Math.max(52, Math.min(150, Math.round(baseRef.current + drift + spike)));
      baseRef.current = baseRef.current * 0.85 + next * 0.15;
      setBpm(next);
      setHistory((h) => [...h.slice(-23), { i: h[h.length - 1]?.i + 1 ?? 0, v: next }]);
    }, 1400);
    return () => clearInterval(id);
  }, [connected]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary to-orange-500 p-5 text-white shadow-xl shadow-primary/25">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-xl" />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-white/80">Frequência cardíaca</p>
          <div className="mt-1 flex items-end gap-1.5">
            <span className="text-5xl font-extrabold tabular-nums tracking-tight">{connected ? bpm : "--"}</span>
            <span className="mb-1.5 text-sm font-semibold text-white/80">bpm</span>
          </div>
          <p className="mt-0.5 text-[11px] text-white/70">{connected ? "Monitoramento em tempo real" : "Pulseira desconectada"}</p>
        </div>
        <div className="relative flex h-12 w-12 items-center justify-center text-white">
          {connected && <span className="pulse-ring absolute inset-0 text-white/40" />}
          <HeartPulse className={`relative h-7 w-7 ${connected ? "animate-pulse" : "opacity-50"}`} />
        </div>
      </div>
      <div className="relative mt-3 h-16 w-full">
        {connected ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
              <YAxis domain={[40, 160]} hide />
              <Line type="monotone" dataKey="v" stroke="rgba(255,255,255,0.9)" strokeWidth={2.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-white/60">Conecte a pulseira para iniciar o monitoramento</div>
        )}
      </div>
    </div>
  );
}