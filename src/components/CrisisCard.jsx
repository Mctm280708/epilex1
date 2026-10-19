import React from "react";
import { Clock, MapPin, HeartPulse, Activity } from "lucide-react";
import moment from "moment";

const intensityStyle = {
  leve: "bg-emerald-50 text-emerald-700 border-emerald-200",
  moderada: "bg-primary/8 text-primary border-primary/20",
  intensa: "bg-destructive/5 text-destructive border-destructive/30",
};

export default function CrisisCard({ crisis }) {
  const mins = Math.floor((crisis.duration_seconds || 0) / 60);
  const secs = (crisis.duration_seconds || 0) % 60;
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm shadow-secondary/5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted-foreground">
          {moment(crisis.date_time).format("DD/MM/YYYY [às] HH:mm")}
        </span>
        <span className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold capitalize ${intensityStyle[crisis.intensity] || "border-border bg-muted text-muted-foreground"}`}>
          {crisis.intensity || "—"}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-muted/60 py-2">
          <Clock className="mx-auto h-4 w-4 text-primary" />
          <p className="mt-1 text-sm font-bold tabular-nums">{mins}:{secs.toString().padStart(2, "0")}</p>
          <p className="text-[10px] text-muted-foreground">Duração</p>
        </div>
        <div className="rounded-xl bg-muted/60 py-2">
          <HeartPulse className="mx-auto h-4 w-4 text-primary" />
          <p className="mt-1 text-sm font-bold tabular-nums">{crisis.heart_rate_peak || "--"}</p>
          <p className="text-[10px] text-muted-foreground">Pico FC</p>
        </div>
        <div className="rounded-xl bg-muted/60 py-2">
          <Activity className="mx-auto h-4 w-4 text-primary" />
          <p className="mt-1 text-sm font-bold capitalize">{crisis.movement_intensity || "--"}</p>
          <p className="text-[10px] text-muted-foreground">Movimento</p>
        </div>
      </div>
      {crisis.location && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span className="truncate">{crisis.location}</span>
        </div>
      )}
    </div>
  );
}