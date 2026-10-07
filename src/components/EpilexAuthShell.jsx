import React from "react";
import { HeartPulse } from "lucide-react";

export default function EpilexAuthShell({ title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-accent/50 via-background to-background px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 mb-3">
            <HeartPulse className="w-7 h-7" />
          </div>
          <p className="text-lg font-extrabold tracking-tight">EPILEX <span className="text-primary">WEB</span></p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>}
        </div>
        <div className="bg-card rounded-2xl shadow-sm border border-border p-6">{children}</div>
        {footer && <p className="text-center text-sm text-muted-foreground mt-5">{footer}</p>}
      </div>
    </div>
  );
}