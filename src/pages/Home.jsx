import React, { useState, useEffect, useCallback } from "react";
import { base44, notifyEmergencyContacts } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { AlertTriangle, ChevronRight, Activity, Calendar, TrendingUp, Zap, Bell } from "lucide-react";
import HeartRateMonitor from "@/components/HeartRateMonitor";
import SensorPanel from "@/components/SensorPanel";
import { useBracelet } from "@/components/BraceletStatus";
import CrisisCard from "@/components/CrisisCard";
import AlertCenter from "@/components/AlertCenter";
import moment from "moment";

export default function Home() {
  const { connected, toggle } = useBracelet();
  const [crises, setCrises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      const data = await base44.entities.CrisisEvent.list("-date_time", 3);
      setCrises(data);
    } catch (e) {
      setCrises([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Realtime: refresh crisis list when a new crisis is created/updated
  useEffect(() => {
    const unsub = base44.entities.CrisisEvent.subscribe(() => load());
    return unsub;
  }, [load]);

  useEffect(() => {
    base44.functions.invoke("getMyRole")
      .then((r) => { if (r?.data?.role === "contact") navigate("/contato", { replace: true }); })
      .catch(() => {});
  }, [navigate]);

  const simulateCrisis = async () => {
    setSimulating(true);
    const duration = 60 + Math.floor(Math.random() * 150);
    const peak = 130 + Math.floor(Math.random() * 40);
    const avg = 95 + Math.floor(Math.random() * 25);
    const intensities = ["leve", "moderada", "intensa"];
    const movements = ["baixa", "média", "alta"];
    const severity = intensities[Math.floor(Math.random() * 3)];
    const crisis = await base44.entities.CrisisEvent.create({
      date_time: new Date().toISOString(),
      duration_seconds: duration,
      heart_rate_avg: avg,
      heart_rate_peak: peak,
      movement_intensity: movements[Math.floor(Math.random() * 3)],
      intensity: severity,
      location: "Gama, DF",
    });
    // Send alert simultaneously to patient and all linked emergency contacts
    try {
      await notifyEmergencyContacts({
        crisis_id: crisis?.id || null,
        severity,
        message: `Crise ${severity} detectada pela pulseira EPILEX. FC média: ${avg} bpm, pico: ${peak} bpm.`,
        location: "Gama, DF",
        date_time: crisis?.date_time || new Date().toISOString(),
        alert_type: "crise_detectada"
      });
    } catch (e) {}
    await load();
    setSimulating(false);
  };

  const monthCount = crises.filter((c) => moment(c.date_time).isSame(new Date(), "month")).length;
  const last = crises[0];

  return (
    <div className="px-5 py-5">
      <div className="mb-5">
        <p className="text-sm text-muted-foreground">Olá,</p>
        <h1 className="text-2xl font-extrabold tracking-tight">Bem-vindo de volta</h1>
      </div>

      <HeartRateMonitor />

      <div className="mt-4">
        <SensorPanel />
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${connected ? "bg-emerald-50 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
            {connected ? <Zap className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
          </div>
          <div>
            <p className="text-sm font-bold">Pulseira EPILEX</p>
            <p className="text-[11px] text-muted-foreground">{connected ? "Conectada · monitorando" : "Desconectada"}</p>
          </div>
        </div>
        <button
          onClick={toggle}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
            connected ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
          }`}
        >
          {connected ? "Desconectar" : "Conectar"}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <StatCard icon={Calendar} label="Crises no mês" value={monthCount} />
        <StatCard icon={TrendingUp} label="Última crise" value={last ? moment(last.date_time).fromNow(true) : "—"} small />
        <StatCard icon={Activity} label="Total" value={crises.length} />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <h2 className="text-base font-bold">Crises recentes</h2>
        <Link to="/graficos" className="flex items-center text-xs font-semibold text-primary">
          Ver tudo <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-3 space-y-3">
        {loading ? (
          <div className="h-28 animate-pulse rounded-2xl bg-muted" />
        ) : crises.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
            <p className="text-sm font-semibold text-muted-foreground">Nenhuma crise registrada até o momento.</p>
          </div>
        ) : (
          crises.map((c) => <CrisisCard key={c.id} crisis={c} />)
        )}
      </div>

      <button
        onClick={simulateCrisis}
        disabled={simulating}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-50"
      >
        <AlertTriangle className="h-4 w-4" />
        {simulating ? "Registrando..." : "Simular detecção de crise"}
      </button>

      <div className="mt-5 flex items-center justify-between">
        <h2 className="text-base font-bold">Central de alertas</h2>
        <Bell className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="mt-3">
        <AlertCenter max={5} />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, small }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <Icon className="h-4 w-4 text-primary" />
      <p className={`mt-1.5 font-extrabold tabular-nums ${small ? "text-sm" : "text-xl"}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}