import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import PageLayout from "../components/PageLayout";
import SearchBar from "../components/SearchBar";
import useWorkers from "../components/UseWorkers";

import MetricBar from "../components/MetricBar";
import PlanificationView from "../components/PlanificationView";
import WorkingMemoryView from "../components/WorkingMemoryView";
import FlexibilityCognitiveView from "../components/FlexibilityCognitiveView";

import EEGDashboard from "../components/EEGDashboard";
import { getNivelKey, getNivelLabel, getColorSet as getColorSetNivel } from "../lib/nivel";
import CardPunt from "../components/CardPunt";
import useWorkerData from "./UseWorkerData";

// shadcn/u
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // <-- añadido
import ScoreRangeBar from "./ScoreRangeBar";

// ==== Helpers de color (faltaban) ====
const hexToRgb = (hex) => {
  if (!hex) return [31, 41, 55]; // gris por defecto
  const h = hex.replace('#', '').trim();
  if (h.length === 3) {
    const r = parseInt(h[0] + h[0], 16);
    const g = parseInt(h[1] + h[1], 16);
    const b = parseInt(h[2] + h[2], 16);
    return [r, g, b];
  }
  if (h.length === 6) {
    const r = parseInt(h.slice(0, 2), 16);
    const g = parseInt(h.slice(2, 4), 16);
    const b = parseInt(h.slice(4, 6), 16);
    return [r, g, b];
  }
  return [31, 41, 55];
};
const parseColor = (c) => {
  if (!c) return [31, 41, 55];
  const s = String(c).trim();
  if (s.startsWith('#')) return hexToRgb(s);
  const m = s.match(/\d+(\.\d+)?/g);
  if (m && m.length >= 3) return [Number(m[0]), Number(m[1]), Number(m[2])];
  return [31, 41, 55];
};
const toRGBA = (color, alpha = 1) => {
  const [r, g, b] = parseColor(color);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
const withAlpha = (color, alpha) => toRGBA(color, alpha);
// =====================================

// Añadidos: halo y estilos de nivel
const buildHalo = (c) => ({
  padding: 1,
  background: `linear-gradient(135deg, ${c} 0%, rgba(255,255,255,0) 70%)`,
  WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  WebkitMaskComposite: 'xor',
  maskComposite: 'exclude'
});

const buildNivelBadgeStyle = (sec) => {
  const c = sec?.color || '#6b7280';
  return {
    background: withAlpha(c, 0.18),
    color: withAlpha(c, 0.92),
    borderColor: withAlpha(c, 0.40),
  };
};

// ----------------- Helpers -----------------
// Convierte etiquetas que terminan en PD/PT/PC a su versión "Total" en español
const labelToTotalEs = (raw) => {
  const base = String(raw || "").replace(/\s+(PD|PT|PC)\s*$/i, "").trim();

  // Normaliza variantes
  const b = base
    .replace(/^Tiempo\s+Servicio\b/i, "Tiempo de Servicio")
    .replace(/^Tiempo\s+Servicios\b/i, "Tiempo de Servicios")
    .replace(/^Tiempo\s+Asignación\b/i, "Tiempo de Asignación");

  if (/^Aciertos Netos\b/i.test(b)) return "Aciertos Netos Totales";
  if (/^Aciertos\b/i.test(b)) return "Aciertos Totales";
  if (/^Servicios\b/i.test(b)) return "Servicios Totales";
  if (/^Consultas\b/i.test(b)) return "Consultas Totales";
  if (/^Tiempo de Servicio\b/i.test(b)) return "Tiempo de Servicio Total";
  if (/^Tiempo de Servicios\b/i.test(b)) return "Tiempo de Servicios Total";
  if (/^Tiempo de Asignación\b/i.test(b)) return "Tiempo de Asignación Total";
  if (/^Switching\b/i.test(b)) return "Switching Total";
  if (/^Interferencia\b/i.test(b)) return "Interferencia Total";
  if (/^Perseveraciones\b/i.test(b)) return "Perseveraciones Totales";
  return `${b} Total`;
};

// Filtra una sección dejando solo métricas cuyo label termina en el sufijo (por defecto 'PT')
// y renombra visualmente a "Total"
const filterSectionBySuffix = (sec, suffix = "PT") => {
  if (!sec) return null;
  const suf = String(suffix).trim().toUpperCase();
  const metrics = (sec.metrics || [])
    .filter((m) => {
      const lbl = String(m?.label || "").trim().toUpperCase();
      return lbl.endsWith(` ${suf}`) || lbl.endsWith(suf);
    })
    .map((m) => ({ ...m, label: labelToTotalEs(m.label) }));
  return { ...sec, metrics };
};

// T-score defensivo (20–80) a partir de las métricas cuando el backend no lo entrega
const computeTscore = (sec) => {
  if (!sec) return 50;
  if (typeof sec.tscore === "number" && Number.isFinite(sec.tscore)) return sec.tscore;
  const nums = (sec.metrics || [])
    .map((m) => Number(m?.value))
    .filter((n) => Number.isFinite(n));
  if (!nums.length) return 50;
  // Normalización simple para distintas escalas
  const norm = nums.map((v) => {
    if (v < 0) return 0;
    if (v <= 100) return v / 100;
    if (v <= 1000) return Math.min(v / 100, 1);
    return 1;
  });
  const avg = norm.reduce((a, b) => a + b, 0) / norm.length;
  return Math.round(20 + avg * 60); // 20..80
};
const decorateSection = (sec) => {
  if (!sec) return null;
  const tscore = computeTscore(sec);
  const key = getNivelKey(tscore);
  const label = getNivelLabel(key);
  const { color, background } = getColorSet(key);
  return { ...sec, tscore, nivel: label, color, background };
};

export const getColorSet = getColorSetNivel;

// Localiza títulos de secciones al español en el resumen
const localizeSectionTitle = (sec) => {
  if (!sec) return sec;
  const t = String(sec.title || "").toLowerCase();
  if (t.includes("planning") || sec.icon === "planification") return { ...sec, title: "Planificación" };
  if (t.includes("memory") || sec.icon === "workingMemory") return { ...sec, title: "Memoria de Trabajo" };
  if (t.includes("flexibility") || sec.icon === "flexibilityCognitive") return { ...sec, title: "Flexibilidad Cognitiva" };
  return sec;
};

// ----------------- Componente -----------------
export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const { workers } = useWorkers();
  const [selectedWorker, setSelectedWorker] = useState(null);

  // Autoselecciona el primero disponible para cargar datos dinámicos sin romper la vista
  useEffect(() => {
    if (!selectedWorker && Array.isArray(workers) && workers.length) {
      setSelectedWorker(workers[0]);
    }
  }, [workers, selectedWorker]);

  const tab = searchParams.get("tab") || "resumen";
  const tabIndexMap = { resumen: 0, planificacion: 1, memoria: 2, flexibilidad: 3 };
  const activeIndex = tabIndexMap[tab];

  const section = searchParams.get("section") || "Nesplora Ice Cream";

  // Datos dinámicos desde backend
  const api = useWorkerData(selectedWorker?.id);
  // Full (para las vistas detalladas)
  const planificacion = decorateSection(api?.planificacion);
  const memoriaTrabajo = decorateSection(api?.memoriaTrabajo);
  const flexibilidad = decorateSection(api?.flexibilidad);
  // Solo PT (para el dashboard/resumen) + títulos en español
  const planificacionPT = decorateSection(filterSectionBySuffix(api?.planificacion, "PT"));
  const memoriaTrabajoPT = decorateSection(filterSectionBySuffix(api?.memoriaTrabajo, "PT"));
  const flexibilidadPT = decorateSection(filterSectionBySuffix(api?.flexibilidad, "PT"));
  const seccionesPT = [planificacionPT, memoriaTrabajoPT, flexibilidadPT].filter(Boolean).map(localizeSectionTitle);
  const loading = !!api?.loading;

  // Promedio ajustado a escala 20–80
  const promedio = seccionesPT.length
    ? Math.round(((seccionesPT.reduce((a, s) => a + s.tscore, 0) / seccionesPT.length) - 20) / 60 * 100)
    : 0;

  const estadoGeneral =
    promedio >= 83 ? "Excelente" :   // T-score >= 70
    promedio >= 66 ? "Bueno" :       // T-score >= 60
    promedio >= 35 ? "Regular" :     // T-score >= 41
    promedio >= 18 ? "Bajo" :        // T-score >= 31
                    "Crítico";      // T-score <= 30


  // ================= NUEVO: usar variables de nivel para statusColor =================
  const promedioTScore = Math.round((promedio / 100) * (80 - 20) + 20); // inverso para volver a 20–80
  const statusNivelKey = getNivelKey(promedioTScore);                  // MuyAlto / Alto / ...
  const { color: statusColor, background: statusBg } = getColorSet(statusNivelKey);
  // statusBg ya viene como rgba(r,g,b,0.15)
  const statusBorder = toRGBA(statusColor, 0.35);
  // ================================================================================
  const primaryTextColor = useMemo(() => {
    if (typeof window === 'undefined') return '#1f2937';
    return (
      getComputedStyle(document.documentElement)
        .getPropertyValue('--color-primary-text')
        .trim() || '#1f2937'
    );
  }, []);

  const neutralColor = useMemo(() => {
    if (typeof window === 'undefined') return '#a694cc'; // fallback
    const val = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-neutral')
      .trim();
    return val || '#a694cc';
  }, []);

  // --- Título dinámico para el layout ---
  const tabLabelMap = {
    resumen: 'Dashboard',
    planificacion: 'Planificación',
    memoria: 'Memoria de Trabajo',
    flexibilidad: 'Flexibilidad Cognitiva'
  };

  const dynamicTitle = section === 'EEG'
    ? 'Electroencefalograma'
    : section === 'Nesplora Ice Cream'
      ? (tabLabelMap[tab] || 'Dashboard')
      : 'Dashboard';

  const renderTitleAddon = () => {
    if (loading) return null;

    const sectionMap = {
      1: planificacionPT || planificacion,
      2: memoriaTrabajoPT || memoriaTrabajo,
      3: flexibilidadPT || flexibilidad,
    };
    const sec = sectionMap[activeIndex];
    if (!sec) return null;

    return (
      <div className="ml-3">
        <Card
          className="p-1.5 px-8 rounded-sm shadow-sm border border-border/60 glass-primary-bg dark:bg-zinc-800/60 flex flex-row items-center gap-5"
          style={buildNivelBadgeStyle(sec)}
        >
          <span className="text-[12px] font-semibold text-primary-text tracking-wide">Total</span>
          <span className="text-normal font-bold text-primary-text">{sec.tscore}</span>
          <Badge className="text-[12px] px-2 py-0" style={buildNivelBadgeStyle(sec)}>
            {sec.nivel}
          </Badge>
        </Card>
      </div>
    );
  };

  return (
    <PageLayout
      title={dynamicTitle}
      titleAddon={renderTitleAddon()}
      headerAction={{
        left: selectedWorker && (
          <div className="text-xs text-primary-text text-right">
            <p className="font-semibold">{selectedWorker.nombre}</p>
            {selectedWorker.fecha && (
              <p className="text-secondary-text">{selectedWorker.fecha}</p>
            )}
          </div>
        ),
        center: (
          <SearchBar
            useCombobox={true}
            workers={workers}
            onBuscar={setTextoBusqueda}
            onSeleccionar={(w) => setSelectedWorker(w)}
          />
        ),
        right: (
          <ScoreRangeBar />
        )
      }}
    >
      {section === "Nesplora Ice Cream" && (
        <div>
          {selectedWorker && loading && (
            <div className="text-center py-6 text-sm text-secondary-text">
              Cargando datos...
            </div>
          )}
          {!selectedWorker && (
            <div className="text-center py-6 text-sm text-secondary-text">
              Seleccione un trabajador para cargar los datos.
            </div>
          )}

          {selectedWorker && !loading && activeIndex === 0 && (
            <div className="planif-vars flex flex-col w-full mx-auto px-2 sm:px-4 space-y-4" style={{ maxWidth: '1400px' }}>

              {/* Subíndices */}
              <div className="grid gap-4 md:grid-cols-3">
               {seccionesPT.map((sec) => (
                 <CardPunt key={sec.title} label={sec.title} punt={sec.tscore} />
               ))}
               {seccionesPT.map((sec) => (
                 <Card key={sec.title || sec.icon} className="relative p-0 border-0 shadow-sm overflow-hidden h-full">
                   <div className="absolute inset-0 rounded-sm pointer-events-none" style={buildHalo(sec.color)} />
                   <div className="rounded-sm bg-gradient-to-br from-white to-white/95 dark:from-zinc-900 dark:to-zinc-900/80 p-4 h-full flex flex-col">
                     <CardHeader className="p-0 mb-3 flex flex-row items-center justify-between">
                       <CardTitle className="text-base font-semibold flex items-center gap-2 text-primary-text">
                          {sec.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-0 flex-1">
                        <div className="grid grid-cols-1 gap-3">
                         {sec.metrics.map((metric, idx) => (
                            <MetricBar
                              key={idx}
                              title={metric.label}
                              value={metric.value}
                              scale={1}
                              getColorSetFromValue={(v) => getColorSet(getNivelKey(v))}
                              getNivelFromValue={(v) => getNivelLabel(getNivelKey(v))}
                            />
                          ))}
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {selectedWorker && !loading && activeIndex === 1 && (
            <PlanificationView section={planificacion} getColorSet={getColorSet} />
          )}
          {selectedWorker && !loading && activeIndex === 2 && (
            <WorkingMemoryView section={memoriaTrabajo} getColorSet={getColorSet} />
          )}
          {selectedWorker && !loading && activeIndex === 3 && (
            <FlexibilityCognitiveView section={flexibilidad} getColorSet={getColorSet} />
          )}
        </div>
      )}

      {section === "EEG" && (
        selectedWorker ? (
          <EEGDashboard workerId={selectedWorker.id} />
        ) : (
          <div className="text-center py-6 text-sm text-secondary-text">
            Seleccione un trabajador para ver el EEG
          </div>
        )
      )}
    </PageLayout>
  );
}
