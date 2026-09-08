import React, { useState, useEffect } from "react";
import { BluetoothConnected, BluetoothOff } from "lucide-react";

const KEY = "epilex_bracelet_connected";

export function useBracelet() {
  const [connected, setConnected] = useState(() => localStorage.getItem(KEY) === "1");
  useEffect(() => {
    const handler = () => setConnected(localStorage.getItem(KEY) === "1");
    window.addEventListener("epilex-bracelet", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("epilex-bracelet", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  const toggle = () => {
    const next = !connected;
    localStorage.setItem(KEY, next ? "1" : "0");
    setConnected(next);
    window.dispatchEvent(new Event("epilex-bracelet"));
  };
  return { connected, toggle };
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
      {connected ? <BluetoothConnected className="h-3.5 w-3.5" /> : <BluetoothOff className="h-3.5 w-3.5" />}
      {!compact && <span>{connected ? "Pulseira conectada" : "Sem pulseira"}</span>}
      <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-emerald-500" : "bg-red-500"}`} />
    </div>
  );
}