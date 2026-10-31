import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const SensorDataContext = createContext(null);

export function SensorDataProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const fetchSensorData = useCallback(async () => {
    try {
      const res = await base44.functions.invoke("getSensorData");
      if (!mountedRef.current) return;
      setData(res?.data ?? null);
      setError(null);
    } catch (e) {
      if (!mountedRef.current) return;
      setError(e?.message || "Erro ao buscar dados do sensor");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    fetchSensorData();
    const id = setInterval(fetchSensorData, 2000);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [fetchSensorData]);

  const connected = !!data && !error;

  return (
    <SensorDataContext.Provider value={{ data, loading, error, connected, refresh: fetchSensorData }}>
      {children}
    </SensorDataContext.Provider>
  );
}

export function useSensorData() {
  const ctx = useContext(SensorDataContext);
  if (!ctx) {
    return { data: null, loading: false, error: "Sensor provider não disponível", connected: false, refresh: async () => {} };
  }
  return ctx;
}

export default SensorDataContext;