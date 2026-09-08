import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useBracelet } from "@/components/BraceletStatus";
import { Plus, Trash2, Phone, User, Mail, X, Watch, Vibrate, ShieldAlert, Link2 } from "lucide-react";

export default function Configuracao() {
  const { connected, toggle } = useBracelet();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [vibration, setVibration] = useState(() => localStorage.getItem("epilex_vib") !== "0");
  const [sensitivity, setSensitivity] = useState(() => localStorage.getItem("epilex_sens") || "média");

  const load = useCallback(async () => {
    try {
      setContacts(await base44.entities.EmergencyContact.list());
    } catch (e) {
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const remove = async (id) => {
    await base44.entities.EmergencyContact.delete(id);
    load();
  };

  const toggleVib = () => {
    const next = !vibration;
    setVibration(next);
    localStorage.setItem("epilex_vib", next ? "1" : "0");
  };

  const changeSens = (v) => {
    setSensitivity(v);
    localStorage.setItem("epilex_sens", v);
  };

  const linkCode = "EPLX-" + (connected ? "7F3A9" : "----");

  return (
    <div className="px-5 py-5">
      <h1 className="text-2xl font-extrabold tracking-tight">Configurações</h1>
      <p className="text-sm text-muted-foreground">Gerencie pulseira, contatos e preferências</p>

      <Section title="Pulseira inteligente" icon={Watch}>
        <Row label="Status da conexão" value={connected ? "Conectada" : "Desconectada"} />
        <button onClick={toggle} className="w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground">
          {connected ? "Desconectar pulseira" : "Conectar via Bluetooth"}
        </button>
      </Section>

      <Section title="Preferências de alerta" icon={Vibrate}>
        <ToggleRow label="Vibração na pulseira" desc="Vibrar ao detectar alterações" on={vibration} onToggle={toggleVib} />
        <div className="pt-1">
          <p className="mb-2 text-sm font-semibold">Sensibilidade da detecção</p>
          <div className="grid grid-cols-3 gap-2">
            {["baixa", "média", "alta"].map((s) => (
              <button
                key={s}
                onClick={() => changeSens(s)}
                className={`rounded-xl py-2 text-xs font-bold capitalize transition-colors ${
                  sensitivity === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section title="Código de vinculação" icon={Link2}>
        <p className="text-xs text-muted-foreground">Compartilhe este código com contatos de emergência para que acessem seus dados.</p>
        <div className="mt-2 flex items-center justify-between rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3">
          <span className="font-mono text-lg font-bold tracking-widest text-primary">{linkCode}</span>
        </div>
      </Section>

      <Section title="Contatos de emergência" icon={Phone} action={
        <button onClick={() => setShowForm(true)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Plus className="h-4 w-4" />
        </button>
      }>
        {loading ? (
          <div className="h-16 animate-pulse rounded-xl bg-muted" />
        ) : contacts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            Nenhum contato cadastrado.
          </p>
        ) : (
          <div className="space-y-2">
            {contacts.map((c) => (
              <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{c.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground">
                    {c.relationship ? `${c.relationship} · ` : ""}{c.phone}
                  </p>
                </div>
                <button onClick={() => remove(c.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Conta" icon={ShieldAlert}>
        <button
          onClick={() => {
            if (confirm("Deseja limpar seus dados pessoais locais?")) {
              localStorage.removeItem("epilex_profile");
              alert("Dados locais removidos.");
            }
          }}
          className="w-full rounded-xl border border-destructive/30 bg-destructive/5 py-2.5 text-sm font-bold text-destructive"
        >
          Limpar dados pessoais
        </button>
      </Section>

      {showForm && <ContactForm onClose={() => setShowForm(false)} onSaved={load} />}
    </div>
  );
}

function Section({ title, icon: Icon, action, children }) {
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{title}</h2>
        </div>
        {action}
      </div>
      <div className="rounded-2xl border border-border bg-card p-4">{children}</div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  );
}

function ToggleRow({ label, desc, on, onToggle }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="text-[11px] text-muted-foreground">{desc}</p>
      </div>
      <button
        onClick={onToggle}
        className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}

function ContactForm({ onClose, onSaved }) {
  const [form, setForm] = useState({ name: "", phone: "", relationship: "", email: "" });
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.entities.EmergencyContact.create(form);
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl bg-background p-5 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold">Novo contato de emergência</h3>
          <button onClick={onClose}><X className="h-5 w-5 text-muted-foreground" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <Input icon={User} label="Nome completo" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Nome do contato" />
          <Input icon={Phone} label="Telefone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required placeholder="(61) 99999-9999" />
          <Input label="Grau de parentesco" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })} placeholder="Ex.: Mãe, irmão" />
          <Input icon={Mail} label="E-mail (opcional)" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
          <button disabled={saving} className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50">
            {saving ? "Salvando..." : "Adicionar contato"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Input({ icon: Icon, label, value, onChange, placeholder, type = "text", required }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[11px] font-semibold text-muted-foreground">{label}</span>
      <div className="relative">
        {Icon && <Icon className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full rounded-xl border border-border bg-background py-2.5 ${Icon ? "pl-9" : "pl-3"} pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20`}
        />
      </div>
    </label>
  );
}