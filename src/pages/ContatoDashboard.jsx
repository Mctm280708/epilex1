import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate, Link } from "react-router-dom";
import {
  Brain, MapPin, LogOut, Droplet, Scale, Ruler, Pill, Activity, LifeBuoy,
  ShieldAlert, User, Loader2, Calendar, Bell,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import CrisisCard from "@/components/CrisisCard";
import AlertCenter from "@/components/AlertCenter";
import FirstAidGuide from "@/components/FirstAidGuide";
import NeuroBackground, { EEGWave } from "@/components/NeuroPattern";
import moment from "moment";

export default function ContatoDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [emergency, setEmergency] = useState(false);

  const triggerEmergency = async () => {
    setEmergency(true);
    try {
      await base44.functions.invoke("triggerContactEmergency", {
        severity: "intensa",
        message: "Acionamento de emergência pelo contato de emergência via EPILEX.",
        location: "Gama, DF",
      });
    } catch (e) {}
    setEmergency(false);
  };

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      try {
        const roleRes = await base44.functions.invoke("getMyRole");
        if (roleRes?.data?.role !== "contact") { navigate("/", { replace: true }); return; }
        const res = await base44.functions.invoke("getLinkedPatientData");
        if (active) setData(res.data);
      } catch (e) {
        if (active) setError("Você não tem permissão para acessar os dados do paciente.");
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    // Poll for realtime sync (contact cannot subscribe to patient's entities directly due to RLS)
    const interval = setInterval(fetchData, 30000);
    return () => { active = false; clearInterval(interval); };
  }, [navigate]);

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-secondary to-[#0a1f2e]">
        <NeuroBackground variant="dark" />
        <Loader2 className="relative h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-secondary via-secondary to-[#0a1f2e] px-6 text-center">
        <NeuroBackground variant="dark" />
        <ShieldAlert className="relative h-10 w-10 text-destructive" />
        <p className="relative text-sm text-white/70">{error}</p>
        <button onClick={() => base44.auth.logout(window.location.origin)} className="relative text-primary font-semibold">Sair</button>
      </div>
    );
  }

  const { patient_name, main_user_email, crises = [], medical_profile, alerts = [] } = data;
  const lastLocation = crises.find((c) => c.location)?.location || "Indisponível";
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const day = moment().subtract(6 - i, "days");
    return { label: day.format("ddd"), crises: crises.filter((c) => moment(c.date_time).isSame(day, "day")).length };
  });

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-secondary via-[#0d2a3e] to-[#0a1f2e]">
      <NeuroBackground variant="dark" />
      <div className="relative mx-auto max-w-md">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-secondary/80 px-5 py-3.5 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30">
              <Brain className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div className="leading-none">
              <p className="text-sm font-extrabold tracking-tight text-white">Modo contato</p>
              <p className="text-[10px] uppercase tracking-[0.15em] text-white/50">EPILEX WEB</p>
            </div>
          </div>
          <button onClick={() => base44.auth.logout(window.location.origin)}
            className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/60 hover:text-white hover:border-white/30">
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </header>

        <main className="px-5 py-5 pb-10">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/95 p-4 shadow-xl shadow-black/10">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Paciente monitorado</p>
              <p className="text-base font-bold text-foreground">{patient_name}</p>
              {main_user_email && <p className="text-[11px] text-muted-foreground">{main_user_email}</p>}
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/95 p-4 shadow-lg shadow-black/5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
              <MapPin className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Última localização conhecida</p>
              <p className="text-sm font-semibold text-foreground">{lastLocation}</p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Histórico de crises</h2>
            <Link to="/primeiros-socorros" className="flex items-center text-xs font-semibold text-primary">
              <LifeBuoy className="h-3.5 w-3.5 mr-1" /> Socorros
            </Link>
          </div>

          <div className="mt-3 rounded-2xl border border-white/10 bg-white/95 p-4 shadow-lg shadow-black/5">
            <div className="mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-bold text-foreground">Crises nos últimos 7 dias</h3>
            </div>
            {crises.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">Nenhuma crise registrada até o momento.</p>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={last7} margin={{ top: 10, right: 5, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="crises" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="mt-3 space-y-3">
            {crises.map((c) => <CrisisCard key={c.id} crisis={c} />)}
          </div>

          <div className="mt-5 flex items-center justify-between">
            <h2 className="text-base font-bold text-white">Central de alertas</h2>
            <Bell className="h-4 w-4 text-white/40" />
          </div>
          <div className="mt-3">
            <AlertCenter alerts={alerts} max={5} />
          </div>

          <h2 className="mb-2 mt-6 text-base font-bold text-white">Dados de saúde</h2>
          {medical_profile ? (
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/95 p-4 shadow-lg shadow-black/5">
              <MedicalRow icon={Droplet} label="Tipo sanguíneo" value={medical_profile.blood_type || "—"} />
              <MedicalRow icon={Scale} label="Peso" value={medical_profile.weight ? `${medical_profile.weight} kg` : "—"} />
              <MedicalRow icon={Ruler} label="Altura" value={medical_profile.height ? `${medical_profile.height} cm` : "—"} />
              <MedicalRow icon={Activity} label="Nível de atividade" value={levelLabel(medical_profile.sedentary_level)} />
              <MedicalRow icon={ShieldAlert} label="Deficiência" value={medical_profile.has_disability ? (medical_profile.disability_desc || "Sim") : "Não"} />
              <MedicalRow icon={ShieldAlert} label="Transtorno" value={medical_profile.has_disorder ? (medical_profile.disorder_desc || "Sim") : "Não"} />
              <MedicalRow icon={Pill} label="Medicamentos" value={medical_profile.medications || "—"} />
              <MedicalRow icon={Activity} label="Doenças associadas" value={medical_profile.conditions || "—"} />
              {medical_profile.notes && <MedicalRow icon={User} label="Observações" value={medical_profile.notes} />}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-5 text-center text-sm text-white/50">
              O paciente ainda não cadastrou suas informações de saúde.
            </p>
          )}

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/95 p-4 shadow-lg shadow-black/5">
            <div className="mb-3 flex items-center gap-2">
              <LifeBuoy className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-bold text-foreground">Primeiros socorros</h2>
            </div>
            <FirstAidGuide />
          </div>

          <button
            onClick={triggerEmergency}
            disabled={emergency}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-red-400/50 bg-red-500/10 py-3.5 text-sm font-bold text-destructive transition-colors hover:bg-red-500/15 disabled:opacity-50"
          >
            <ShieldAlert className="h-4 w-4" />
            {emergency ? "Acionando..." : "Acionar emergência"}
          </button>

          <p className="mt-5 text-center text-[11px] text-white/40">
            Você está visualizando os dados compartilhados pelo paciente. EPILEX WEB é um protótipo e não substitui atendimento médico.
          </p>
        </main>
      </div>
    </div>
  );
}

function MedicalRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold capitalize">{value}</p>
      </div>
    </div>
  );
}

function levelLabel(level) {
  const map = { sedentario: "Sedentário", leve: "Leve", moderado: "Moderado", ativo: "Ativo", muito_ativo: "Muito ativo" };
  return map[level] || "—";
}