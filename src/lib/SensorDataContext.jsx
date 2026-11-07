import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

const FIREBASE_URL = "https://dourado-3e4ed-default-rtdb.firebaseio.com";
const SENSOR_PATH = "eplex/ultima_leitura";

const SensorDataContext = createContext(null);

export function SensorDataProvider({ children }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const fetchSensorData = useCallback(async () => {
    try {
      const res = await fetch(`${FIREBASE_URL}/${SENSOR_PATH}.json`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Firebase retornou ${res.status}`);
      const json = await res.json();
      if (!json) throw new Error("Nenhum dado encontrado no Firebase");
      if (!mountedRef.current) return;
      setData(json);
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