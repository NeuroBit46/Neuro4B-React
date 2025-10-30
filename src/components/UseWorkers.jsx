import { useEffect, useState } from "react";

// const API_BASE = (import.meta.env.VITE_API_BASE || "http://190.162.134.254:8000").replace(/\/$/, "");
const API_BASE = (import.meta.env.VITE_API_BASE ?? "/api").replace(/\/+$/, "");

export default function useWorkers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ac = new AbortController();

    async function fetchWorkers() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/api/listar/`, {
          signal: ac.signal,
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json().catch(() => []);
        const list =
          (Array.isArray(data) && data) ||
          (Array.isArray(data?.results) && data.results) ||
          [];
        setWorkers(list);
      } catch (e) {
        if (e?.name === "AbortError") return; // ignora abort en StrictMode
        console.warn("useWorkers error:", e?.message);
        setWorkers([]);
        setError(e?.message || "Error");
      } finally {
        setLoading(false);
      }
    }

    fetchWorkers();
    return () => ac.abort();
  }, []);

  return { workers, loading, error };
}
