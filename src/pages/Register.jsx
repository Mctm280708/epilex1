import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, User, ShieldCheck, KeyRound, Copy, Check } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import EpilexAuthShell from "@/components/EpilexAuthShell";
import { toast } from "@/components/ui/use-toast";

function formatCode(c) {
  return c && c.length === 6 ? c.slice(0, 3) + "-" + c.slice(3) : c;
}

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("paciente");
  const [linkCode, setLinkCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [generatedCode, setGeneratedCode] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) { setError("As senhas não coincidem."); return; }
    if (role === "contato" && !linkCode.trim()) { setError("Informe o código de vinculação recebido do paciente."); return; }
    setLoading(true);
    try {
      await base44.auth.register({ email, password });
      setShowOtp(true);
    } catch (err) {
      setError(err.message || "Falha no cadastro.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await base44.auth.verifyOtp({ email, otpCode });
      if (result?.access_token) base44.auth.setToken(result.access_token);

      if (role === "contato") {
        try {
          const res = await base44.functions.invoke("linkContact", { code: linkCode });
          if (res?.data?.ok) window.location.href = "/contato";
        } catch (err) {
          setError((err.response?.data?.error) || err.message || "Não foi possível vincular o código.");
        }
        return;
      }

      // Paciente: generate the sharing code to give to the emergency contact.
      const res = await base44.functions.invoke("generateLinkCode");
      setGeneratedCode(res?.data?.code || null);
    } catch (err) {
      setError(err.message || "Código de verificação inválido.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await base44.auth.resendOtp(email);
      toast({ title: "Código enviado", description: "Verifique seu e-mail." });
    } catch (err) {
      setError(err.message || "Falha ao reenviar.");
    }
  };

  const copyCode = () => {
    if (!generatedCode) return;
    navigator.clipboard?.writeText(formatCode(generatedCode));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (generatedCode) {
    return (
      <EpilexAuthShell
        title="Cadastro concluído!"
        subtitle="Compartilhe seu código de vinculação"
      >
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <Check className="h-7 w-7" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Gere um código para que seu <strong className="text-foreground">contato de emergência</strong> se cadastre
            e acesse seus gráficos, histórico de crises, localização e dados de saúde.
          </p>
          <div className="my-5 flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 px-4 py-5">
            <span className="font-mono text-3xl font-extrabold tracking-[0.3em] text-primary">
              {formatCode(generatedCode)}
            </span>
          </div>
          <button
            onClick={copyCode}
            className="mx-auto flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            {copied ? <><Check className="h-4 w-4" /> Copiado!</> : <><Copy className="h-4 w-4" /> Copiar código</>}
          </button>
          <p className="mt-4 text-xs text-muted-foreground">
            O contato deve usar este código ao se cadastrar como "Contato de emergência".
          </p>
          <Button className="mt-5 w-full h-12 font-semibold" onClick={() => (window.location.href = "/")}>
            Entrar no aplicativo
          </Button>
        </div>
      </EpilexAuthShell>
    );
  }

  if (showOtp) {
    return (
      <EpilexAuthShell title="Verifique seu e-mail" subtitle={`Enviamos um código para ${email}`}>
        {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
        <div className="flex justify-center mb-6">
          <InputOTP maxLength={6} value={otpCode} onChange={setOtpCode} autoFocus autoComplete="one-time-code">
            <InputOTPGroup>
              {[0,1,2,3,4,5].map((i) => <InputOTPSlot key={i} index={i} />)}
            </InputOTPGroup>
          </InputOTP>
        </div>
        <Button className="w-full h-12 font-semibold" onClick={handleVerify} disabled={loading || otpCode.length < 6}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verificando...</> : "Verificar"}
        </Button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Não recebeu?{" "}
          <button onClick={handleResend} className="text-primary font-semibold hover:underline">Reenviar</button>
        </p>
      </EpilexAuthShell>
    );
  }

  return (
    <EpilexAuthShell
      title="Criar conta"
      subtitle="Cadastre-se para começar o monitoramento"
      footer={
        <>
          Já tem conta?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">Entrar</Link>
        </>
      }
    >
      <Label className="mb-2 block text-xs font-semibold text-muted-foreground">Você é:</Label>
      <div className="grid grid-cols-2 gap-2 mb-5">
        <RoleButton active={role === "paciente"} onClick={() => setRole("paciente")} icon={User} label="Paciente" />
        <RoleButton active={role === "contato"} onClick={() => setRole("contato")} icon={ShieldCheck} label="Contato de emergência" />
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="email" type="email" autoComplete="email" autoFocus placeholder="seu@email.com"
              value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="password" type="password" autoComplete="new-password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirmar senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input id="confirm" type="password" autoComplete="new-password" placeholder="••••••••"
              value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="pl-10 h-12" required />
          </div>
        </div>

        {role === "contato" && (
          <div className="space-y-2 rounded-xl border border-primary/20 bg-primary/5 p-3">
            <Label htmlFor="linkcode" className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <KeyRound className="h-3.5 w-3.5" /> Código de vinculação
            </Label>
            <Input id="linkcode" placeholder="Ex.: ABC-123" value={linkCode}
              onChange={(e) => setLinkCode(e.target.value.toUpperCase())} className="h-11 font-mono tracking-widest" required />
            <p className="text-[11px] text-muted-foreground">Informe o código fornecido pelo paciente.</p>
          </div>
        )}

        <Button type="submit" className="w-full h-12 font-semibold" disabled={loading}>
          {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Criando...</> : "Criar conta"}
        </Button>
      </form>
    </EpilexAuthShell>
  );
}

function RoleButton({ active, onClick, icon: Icon, label }) {
  return (
    <button type="button" onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-xl border py-3 text-xs font-semibold transition-colors ${
        active ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
      }`}>
      <Icon className="h-5 w-5" /> {label}
    </button>
  );
}