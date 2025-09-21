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
      startAngle: 180,
      endAngle: -180,
      clockwise: false,
      min: 0,
      max: 100,
      radius: '80%',
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

  return (
    <PageLayout
      title="Dashboard"
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
        <>
          {loading && (
            <div className="text-center py-6 text-sm text-secondary-text">
              Cargando datos...
            </div>
          )}

          {!loading && activeIndex === 0 && (
            <div className="space-y-6">
              {/* Fila 1: índices principales (2/3) + radar (1/3) */}
              <div className="grid lg:grid-cols-3 gap-4">
                {/* Columna izquierda */}
                <div className="grid grid-cols-2 gap-3 lg:col-span-2">
                  {/* Resumen */}
                  <Card className="relative flex flex-col h-full p-0 overflow-hidden shadow-sm border-0">
                    <div className="absolute inset-0 rounded-sm pointer-events-none" style={buildHalo(neutralColor)} />
                    <div className="flex flex-col flex-1 rounded-sm bg-gradient-to-br from-white to-white/90 dark:from-zinc-900 dark:to-zinc-900/80">
                      <div className="flex items-start justify-between px-4 pt-4">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-7 h-7 rounded-sm flex items-center justify-center text-[13px] font-bold shadow-sm bg-primary/80"
                          >
                            {Icons.average}
                          </span>
                          <h3 className="text-sm text-primary-text font-semibold tracking-tight">Promedio global normalizado</h3>
                        </div>
                        <Badge
                          className="h-5 px-2 py-0 text-[10px] font-medium rounded-full border"
                          style={{
                            background: statusBg,
                            color: statusColor,
                            borderColor: statusBorder
                          }}
                        >
                          {estadoGeneral.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-4">
                        {/* Progress Ring ECharts */}
                        <div className="w-full max-w-[120px] aspect-square relative"> {/* antes 160px */}
                          <ReactECharts
                            option={resumenRingOption}
                            style={{ width: '100%', height: '100%' }}
                          />
                          {/* Fondo sutil detrás */}
                          <div
                            className="absolute inset-0 rounded-full"
                            style={{
                              background: `radial-gradient(circle at 50% 50%, ${withAlpha(neutralColor,0.22)} 0%, transparent 70%)`
                            }}
                          />
                          {/* Glow reducido */}
                          <div
                            className="absolute inset-0 rounded-full blur-lg opacity-30 pointer-events-none"
                            style={{
                              background: `radial-gradient(circle at 50% 55%, ${withAlpha(neutralColor,0.65)} 0%, transparent 65%)`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Índices principales */}
                  {secciones.map((sec) => {
                    const ring = sec.color.replace('rgb', 'rgba').replace(')', ',.35)');
                    return (
                      <Card
                        key={sec.id}
                        className="relative flex flex-col h-full p-0 overflow-hidden shadow-sm border-0"
                        title={sec.miniDesc}
                      >
                        <div className="absolute inset-0 rounded-sm pointer-events-none" style={buildHalo(sec.color)} />
                        <div className="flex flex-col flex-1 rounded-sm bg-gradient-to-br from-white to-white/90 dark:from-zinc-900 dark:to-zinc-900/80">
                          <div className="flex items-start justify-between px-4 pt-4">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-7 h-7 p-1 rounded-sm flex items-center justify-center text-[13px] font-bold shadow-sm bg-primary/80"
                              >
                                {Icons[sec.icon]}
                              </span>
                              <div className="flex flex-col leading-tight">
                                <h3 className="text-sm font-semibold text-primary-text">{sec.title}</h3>
                              </div>
                            </div>
                            <Badge
                              className="h-5 px-2 py-0 text-[10px] font-medium rounded-full border"
                              style={buildNivelBadgeStyle(sec)}
                            >
                              {sec.nivel}
                            </Badge>
                          </div>
                          <div className="flex-1 flex flex-col items-center justify-center px-4 pb-4">
                            <SemiGauge
                              value={sec.tscore}
                              color={sec.color}
                              background={sec.background}
                              min={20}
                              max={80}
                              height={80}
                            />
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Columna derecha: Radar */}
                <Card className="relative p-0 shadow-sm border-0 overflow-hidden h-full">
                  <div className="absolute inset-0 rounded-sm pointer-events-none" style={buildHalo(neutralColor)} />
                  <div className="rounded-sm bg-gradient-to-br from-white to-white/90 dark:from-zinc-900 dark:to-zinc-900/80 p-4 flex items-center justify-center h-full">
                    <ReactECharts
                      option={{
                        ...radarOption,
                        radar: {
                          ...radarOption.radar,
                          center: ['50%', '50%'],
                          radius: '70%'
                        }
                        // No necesitas sobrescribir series; ya usan neutralColor
                      }}
                      style={{ height: 260, width: '100%' }}
                    />
                  </div>
                </Card>
              </div>

              {/* Fila 2: subíndices */}
              <div className="grid gap-4 md:grid-cols-3">
                {secciones.map((sec) => {
                  const ring = sec.color.replace('rgb', 'rgba').replace(')', ',.35)');
                  return (
                    <Card
                      key={sec.id}
                      className="relative p-0 border-0 shadow-sm overflow-hidden h-full"
                    >
                      <div className="absolute inset-0 rounded-sm pointer-events-none" style={buildHalo(sec.color)} />
                      <div className="rounded-sm bg-gradient-to-br from-white to-white/95 dark:from-zinc-900 dark:to-zinc-900/80 p-4 h-full flex flex-col">
                        <CardHeader className="p-0 mb-3 flex flex-row items-center justify-between">
                          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary-text">
                            <span
                              className="w-6 h-6 p-1 rounded-sm flex items-center justify-center text-[13px] font-bold shadow-sm bg-primary/80"
                            >
                              {Icons[sec.icon]}
                            </span>
                            {sec.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 flex-1">
                          <div className="grid grid-cols-2 gap-3">
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
                  );
                })}
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
        </>
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
