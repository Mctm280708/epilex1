import React from "react";
import { Brain } from "lucide-react";
import NeuroBackground, { BrainCircuit, EEGWave } from "@/components/NeuroPattern";

export default function EpilexAuthShell({ title, subtitle, footer, children }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary via-secondary to-[#0a1f2e] px-4 py-8">
      <NeuroBackground variant="dark" />
      <div className="relative w-full max-w-md z-10">
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="absolute inset-0 -m-2 rounded-3xl bg-primary/20 blur-xl" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-xl shadow-primary/30">
              <Brain className="h-8 w-8" strokeWidth={2.2} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xl font-extrabold tracking-tight text-white">EPILEX</p>
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">WEB</span>
          </div>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-white">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-white/60">{subtitle}</p>}
          <div className="mt-3 h-8 w-48 text-primary/40">
            <EEGWave className="h-full w-full" color="currentColor" strokeWidth={1.5} />
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white shadow-2xl shadow-black/20">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-primary/80 to-primary" />
          <div className="p-6">
            {children}
          </div>
        </div>
        {footer && <p className="mt-5 text-center text-sm text-white/50">{footer}</p>}
      </div>
    </div>
  );
}