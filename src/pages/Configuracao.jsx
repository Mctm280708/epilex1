import React, { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { useBracelet } from "@/components/BraceletStatus";
import { Plus, Trash2, Phone, User, Mail, X, Watch, Wifi, Vibrate, ShieldAlert, Link2, LogOut, Copy, Check, RefreshCw, UserCheck, Ban } from "lucide-react";

export default function Configuracao() {
  const { connected } = useBracelet();
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

  const [linkCode, setLinkCode] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    base44.functions.invoke("getMyRole")
      .then((r) => { if (r?.data?.role === "patient" && r.data.link_code) setLinkCode(r.data.link_code); })
      .catch(() => {});
  }, []);

  const regenerate = async () => {
    setGenerating(true);
    try {
      const r = await base44.functions.invoke("generateLinkCode");
      if (r?.data?.code) setLinkCode(r.data.code);
    } catch (e) {} finally { setGenerating(false); }
  };

  const copyCode = () => {
    if (!linkCode) return;
    const fmt = linkCode.length === 6 ? linkCode.slice(0,3) + "-" + linkCode.slice(3) : linkCode;
    navigator.clipboard?.writeText(fmt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedCode = linkCode ? (linkCode.length === 6 ? linkCode.slice(0,3) + "-" + linkCode.slice(3) : linkCode) : null;

  const [linkedContacts, setLinkedContacts] = useState([]);
  const [revoking, setRevoking] = useState(false);

  const loadLinked = useCallback(async () => {
    try {
      const res = await base44.entities.Linkage.filter({ status: "active" }, { limit: 10 });
      setLinkedContacts(res?.items || res || []);
    } catch (e) { setLinkedContacts([]); }
  }, []);
  useEffect(() => { loadLinked(); }, [loadLinked]);

  const revoke = async () => {
    if (!confirm("Tem certeza que deseja revogar o acesso do contato de emergência? Ele deixará de ver seus dados imediatamente.")) return;
    setRevoking(true);
    try {
      await base44.functions.invoke("revokeContact");
      setLinkedContacts([]);
    } catch (e) {} finally { setRevoking(false); }
  };

  return (
    <div className="px-5 py-5">
      <h1 className="text-2xl font-extrabold tracking-tight">Configurações</h1>
      <p className="text-sm text-muted-foreground">Gerencie pulseira, contatos e preferências</p>

      <Section title="Pulseira inteligente" icon={Watch}>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${connected ? "bg-emerald-50 text-emerald-600" : "bg-muted text-muted-foreground"}`}>
            <Wifi className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold">Status da conexão</p>
            <p className="text-[11px] text-muted-foreground">{connected ? "Conectada via Wi-Fi" : "Desconectada"}</p>
          </div>
        </div>
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
        <p className="text-xs text-muted-foreground">
          Compartilhe este código com seu contato de emergência. Ao se cadastrar como "Contato de emergência" e inserir o código, ele terá acesso aos seus gráficos, histórico de crises, localização e dados de saúde.
        </p>
        {formattedCode ? (
          <div className="mt-3">
            <div className="flex items-center justify-between rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-3">
              <span className="font-mono text-lg font-bold tracking-widest text-primary">{formattedCode}</span>
              <div className="flex gap-1">
                <button onClick={copyCode} className="flex h-8 w-8 items-center justify-center rounded-lg text-primary hover:bg-primary/10" aria-label="Copiar">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
                <button onClick={regenerate} disabled={generating} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted" aria-label="Gerar novo">
                  <RefreshCw className={`h-4 w-4 ${generating ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={regenerate} disabled={generating}
            className="mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-bold text-primary-foreground disabled:opacity-50">
            {generating ? "Gerando..." : "Gerar código de vinculação"}
          </button>
        )}
      </Section>

      <Section title="Contatos vinculados" icon={UserCheck}>
        {linkedContacts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            Nenhum contato de emergência vinculado no momento.
          </p>
        ) : (
          <div className="space-y-2">
            {linkedContacts.map((l) => (
              <div key={l.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{l.contact_email || "Contato vinculado"}</p>
                  <p className="text-[11px] text-emerald-600">Acesso ativo</p>
                </div>
              </div>
            ))}
            <button onClick={revoke} disabled={revoking}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 py-2.5 text-sm font-bold text-destructive disabled:opacity-50">
              <Ban className="h-4 w-4" /> {revoking ? "Revogando..." : "Revogar acesso"}
            </button>
          </div>
        )}
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
          onClick={() => base44.auth.logout(window.location.origin)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-muted py-2.5 text-sm font-bold text-foreground"
        >
          <LogOut className="h-4 w-4" /> Sair da conta
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