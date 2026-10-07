import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { User, Phone, Mail, Pill, HeartPulse, Save, Check, Droplet, Scale, Ruler, Activity, ShieldAlert, Loader2 } from "lucide-react";

const EMPTY = {
  full_name: "", birth_date: "", phone: "", email: "",
  blood_type: "Desconhecido", weight: "", height: "",
  sedentary_level: "moderado",
  has_disability: false, disability_desc: "",
  has_disorder: false, disorder_desc: "",
  medications: "", conditions: "", notes: "",
};

export default function DadosPessoais() {
  const [form, setForm] = useState(EMPTY);
  const [profileId, setProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await base44.entities.MedicalProfile.filter({}, { limit: 1 });
        const items = res?.items || res || [];
        if (items.length) {
          const p = items[0];
          setProfileId(p.id);
          setForm({ ...EMPTY, ...p });
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const update = (k) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: val }));
    setSaved(false);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, weight: form.weight ? Number(form.weight) : null, height: form.height ? Number(form.height) : null };
      if (profileId) {
        await base44.entities.MedicalProfile.update(profileId, payload);
      } else {
        const created = await base44.entities.MedicalProfile.create(payload);
        if (created?.id) setProfileId(created.id);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

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
          <div className="grid grid-cols-2 gap-3">
            <Field icon={Phone} label="Telefone" value={form.phone} onChange={update("phone")} placeholder="(61) 99999-9999" />
            <Field label="Nascimento" type="date" value={form.birth_date} onChange={update("birth_date")} />
          </div>
          <Field icon={Mail} label="E-mail" type="email" value={form.email} onChange={update("email")} placeholder="email@exemplo.com" />
        </Section>

        <Section title="Dados biométricos">
          <div className="grid grid-cols-2 gap-3">
            <SelectField icon={Droplet} label="Tipo sanguíneo" value={form.blood_type} onChange={update("blood_type")}
              options={["Desconhecido","A+","A-","B+","B-","AB+","AB-","O+","O-"]} />
            <SelectField icon={Activity} label="Nível de atividade" value={form.sedentary_level} onChange={update("sedentary_level")}
              options={[["sedentario","Sedentário"],["leve","Leve"],["moderado","Moderado"],["ativo","Ativo"],["muito_ativo","Muito ativo"]]} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field icon={Scale} label="Peso (kg)" type="number" value={form.weight} onChange={update("weight")} placeholder="70" />
            <Field icon={Ruler} label="Altura (cm)" type="number" value={form.height} onChange={update("height")} placeholder="170" />
          </div>
        </Section>

        <Section title="Condições de saúde">
          <YesNo label="Possui alguma deficiência?" value={form.has_disability} onChange={update("has_disability")} />
          {form.has_disability && (
            <Field icon={ShieldAlert} label="Qual deficiência?" value={form.disability_desc} onChange={update("disability_desc")} placeholder="Descreva a deficiência" />
          )}
          <YesNo label="Possui algum transtorno?" value={form.has_disorder} onChange={update("has_disorder")} />
          {form.has_disorder && (
            <Field icon={ShieldAlert} label="Qual transtorno?" value={form.disorder_desc} onChange={update("disorder_desc")} placeholder="Ex.: Ansiedade, TDAH" />
          )}
          <Field icon={Pill} label="Medicamentos utilizados" value={form.medications} onChange={update("medications")} placeholder="Ex.: Ácido valproico" textarea />
          <Field icon={HeartPulse} label="Doenças associadas" value={form.conditions} onChange={update("conditions")} placeholder="Ex.: Diabetes, hipertensão" textarea />
          <Field label="Observações" value={form.notes} onChange={update("notes")} placeholder="Alergias, restrições..." textarea />
        </Section>

        <button type="submit" disabled={saving}
          className={`flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold transition-colors ${
            saved ? "bg-emerald-500 text-white" : "bg-primary text-primary-foreground"
          }`}>
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Salvando...</>
            : saved ? <><Check className="h-4 w-4" /> Salvo com sucesso</>
            : <><Save className="h-4 w-4" /> Salvar dados</>}
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
          <textarea value={value || ""} onChange={onChange} placeholder={placeholder} rows={2}
            className={`w-full resize-none rounded-xl border border-border bg-background py-2.5 ${Icon ? "pl-9" : "pl-3"} pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20`} />
        ) : (
          <input type={type} value={value ?? ""} onChange={onChange} placeholder={placeholder}
            className={`w-full rounded-xl border border-border bg-background py-2.5 ${Icon ? "pl-9" : "pl-3"} pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20`} />
        )}
      </div>
    </label>
  );
}

function SelectField({ icon: Icon, label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold text-muted-foreground">{label}</span>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />}
        <select value={value || ""} onChange={onChange}
          className={`w-full appearance-none rounded-xl border border-border bg-background py-2.5 ${Icon ? "pl-9" : "pl-3"} pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20`}>
          {options.map((o) => {
            const val = Array.isArray(o) ? o[0] : o;
            const lab = Array.isArray(o) ? o[1] : o;
            return <option key={val} value={val}>{lab}</option>;
          })}
        </select>
      </div>
    </label>
  );
}

function YesNo({ label, value, onChange }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-semibold text-muted-foreground">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => onChange({ target: { type: "checkbox", checked: true } })}
          className={`rounded-xl border py-2 text-sm font-bold ${value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>Sim</button>
        <button type="button" onClick={() => onChange({ target: { type: "checkbox", checked: false } })}
          className={`rounded-xl border py-2 text-sm font-bold ${!value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>Não</button>
      </div>
    </div>
  );
}