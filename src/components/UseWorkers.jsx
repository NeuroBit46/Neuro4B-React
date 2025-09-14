import { useEffect, useState } from "react";

export default function useWorkers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkers = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/listar/`);
        const data = await res.json();
        setWorkers(data);
      } catch (err) {
        console.error("Error cargando trabajadores:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkers();
  }, []);

  return { workers, setWorkers, loading };
}
