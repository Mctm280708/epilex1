import React, { useState } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { useSensorData } from "@/lib/SensorDataContext";

export function useBracelet() {
  const { connected } = useSensorData();
  return { connected };
}

export default function BraceletStatus({ compact = false }) {
  const { connected } = useBracelet();
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-semibold ${
        connected
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-600"
      }`}
    >
      {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
      {!compact && <span>{connected ? "Pulseira conectada" : "Sem pulseira"}</span>}
      <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-red-500"}`} />
    </div>
  );
}