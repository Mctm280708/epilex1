import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, AlertTriangle, MapPin } from "lucide-react";
import moment from "moment";

const SEVERITY_STYLES = {
  leve: "border-emerald-200 bg-emerald-50/60 text-emerald-700",
  moderada: "border-primary/20 bg-primary/5 text-primary",
  intensa: "border-destructive/30 bg-destructive/5 text-destructive",
};

export default function AlertCenter({ alerts: propAlerts, max = 5 }) {
  const [alerts, setAlerts] = useState(propAlerts || []);
  const [loading, setLoading] = useState(!propAlerts);

  const load = useCallback(async () => {
    if (propAlerts) { setAlerts(propAlerts); setLoading(false); return; }
    try {
      const res = await base44.entities.Alert.filter({}, { sort: "-date_time", limit: max });
      setAlerts(res?.items || res || []);
    } catch (e) {
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [propAlerts, max]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (propAlerts) return;
    const unsub = base44.entities.Alert.subscribe(() => load());
    return unsub;
  }, [propAlerts, load]);

  if (loading) {
    return <div className="h-20 animate-pulse rounded-2xl bg-muted" />;
  }

  if (!alerts.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-center">
        <Bell className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">Nenhum alerta registrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {alerts.map((a) => {
        const style = SEVERITY_STYLES[a.severity] || SEVERITY_STYLES.moderada;
        return (
          <div key={a.id} className={`rounded-xl border p-3 ${style}`}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span className="text-sm font-bold capitalize">{a.severity || "Alerta"}</span>
              </div>
              <span className="text-[10px] opacity-70">{moment(a.date_time).fromNow()}</span>
            </div>
            <p className="mt-1 text-xs opacity-90">{a.message}</p>
            {a.location && (
              <div className="mt-1 flex items-center gap-1 text-[11px] opacity-70">
                <MapPin className="h-3 w-3" /> {a.location}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}