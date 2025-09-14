import { useEffect, useState } from "react";

export default function useWorkerData(pk) {
  const [data, setData] = useState({
    planificacion: null,
    memoriaTrabajo: null,
    flexibilidad: null,
    secciones: [],
  });
  const [loading, setLoading] = useState(false);

  const normalize = (str) => str?.trim().toLowerCase() || "";
  const resolveCssVar = (v) =>
    getComputedStyle(document.documentElement)
      .getPropertyValue(v.replace("var(", "").replace(")", ""))
      .trim();
  const rgbToRgba = (rgb, a = 0.15) => {
    const [r, g, b] = rgb.match(/\d+/g);
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  };

  // Dado un raw y un config (categoría/sub/ensayo), devuelve un map { destino: valor }
  const extractMetrics = (raw, config) => {
    return config.reduce((acc, { categoria, subcategoria, ensayo, destino }) => {
      // filtramos solo filas de esa categoría + subcategoría
      const filas = raw.filter(
        (item) =>
          normalize(item["Categoría"]) === normalize(categoria) &&
          normalize(item["Sub Categoría"]) === normalize(subcategoria)
      );
      // buscamos la que tenga el ensayoKey no vacío
      const filaConScore = filas.find((f) => f[ensayo] !== "" && f[ensayo] != null);
      acc[destino] = Number(filaConScore?.[ensayo]) || 0;
      return acc;
    }, {});
  };

  // Construye la sección lista para dashboard
  const buildSection = (title, iconKey, metricsObj) => {
    const color = resolveCssVar("var(--color-primary-text)");
    return {
      title,
      icon: iconKey,
      miniDesc: title,
      metrics: Object.entries(metricsObj).map(([label, value]) => ({
        label,
        value,
      })),
      color,
      background: rgbToRgba(color),
    };
  };

  useEffect(() => {
    if (!pk) return;
    setLoading(true);

    fetch(`/api/trabajador/${pk}/excel-json/`)
      .then((res) => res.json())
      .then((json) => {
        const raw = json.contenido?.["Datos Brutos"] || [];

        // Configuraciones para cada sección
        const configPlanning = [
          { categoria: "Planning", subcategoria: "Aciertos", ensayo: "Ensayo 3 (Score)", destino: "Aciertos" },
          { categoria: "Planning", subcategoria: "Tiempos",   ensayo: "Ensayo 3 (Score)", destino: "Tiempos" },
        ];

        const configMemory = [
          { categoria: "Memory", subcategoria: "Servicios", ensayo: "Ensayo 3 (Score)", destino: "Servicios" },
          { categoria: "Memory", subcategoria: "Consultas", ensayo: "Ensayo 3 (Score)", destino: "Consultas" },
          { categoria: "Memory", subcategoria: "Aciertos",  ensayo: "Ensayo 3 (Score)", destino: "Aciertos"  },
          { categoria: "Memory", subcategoria: "Tiempos",   ensayo: "Ensayo 3 (Score)", destino: "Tiempos"   },
        ];

        const configFlex = [
          { categoria: "Flexibility", subcategoria: "Interferencia", ensayo: "Ensayo 1 (Score)", destino: "Interferencia"   },
          { categoria: "Flexibility", subcategoria: "Perseveraciones", ensayo: "Ensayo 1 (Score)", destino: "Perseveraciones" },
          { categoria: "Flexibility", subcategoria: "Tiempo De Servicio", ensayo: "Ensayo 1 (Score)", destino: "Tiempo De Servicio" },
          { categoria: "Switching",    subcategoria: "Switching",     ensayo: "Ensayo 1 (Score)", destino: "Switching"       },
        ];

        const planningMetrics     = extractMetrics(raw, configPlanning);
        const memoryMetrics       = extractMetrics(raw, configMemory);
        const flexibilityMetrics  = extractMetrics(raw, configFlex);

        const planificacion   = buildSection("Planning", "planification",   planningMetrics);
        const memoriaTrabajo  = buildSection("Memory",   "workingMemory",   memoryMetrics);
        const flexibilidad    = buildSection("Flexibility","flexibilityCognitive", flexibilityMetrics);

        setData({
          planificacion,
          memoriaTrabajo,
          flexibilidad,
          secciones: [planificacion, memoriaTrabajo, flexibilidad],
        });
      })
      .catch((err) => console.error("Error useWorkerData:", err))
      .finally(() => setLoading(false));
  }, [pk]);

  return { ...data, loading };
}
