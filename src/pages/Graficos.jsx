import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Calendar, TrendingUp, HeartPulse } from "lucide-react";
import CrisisCard from "@/components/CrisisCard";
import moment from "moment";

export default function Graficos() {
  const [tab, setTab] = useState("historico");
  const [crises, setCrises] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await base44.entities.CrisisEvent.list("-date_time", 200);
      setCrises(data);
    } catch (e) {
      setCrises([]);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const day = moment().subtract(6 - i, "days");
    const count = crises.filter((c) => moment(c.date_time).isSame(day, "day")).length;
    return { label: day.format("ddd"), crises: count };
  });

  const weeks = Array.from({ length: 6 }, (_, i) => {
    const start = moment().subtract(5 - i, "weeks").startOf("week");
    const end = moment(start).endOf("week");
    const inWeek = crises.filter((c) => moment(c.date_time).isBetween(start, end, null, "[]"));
    return {
      label: `${start.format("DD/MM")}`,
      crises: inWeek.length,
      avgFc: inWeek.length ? Math.round(inWeek.reduce((s, c) => s + (c.heart_rate_avg || 0), 0) / inWeek.length) : 0,
    };
  });

  const intensityDist = ["leve", "moderada", "intensa"].map((k, i) => ({
    name: k,
    value: crises.filter((c) => c.intensity === k).length,
    color: ["#10b981", "#f59e0b", "#ef4444"][i],
  })).filter((d) => d.value > 0);

  return (
    <div className="px-5 py-5">
      <h1 className="text-2xl font-extrabold tracking-tight">Gráficos</h1>
      <p className="text-sm text-muted-foreground">Acompanhe a evolução das crises</p>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
        {[
          { k: "historico", l: "Histórico" },
          { k: "semanal", l: "Semanal" },
        ].map((t) => (
          <button
            key={t.k}
            onClick={() => setTab(t.k)}
            className={`rounded-xl py-2 text-sm font-semibold transition-all ${
              tab === t.k ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {t.l}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-muted" />
      ) : tab === "historico" ? (
        <>
          <ChartCard icon={Calendar} title="Crises nos últimos 7 dias">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={last7} margin={{ top: 10, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="crises" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {intensityDist.length > 0 && (
            <ChartCard icon={TrendingUp} title="Distribuição por intensidade">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={intensityDist} dataKey="value" nameKey="name" innerRadius={45} outerRadius={70} paddingAngle={3}>
                    {intensityDist.map((d) => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Legend iconType="circle" formatter={(v) => <span className="text-xs capitalize">{v}</span>} />
                  <Tooltip contentStyle={{ borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>
          )}

          <h2 className="mb-2 mt-6 text-base font-bold">Registros detalhados</h2>
          <div className="space-y-3">
            {crises.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-border bg-card p-6 text-center text-sm text-muted-foreground">
                Nenhuma crise registrada até o momento.
              </p>
            ) : (
              crises.map((c) => <CrisisCard key={c.id} crisis={c} />)
            )}
          </div>
        </>
      ) : (
        <>
          <ChartCard icon={Calendar} title="Crises por semana">
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeks} margin={{ top: 10, right: 5, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                <Bar dataKey="crises" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard icon={HeartPulse} title="Frequência cardíaca média (semanal)">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={weeks} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid hsl(var(--border))" }} />
                <Line type="monotone" dataKey="avgFc" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: "#f97316" }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </>
      )}
    </div>
  );
}

function ChartCard({ icon: Icon, title, children }) {
  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      {children}
    </div>
  );
}