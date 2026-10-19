import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { Brain, Settings } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import BraceletStatus from "@/components/BraceletStatus";
import NeuroBackground from "@/components/NeuroPattern";

export default function Layout() {
  const location = useLocation();
  return (
    <div className="relative min-h-screen w-full bg-gradient-to-b from-secondary/[0.04] via-background to-background">
      <NeuroBackground variant="light" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col bg-card/80 shadow-2xl shadow-secondary/10 backdrop-blur-sm">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/60 bg-secondary/[0.03] px-5 py-3.5 backdrop-blur-xl">
          <Link to="/" className="flex items-center gap-2">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/30">
              <Brain className="h-5 w-5" strokeWidth={2.2} />
            </div>
            <div className="leading-none">
              <p className="text-[15px] font-extrabold tracking-tight text-foreground">EPILEX</p>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">WEB</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <BraceletStatus compact />
            <Link
              to="/configuracao"
              className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                location.pathname === "/configuracao"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
              aria-label="Configurações"
            >
              <Settings className="h-4.5 w-4.5" />
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden pb-24">
          <Outlet />
        </main>

        <BottomNav />
      </div>
    </div>
  );
}