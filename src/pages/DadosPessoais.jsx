import React, { useState, useEffect } from "react";
import { User, Phone, Mail, Pill, HeartPulse, Save, Check } from "lucide-react";

const KEY = "epilex_profile";
const EMPTY = {
  full_name: "", birth_date: "", phone: "", email: "",
  medications: "", conditions: "", notes: "",
};

export default function DadosPessoais() {
  const [form, setForm] = useState(EMPTY);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const data = JSON.parse(localStorage.getItem(KEY) || "null");
      if (data) setForm({ ...EMPTY, ...data });
    } catch (e) {}
  }, []);

  const update = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setSaved(false);
  };

  const save = (e) => {
    e.preventDefault();
    localStorage.setItem(KEY, JSON.stringify(form));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="px-5 py-5">
      <h1 className="text-2xl font-extrabold tracking-tight">Dados Pessoais</h1>
      <p className="text-sm text-muted-foreground">Suas informações e histórico clínico</p>

      <div className="mt-5 flex flex-col items-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary text-2xl font-extrabold text-primary-foreground shadow-lg shadow-primary/30">
          {(form.full_name || "U").charAt(0).toUpperCase()}
        </div>
        <p className="mt-2 text-base font-bold">{form.full_name || "Usuário EPILEX"}</p>
      </div>

      <form onSubmit={save} className="mt-6 space-y-4">
        <Section title="Identificação">
          <Field icon={User} label="Nome completo" value={form.full_name} onChange={update("full_name")} placeholder="Seu nome" />
          <Field icon={Mail} label="E-mail" type="email" value={form.email} onChange={update("email")} placeholder="email@exemplo.com" />
          <div className="grid grid-cols-2 gap-3">
            <Field icon={Phone} label="Telefone" value={form.phone} onChange={update("phone")} placeholder="(61) 99999-9999" />
            <Field label="Nascimento" type="date" value={form.birth_date} onChange={update("birth_date")} />
          </div>
        </Section>

        <Section title="Informações médicas">
          <Field icon={Pill} label="Medicamentos utilizados" value={form.medications} onChange={update("medications")} placeholder="Ex.: Ácido valproico" textarea />
          <Field icon={HeartPulse} label="Doenças associadas" value={form.conditions} onChange={update("conditions")} placeholder="Ex.: Diabetes, hipertensão" textarea />
          <Field label="Observações" value={form.notes} onChange={update("notes")} placeholder="Alergias, restrições..." textarea />
        </Section>

        <button
          type="submit"
          className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-colors ${
            saved ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground"
          }`}
        >
          {saved ? <><Check className="h-4 w-4" /> Salvo com sucesso</> : <><Save className="h-4 w-4" /> Salvar dados</>}
        </button>
      </form>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>
      <div className="space-y-3 rounded-2xl border border-border bg-card p-4">{children}</div>
    </div>
  );
}

function Field({ icon: Icon, label, value, onChange, placeholder, type = "text", textarea = false }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold text-muted-foreground">{label}</span>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />}
        {textarea ? (
          <textarea
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={2}
            className={`w-full resize-none rounded-xl border border-border bg-background py-2.5 ${Icon ? "pl-9" : "pl-3"} pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20`}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full rounded-xl border border-border bg-background py-2.5 ${Icon ? "pl-9" : "pl-3"} pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20`}
          />
        )}
      </div>
    </label>
  );
}