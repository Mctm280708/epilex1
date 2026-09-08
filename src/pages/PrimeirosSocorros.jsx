import React, { useState } from "react";
import { Phone, ChevronDown, AlertTriangle, Heart, ShieldCheck, Clock } from "lucide-react";

const steps = [
  {
    icon: ShieldCheck,
    title: "Mantenha a calma",
    text: "Fique tranquilo e conte o tempo da crise. A maioria das crises tônico-clônicas dura entre 1 e 3 minutos e param espontaneamente.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: AlertTriangle,
    title: "Proteja a pessoa de lesões",
    text: "Afastem objetos perigosos e móveis ao redor. Coloque algo macio sob a cabeça e retire óculos ou acessórios apertados.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Heart,
    title: "Posicione a pessoa de lado",
    text: "Vire a pessoa de lado (posição lateral de segurança) para facilitar a respiração e evitar engasgos com saliva ou vômito.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Clock,
    title: "Não introduza nada na boca",
    text: "Nunca coloque objetos, dedos ou líquidos na boca da pessoa. Ela não engole a língua — isso apenas causa ferimentos.",
    color: "bg-red-50 text-red-600",
  },
  {
    icon: Clock,
    title: "Não segure a pessoa",
    text: "Não tente imobilizar os movimentos. Restringir pode provocar fraturas e lesões musculares.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: Phone,
    title: "Acione a emergência se...",
    text: "Ligue para o SAMU (192) se a crise durar mais de 3 minutos, se houver outra crise logo em seguida, se for a primeira crise da pessoa, ou se houve trauma.",
    color: "bg-red-50 text-red-600",
  },
];

export default function PrimeirosSocorros() {
  const [open, setOpen] = useState(0);

  return (
    <div className="px-5 py-5">
      <h1 className="text-2xl font-extrabold tracking-tight">Primeiros Socorros</h1>
      <p className="text-sm text-muted-foreground">Como agir durante uma crise epiléptica</p>

      <a
        href="tel:192"
        className="mt-4 flex items-center justify-between rounded-2xl bg-destructive p-4 text-white shadow-lg shadow-destructive/25"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold">Emergência — SAMU</p>
            <p className="text-[11px] text-white/80">Ligar para 192</p>
          </div>
        </div>
        <span className="text-lg font-extrabold">192</span>
      </a>

      <div className="mt-5 space-y-2.5">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isOpen = open === i;
          return (
            <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="flex w-full items-center gap-3 p-4 text-left"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold">{i + 1}. {s.title}</p>
                </div>
                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && (
                <p className="px-4 pb-4 pl-[68px] text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          <strong className="text-foreground">Aviso:</strong> o EPILEX WEB é um protótipo e não substitui atendimento médico.
          Estas orientações são informativas e não constituem diagnóstico ou prescrição médica.
        </p>
      </div>
    </div>
  );
}