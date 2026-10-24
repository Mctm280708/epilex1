import { useState, useEffect, useRef, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export function useSensorData(intervalMs = 2000) {
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
    const id = setInterval(fetchSensorData, intervalMs);
    return () => {
      mountedRef.current = false;
      clearInterval(id);
    };
  }, [fetchSensorData, intervalMs]);

  return { data, loading, error, refresh: fetchSensorData };
}

export default useSensorData;