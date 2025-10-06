import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import ReactECharts from "echarts-for-react";

import PageLayout from "../components/PageLayout";
import SearchBar from "../components/SearchBar";
import useWorkers from "../components/UseWorkers";

import SemiGauge from "../components/SemiGauge";
import MetricBar from "../components/MetricBar";

import PlanificationView from "../components/PlanificationView";
import WorkingMemoryView from "../components/WorkingMemoryView";
import FlexibilityCognitiveView from "../components/FlexibilityCognitiveView";

import EEGDashboard from "../components/EEGDashboard";
import { Icons } from "../constants/Icons";

// shadcn/ui
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // <-- añadido

// ----------------- Helpers -----------------
export function getNivelKey(tscore) {
  if (tscore >= 70 && tscore <= 80) return "MuyAlto";
  if (tscore >= 60 && tscore <= 69) return "Alto";
  if (tscore >= 41 && tscore <= 59) return "Medio";
  if (tscore >= 31 && tscore <= 40) return "Bajo";
  return "MuyBajo";
}

export function getNivelLabel(key) {
  return {
    MuyAlto: "MUY ALTO",
    Alto: "ALTO",
    Medio: "MEDIO",
    Bajo: "BAJO",
    MuyBajo: "MUY BAJO",
  }[key];
}

export function getColorSet(key) {
  const varName = {
    MuyAlto: "var(--color-very-high)",
    Alto: "var(--color-high)",
    Medio: "var(--color-medium)",
    Bajo: "var(--color-low)",
    MuyBajo: "var(--color-very-low)",
  }[key] || "var(--color-primary-text)";

  const resolved = getComputedStyle(document.documentElement)
    .getPropertyValue(varName.replace(/var\(|\)/g, ""))
    .trim();
  const [r, g, b] = resolved.match(/\d+/g);

  return {
    color: resolved,
    background: `rgba(${r}, ${g}, ${b}, 0.15)`,
  };
}

function getStaticWorkerData() {
  const raw = [
    {
      id: "planificacion",
      title: "Planificación",
      icon: "planification",
      miniDesc: "Organización de acciones y anticipación de consecuencias.",
      tscore: 70,
      metrics: [
        { label: "Aciertos", value: 72 },
        { label: "Tiempos", value: 77 },
      ],
    },
    {
      id: "memoria",
      title: "Memoria de Trabajo",
      icon: "workingMemory",
      miniDesc: "Retención activa de información para tareas inmediatas.",
      tscore: 45,
      metrics: [
        { label: "Servicios", value: 47 },
        { label: "Consultas", value: 45 },
        { label: "Aciertos", value: 48 },
        { label: "Tiempos", value: 43 },
      ],
    },
    {
      id: "flexibilidad",
      title: "Flexibilidad cognitiva",
      icon: "flexibilityCognitive",
      miniDesc: "Adaptación a cambios y manejo de interferencias.",
      tscore: 64,
      metrics: [
        { label: "Interferencia", value: 65 },
        { label: "Perseveraciones", value: 68 },
        { label: "Tiempo de Servicio", value: 63 },
        { label: "Switching", value: 62 },
      ],
    },
  ];

  const sections = raw.map((sec) => {
    const key = getNivelKey(sec.tscore);
    const label = getNivelLabel(key);
    const { color, background } = getColorSet(key);
    return { ...sec, nivel: label, color, background };
  });

  return {
    secciones: sections,
    planificacion: sections.find((s) => s.id === "planificacion"),
    memoriaTrabajo: sections.find((s) => s.id === "memoria"),
    flexibilidad: sections.find((s) => s.id === "flexibilidad"),
    loading: false,
  };
}

const getInsight = (nivel) => {
  switch (nivel) {
    case "MUY ALTO": return "Rendimiento sobresaliente en esta área.";
    case "ALTO": return "Buen desempeño, con margen de optimización.";
    case "MEDIO": return "Nivel promedio, posible foco de mejora.";
    case "BAJO": return "Requiere atención y entrenamiento específico.";
    default: return "Área crítica, necesita intervención prioritaria.";
  }
};

// (opcional) helper para halo inline
const buildHalo = (c) => ({
  padding: 1,
  background: `linear-gradient(135deg, ${c} 0%, rgba(255,255,255,0) 70%)`,
  WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  WebkitMaskComposite: 'xor',
  maskComposite: 'exclude'
});

// Helpers de clases para badges (shadcn look & feel)
const getEstadoBadgeClasses = (estado) => ({
  Excelente: "bg-emerald-100 text-emerald-700 border border-emerald-200",
  Bueno:     "bg-blue-100 text-blue-700 border border-blue-200",
  Regular:   "bg-amber-100 text-amber-700 border border-amber-200",
  Bajo:      "bg-orange-100 text-orange-700 border border-orange-200",
  Crítico:   "bg-red-100 text-red-700 border border-red-200",
}[estado] || "bg-gray-100 text-gray-700 border border-gray-200");

const getNivelBadgeClasses = (nivel) => ({
  "MUY ALTO": "bg-emerald-100 text-emerald-700 border border-emerald-200",
  "ALTO":     "bg-blue-100 text-blue-700 border border-blue-200",
  "MEDIO":    "bg-sky-100 text-sky-700 border border-sky-200",
  "BAJO":     "bg-orange-100 text-orange-700 border border-orange-200",
  "MUY BAJO": "bg-red-100 text-red-700 border border-red-200",
}[nivel] || "bg-gray-100 text-gray-700 border border-gray-200");

// Helper para convertir #hex o rgb(...) a rgba(...)
function toRGBA(color, alpha = 1) {
  if (!color) return '';
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const nums = color.match(/\d+/g);
  if (nums && nums.length >= 3) {
    const [r,g,b] = nums;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

// NUEVO: withAlpha (usado en los gradients del ring)
function withAlpha(color, alpha = 1) {
  if (!color) return `rgba(0,0,0,${alpha})`;
  const c = color.trim();

  if (c.startsWith('rgba')) {
    const nums = c.match(/\d+/g);
    if (nums && nums.length >= 3) {
      const [r,g,b] = nums;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }
  if (c.startsWith('rgb')) {
    const nums = c.match(/\d+/g);
    if (nums && nums.length >= 3) {
      const [r,g,b] = nums;
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
  }
  if (c.startsWith('#')) {
    let hex = c.slice(1);
    if (hex.length === 3) hex = hex.split('').map(h => h + h).join('');
    const int = parseInt(hex,16);
    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (/^\d+\s+\d+\s+\d+$/.test(c)) {
    const [r,g,b] = c.split(/\s+/);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return c;
}

function buildNivelBadgeStyle(sec) {
  const nums = sec.color.match(/\d+/g) || [];
  const [r,g,b] = nums;
  return {
    background: sec.background,
    color: sec.color,
    borderColor: r ? `rgba(${r}, ${g}, ${b}, 0.35)` : 'transparent'
  };
}

// ----------------- Componente -----------------
export default function Dashboard() {
  const [searchParams] = useSearchParams();
  const [textoBusqueda, setTextoBusqueda] = useState("");
  const { workers } = useWorkers();

  const tab = searchParams.get("tab") || "resumen";
  const tabIndexMap = { resumen: 0, planificacion: 1, memoria: 2, flexibilidad: 3 };
  const activeIndex = tabIndexMap[tab];

  const section = searchParams.get("section") || "Nesplora Ice Cream";

  const { secciones, planificacion, memoriaTrabajo, flexibilidad, loading } = getStaticWorkerData();
  const [selectedWorker, setSelectedWorker] = useState(null);

  // Promedio ajustado a escala 20–80
const promedio = Math.round(
  ((secciones.reduce((acc, s) => acc + s.tscore, 0) / secciones.length) - 20) / (80 - 20) * 100
);

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

const resumenRingOption = useMemo(() => ({
  tooltip: {
    show: true,
    appendToBody: true,
    confine: false,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 0,
    textStyle: { color: '#111', fontSize: 12 },
    extraCssText: 'backdrop-filter:blur(4px);box-shadow:0 4px 14px -4px rgba(0,0,0,0.25);border-radius:6px;z-index:999999;'
  },
  series: [
    {
      type: 'gauge',
      startAngle: 90,
      endAngle: -270,
      clockwise: false,
      min: 0,
      max: 100,
      radius: '90%',
      center: ['50%', '55%'],
      progress: {
        show: true,
        roundCap: true,
        clip: false,
        itemStyle: { color: neutralColor } // <-- antes statusColor
      },
      pointer: { show: false },
      axisLine: {
        lineStyle: {
          width: 10,
          color: [[1, 'rgba(0,0,0,0.05)']]
        }
      },
      splitLine: { show: false },
      axisTick: { show: false },
      axisLabel: { show: false },
      animationDuration: 800,
      animationDurationUpdate: 500,
      data: [{ value: promedio }],
      detail: {
        formatter: '{value}%',
        fontSize: 18,
        fontWeight: 600,
        offsetCenter: [0, 0],
        color: neutralColor   // el texto mantiene el color por nivel
      }
    }
  ]
}), [promedio, neutralColor, statusColor]);

  const radarOption = {
    tooltip: {
      trigger: 'item',
      appendToBody: true,
      confine: false,
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderWidth: 0,
      textStyle: { color: primaryTextColor, fontSize: 12 },
      extraCssText:
        'backdrop-filter:blur(5px);box-shadow:0 6px 20px -6px rgba(0,0,0,.25);border-radius:8px;padding:8px 10px;z-index:999999;'
    },
    xAxis: { show: false, min: 0, max: 80, alignTicks: false },
    yAxis: { show: false, min: 0, max: 80, alignTicks: false },
    radar: {
      indicator: secciones.map(s => ({ name: s.title, max: 80 })),
      splitNumber: 5,
      splitLine: { lineStyle: { color: withAlpha(neutralColor, 0.25) } },
      splitArea: {
        areaStyle: {
          color: [
            withAlpha(neutralColor, 0.09),
            withAlpha(neutralColor, 0.05)
          ]
        }
      },
      axisLine: { lineStyle: { color: withAlpha(neutralColor, 0.30) } },
      axisName: { color: primaryTextColor, fontSize: 12 }
    },
    series: [{
      type: 'radar',
      symbol: 'circle',
      symbolSize: 5,
      lineStyle: { color: neutralColor, width: 2 },
      itemStyle: { color: neutralColor, borderColor: '#fff', borderWidth: 1 },
      areaStyle: { color: withAlpha(neutralColor, 0.20) },
      data: [{
        value: secciones.map(s => s.tscore),
        name: 'Puntaje'
      }]
    }]
  };

  const MAIN_CARD_HEIGHT = "h-[280px]";
const MAIN_CARD_WIDTH_PROMEDIO = "w-80";
const MAIN_CARD_WIDTH_INDEX = "w-60";  // más angosta
const MAIN_CARD_WIDTH_RADAR = "w-80";

// Tamaños compactos para el cluster 2x2 y radar
const CLUSTER_CARD_HEIGHT = 220;                 // altura individual (px)
const CLUSTER_CARD_H_CLASS = `h-[${CLUSTER_CARD_HEIGHT}px]`;
const CLUSTER_GRID_WIDTH = "w-[32rem]";          // ancho del bloque 2x2
const RING_MAX_SIZE = 110;                       // diámetro máx ring
const GAUGE_MAX_SIZE = 90;                       // ancho máx semigauge
const GAUGE_HEIGHT_PROP = 70;                    // prop height del SemiGauge
// Altura radar = 2 * cardHeight + gap(16px)
const RADAR_HEIGHT = `h-[${CLUSTER_CARD_HEIGHT * 2 + 16}px]`; // 456px

  // --- Título dinámico para el layout ---
  const tabLabelMap = {
    resumen: 'Resumen',
    planificacion: 'Planificación',
    memoria: 'Memoria de Trabajo',
    flexibilidad: 'Flexibilidad Cognitiva'
  };

  const dynamicTitle = section === 'EEG'
    ? 'EEG'
    : section === 'Nesplora Ice Cream'
      ? (tabLabelMap[tab] || 'Dashboard')
      : 'Dashboard';

  return (
    <PageLayout
      title={dynamicTitle}
      titleAddon={activeIndex === 1 && planificacion ? (
        <div className="ml-2">
          {/* CardPunt reutilizado para mostrar tscore de Planificación */}
          <div className="scale-90 origin-left">
            <Card className="p-2 px-3 rounded-sm shadow-sm border border-border/60 bg-white/80 dark:bg-zinc-800/60 flex flex-row items-center gap-3">
              <span className="text-[11px] font-semibold text-secondary-text tracking-wide">Punt. T</span>
              <span className="text-sm font-bold text-primary-text">{planificacion.tscore}</span>
              <Badge className="text-[9px] px-2 py-0" style={buildNivelBadgeStyle(planificacion)}>
                {planificacion.nivel}
              </Badge>
            </Card>
          </div>
        </div>
      ) : null}
      headerAction={{
        center: (
          <SearchBar
            useCombobox={true}
            workers={workers}
            onBuscar={setTextoBusqueda}
            onSeleccionar={(w) => setSelectedWorker(w)}
          />
        ),
        right: selectedWorker && (
          <div className="text-xs text-primary-text text-right">
            <p className="font-semibold">{selectedWorker.nombre}</p>
            {selectedWorker.fecha && (
              <p className="text-secondary-text">{selectedWorker.fecha}</p>
            )}
          </div>
        ),
      }}
    >
      {section === "Nesplora Ice Cream" && (
        <div>
          {loading && (
            <div className="text-center py-6 text-sm text-secondary-text">
              Cargando datos...
            </div>
          )}

          {!loading && activeIndex === 0 && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3 md:auto-rows-[160px]">
                {/* Promedio */}
                <Card className="relative flex flex-col p-0 overflow-hidden shadow-sm border-0 h-full">
                  <div className="absolute inset-0 rounded-sm pointer-events-none" style={buildHalo(neutralColor)} />
                  <div className="flex flex-col flex-1 rounded-sm bg-gradient-to-br from-white to-white/90 dark:from-zinc-900 dark:to-zinc-900/80">
                    {/* Header compacto */}
                    <div className="flex items-start justify-between px-2 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-sm flex items-center justify-center text-[12px] font-bold shadow-sm bg-primary/80">
                          {Icons.average}
                        </span>
                        <h3 className="text-[11px] text-primary-text font-semibold leading-snug">
                          Promedio global normalizado
                        </h3>
                      </div>
                      <Badge
                        className="h-4.5 px-2 py-0 text-[9px] font-medium rounded-full border"
                        style={{ background: statusBg, color: statusColor, borderColor: statusBorder }}
                      >
                        {estadoGeneral.toUpperCase()}
                      </Badge>
                    </div>
                    {/* Ring más grande, menos padding */}
                    <div className="flex-1 flex items-center justify-center px-1 pb-1">
                      <div className="w-[120px] h-[120px] relative">
                        <ReactECharts option={resumenRingOption} style={{ width: "100%", height: "100%" }} />
                        <div
                          className="absolute inset-0 rounded-full"
                          style={{ background: `radial-gradient(circle at 50% 50%, ${withAlpha(neutralColor,0.22)} 0%, transparent 72%)` }}
                        />
                      </div>
                    </div>
                  </div>
                </Card>
                {/* Índice 0 */}
                {secciones[0] && (
                  <Card className="relative flex flex-col p-0 overflow-hidden shadow-sm border-0 h-full" title={secciones[0].miniDesc}>
                    <div className="absolute inset-0 rounded-sm pointer-events-none" style={buildHalo(secciones[0].color)} />
                    <div className="flex flex-col flex-1 rounded-sm bg-gradient-to-br from-white to-white/90 dark:from-zinc-900 dark:to-zinc-900/80">
                      <div className="flex items-start justify-between px-2.5 pt-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 p-1 rounded-sm flex items-center justify-center text-[12px] font-bold shadow-sm bg-primary/80">
                            {Icons[secciones[0].icon]}
                          </span>
                          <h3 className="text-[11px] font-semibold text-primary-text leading-snug truncate">
                            {secciones[0].title}
                          </h3>
                        </div>
                        <Badge className="h-4.5 px-2 py-0 text-[9px] font-medium rounded-full border" style={buildNivelBadgeStyle(secciones[0])}>
                          {secciones[0].nivel}
                        </Badge>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center px-2.5 pb-2">
                        <SemiGauge
                          value={secciones[0].tscore}
                          color={secciones[0].color}
                          background={secciones[0].background}
                          min={20}
                          max={80}
                          height={50}
                        />
                      </div>
                    </div>
                  </Card>
                )}

                {/* Radar (row-span-2) */}
                <Card className="relative flex flex-col p-0 overflow-hidden shadow-sm border-0 row-span-2 h-full">
                  <div className="absolute inset-0 rounded-sm pointer-events-none" style={buildHalo(neutralColor)} />
                  <div className="flex flex-col flex-1 rounded-sm bg-gradient-to-br from-white to-white/90 dark:from-zinc-900 dark:to-zinc-900/80">
                    <div className="flex items-start px-4 pt-2 gap-2">
                      <span className="w-6 h-6 rounded-sm flex items-center justify-center text-[12px] font-bold shadow-sm bg-primary/80 text-primary-bg">
                        {Icons.radar || "R"}
                      </span>
                      <h3 className="text-[11px] text-primary-text font-semibold leading-snug">
                        Distribución por índice
                      </h3>
                    </div>
                    <div className="flex-1 flex items-center justify-center px-3 pb-3">
                      <ReactECharts
                        option={{
                          ...radarOption,
                          radar: { ...radarOption.radar, center: ["50%", "50%"], radius: "68%" }
                        }}
                        style={{ width: "100%", height: "100%" }}
                      />
                    </div>
                  </div>
                </Card>

                {/* Índice 1 */}
                {secciones[1] && (
                  <Card className="relative flex flex-col p-0 overflow-hidden shadow-sm border-0 h-full" title={secciones[1].miniDesc}>
                    <div className="absolute inset-0 rounded-sm pointer-events-none" style={buildHalo(secciones[1].color)} />
                    <div className="flex flex-col flex-1 rounded-sm bg-gradient-to-br from-white to-white/90 dark:from-zinc-900 dark:to-zinc-900/80">
                      <div className="flex items-start justify-between px-2.5 pt-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 p-1 rounded-sm flex items-center justify-center text-[12px] font-bold shadow-sm bg-primary/80">
                            {Icons[secciones[1].icon]}
                          </span>
                          <h3 className="text-[11px] font-semibold text-primary-text leading-snug truncate">
                            {secciones[1].title}
                          </h3>
                        </div>
                        <Badge className="h-4.5 px-2 py-0 text-[9px] font-medium rounded-full border" style={buildNivelBadgeStyle(secciones[1])}>
                          {secciones[1].nivel}
                        </Badge>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center px-2.5 pb-2">
                        <SemiGauge
                          value={secciones[1].tscore}
                          color={secciones[1].color}
                          background={secciones[1].background}
                          min={20}
                          max={80}
                          height={50}
                        />
                      </div>
                    </div>
                  </Card>
                )}

                {/* Índice 2 */}
                {secciones[2] && (
                  <Card className="relative flex flex-col p-0 overflow-hidden shadow-sm border-0 h-full" title={secciones[2].miniDesc}>
                    <div className="absolute inset-0 rounded-sm pointer-events-none" style={buildHalo(secciones[2].color)} />
                    <div className="flex flex-col flex-1 rounded-sm bg-gradient-to-br from-white to-white/90 dark:from-zinc-900 dark:to-zinc-900/80">
                      <div className="flex items-start justify-between px-2.5 pt-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 p-1 rounded-sm flex items-center justify-center text-[12px] font-bold shadow-sm bg-primary/80">
                            {Icons[secciones[2].icon]}
                          </span>
                          <h3 className="text-[11px] font-semibold text-primary-text leading-snug truncate">
                            {secciones[2].title}
                          </h3>
                        </div>
                        <Badge className="h-4.5 px-2 py-0 text-[9px] font-medium rounded-full border" style={buildNivelBadgeStyle(secciones[2])}>
                          {secciones[2].nivel}
                        </Badge>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center px-2.5 pb-2">
                        <SemiGauge
                          value={secciones[2].tscore}
                          color={secciones[2].color}
                          background={secciones[2].background}
                          min={20}
                          max={80}
                          height={50}
                        />
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Subíndices */}
              <div className="grid gap-4 md:grid-cols-3">
                {secciones.map((sec) => (
                  <Card key={sec.id} className="relative p-0 border-0 shadow-sm overflow-hidden h-full">
                    <div className="absolute inset-0 rounded-sm pointer-events-none" style={buildHalo(sec.color)} />
                    <div className="rounded-sm bg-gradient-to-br from-white to-white/95 dark:from-zinc-900 dark:to-zinc-900/80 p-4 h-full flex flex-col">
                      <CardHeader className="p-0 mb-3 flex flex-row items-center justify-between">
                        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary-text">
                          <span className="w-6 h-6 p-1 rounded-sm flex items-center justify-center text-[13px] font-bold shadow-sm bg-primary/80">
                            {Icons[sec.icon]}
                          </span>
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

          {!loading && activeIndex === 1 && (
            <PlanificationView section={planificacion} getColorSet={getColorSet} />
          )}
          {!loading && activeIndex === 2 && (
            <WorkingMemoryView section={memoriaTrabajo} getColorSet={getColorSet} />
          )}
          {!loading && activeIndex === 3 && (
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
