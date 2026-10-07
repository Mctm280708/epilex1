import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, User, ShieldCheck } from "lucide-react";
import EpilexAuthShell from "@/components/EpilexAuthShell";
import { safeReturnTo } from "@/lib/authReturnTo";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("paciente");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      // Resolve the real role from the linkage data, then route accordingly.
      let dest = returnTo && returnTo !== "/" ? returnTo : "/";
      try {
        const res = await base44.functions.invoke("getMyRole");
        if (res?.data?.role === "contact") dest = "/contato";
      } catch (err) {
        // fall back to the patient home
      }
      window.location.href = dest;
    } catch (err) {
      setError(err.message || "E-mail ou senha inválidos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <EpilexAuthShell
      title="Acesse sua conta"
      subtitle="Monitoramento e suporte para crises epilépticas"
      footer={
        <>
          Não tem uma conta?{" "}
          <Link to="/register" className="text-primary font-semibold hover:underline">
            Cadastre-se
          </Link>
        </>
      }
    >
      <Label className="mb-2 block text-xs font-semibold text-muted-foreground">Você é:</Label>
      <div className="grid grid-cols-2 gap-2 mb-5">
        <RoleButton active={role === "paciente"} onClick={() => setRole("paciente")} icon={User} label="Paciente" />
        <RoleButton active={role === "contato"} onClick={() => setRole("contato")} icon={ShieldCheck} label="Contato de emergência" />
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email" type="email" autoComplete="email" autoFocus
              placeholder="seu@email.com" value={email}
              onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12" required
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">Esqueceu a senha?</Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password" type="password" autoComplete="current-password"
              placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12" required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-semibold" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Entrando...</> : "Entrar"}
        </Button>
      </form>
    </EpilexAuthShell>
  );
}

function RoleButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-xs font-semibold transition-colors ${
        active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  );
}