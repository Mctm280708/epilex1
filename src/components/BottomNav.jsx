import React from "react";
import { NavLink } from "react-router-dom";
import { Home, BarChart3, LifeBuoy, User } from "lucide-react";

const items = [
  { to: "/", label: "Início", icon: Home, end: true },
  { to: "/graficos", label: "Gráficos", icon: BarChart3, end: false },
  { to: "/primeiros-socorros", label: "Socorros", icon: LifeBuoy, end: false },
  { to: "/dados-pessoais", label: "Perfil", icon: User, end: false },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-full max-w-md -translate-x-1/2 border-t border-border/60 bg-card/90 backdrop-blur-xl">
      <div className="flex items-stretch justify-around px-2 py-1.5">
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                    isActive ? "bg-primary/10 scale-105" : "bg-transparent"
                  }`}
                >
                  <Icon className="h-5 w-5" strokeWidth={isActive ? 2.6 : 2} />
                </div>
                <span className={`text-[10px] font-semibold ${isActive ? "text-primary" : ""}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}