import React, { useState, useEffect, useRef } from "react";
import { HeartPulse } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, YAxis } from "recharts";
import { EEGWave } from "@/components/NeuroPattern";

export default function HeartRateMonitor() {
  const [bpm, setBpm] = useState(72);
  const [history, setHistory] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({ i, v: 68 + Math.round(Math.sin(i / 3) * 6 + Math.random() * 4) }))
  );
  const baseRef = useRef(72);

  useEffect(() => {
    const id = setInterval(() => {
      const drift = (Math.random() - 0.5) * 4;
      const spike = Math.random() < 0.05 ? Math.random() * 30 : 0;
      const next = Math.max(52, Math.min(150, Math.round(baseRef.current + drift + spike)));
      baseRef.current = baseRef.current * 0.85 + next * 0.15;
      setBpm(next);
      setHistory((h) => [...h.slice(-23), { i: h[h.length - 1]?.i + 1 ?? 0, v: next }]);
    }, 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-secondary via-[#0d2a3e] to-[#0a1f2e] p-5 text-white shadow-xl shadow-secondary/30">
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <EEGWave className="absolute bottom-0 left-0 h-12 w-full" color="#ffffff" strokeWidth={1} />
      </div>
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-medium uppercase tracking-widest text-white/60">Frequência cardíaca</p>
            <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-300">
              Simulado
            </span>
          </div>
          <div className="mt-1 flex items-end gap-1.5">
            <span className="text-5xl font-extrabold tabular-nums tracking-tight">{bpm}</span>
            <span className="mb-1.5 text-sm font-semibold text-white/60">bpm</span>
          </div>
          <p className="mt-0.5 text-[11px] text-white/50">Dados simulados para demonstração</p>
        </div>
        <div className="relative flex h-12 w-12 items-center justify-center text-primary">
          <span className="pulse-ring absolute inset-0 text-primary/40" />
          <HeartPulse className="relative h-7 w-7 animate-pulse" />
        </div>
      </div>
      <div className="relative mt-3 h-16 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <YAxis domain={[40, 160]} hide />
            <Line type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}