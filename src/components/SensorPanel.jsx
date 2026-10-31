import React from "react";
import { useSensorData } from "@/lib/SensorDataContext";
import { Activity, Loader2, AlertCircle, Move3d, RotateCw, Footprints } from "lucide-react";

function fmtVal(v) {
  if (v === null || v === undefined || v === "") return "—";
  const n = Number(v);
  if (isNaN(n)) return String(v);
  return n.toFixed(2);
}

export default function SensorPanel() {
  const { data, loading, error } = useSensorData(2000);

  const acc = data
    ? [
        { label: "Acc X", value: fmtVal(data.accX), unit: "g" },
        { label: "Acc Y", value: fmtVal(data.accY), unit: "g" },
        { label: "Acc Z", value: fmtVal(data.accZ), unit: "g" },
      ]
    : [];
  const gyro = data
    ? [
        { label: "Gyro X", value: fmtVal(data.gyroX), unit: "°/s" },
        { label: "Gyro Y", value: fmtVal(data.gyroY), unit: "°/s" },
        { label: "Gyro Z", value: fmtVal(data.gyroZ), unit: "°/s" },
      ]
    : [];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-secondary via-[#0d2a3e] to-[#0a1f2e] p-5 text-white shadow-xl shadow-secondary/30">
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-extrabold tracking-tight">Sensores do relógio</p>
            <p className="text-[11px] text-white/50">Tempo real · Firebase RTDB</p>
          </div>
        </div>
        {loading && !data ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : error ? (
          <span className="flex items-center gap-1 text-[11px] text-destructive">
            <AlertCircle className="h-3.5 w-3.5" /> Offline
          </span>
        ) : (
          <span className="flex items-center gap-1 text-[11px] text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Ao vivo
          </span>
        )}
      </div>

      {error && !data ? (
        <p className="relative mt-4 rounded-xl bg-white/5 px-4 py-3 text-center text-xs text-white/60">
          {error}
        </p>
      ) : (
        <>
          <div className="relative mt-4">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">
              <Move3d className="h-3.5 w-3.5" /> Acelerômetro
            </div>
            <div className="grid grid-cols-3 gap-2">
              {acc.map((s) => (
                <div key={s.label} className="rounded-xl bg-white/5 py-2.5 text-center">
                  <p className="text-base font-extrabold tabular-nums">{s.value}</p>
                  <p className="text-[10px] text-white/40">{s.label} · {s.unit}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-4">
            <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/40">
              <RotateCw className="h-3.5 w-3.5" /> Giroscópio
            </div>
            <div className="grid grid-cols-3 gap-2">
              {gyro.map((s) => (
                <div key={s.label} className="rounded-xl bg-white/5 py-2.5 text-center">
                  <p className="text-base font-extrabold tabular-nums">{s.value}</p>
                  <p className="text-[10px] text-white/40">{s.label} · {s.unit}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative mt-4 flex items-center justify-between rounded-xl bg-primary/10 px-4 py-3">
            <div className="flex items-center gap-2">
              <Footprints className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-white/70">Movimentos detectados</span>
            </div>
            <span className="text-xl font-extrabold tabular-nums text-primary">
              {data?.movimentos ?? "—"}
            </span>
          </div>
        </>
      )}
    </div>
  );
}