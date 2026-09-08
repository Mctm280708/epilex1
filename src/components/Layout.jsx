import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { HeartPulse, Settings } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import BraceletStatus from "@/components/BraceletStatus";

export default function Layout() {
  const location = useLocation();
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-accent/40 via-background to-background">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col bg-background shadow-2xl shadow-primary/5">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border/70 bg-background/85 px-5 py-3.5 backdrop-blur-xl">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
              <HeartPulse className="h-5 w-5" />
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