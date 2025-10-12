import { useSearchParams } from "react-router-dom";
import { useState } from "react";
import PageLayout from "../components/PageLayout";
import PlanificationView from "../components/PlanificationView";
import WorkingMemoryView from "../components/WorkingMemoryView";
import FlexibilityCognitiveView from "../components/FlexibilityCognitiveView";
import { Icons } from "../constants/Icons";
import MetricBar from "../components/MetricBar";
import SearchBar from "../components/SearchBar";
import useWorkers from "../components/UseWorkers";
import EEGDashboard from "../components/EEGDashboard";

// Determina la clave de nivel según el puntaje T
export function getNivelKey(tscore) {
  if (tscore >= 70 && tscore <= 80) return "MuyAlto";
  if (tscore >= 60 && tscore <= 69) return "Alto";
  if (tscore >= 41 && tscore <= 59) return "Medio";
  if (tscore >= 31 && tscore <= 40) return "Bajo";
  return "MuyBajo";
}

// Etiqueta de texto para mostrar
export function getNivelLabel(key) {
  return {
    MuyAlto: "MUY ALTO",
    Alto: "ALTO",
    Medio: "MEDIO",
    Bajo: "BAJO",
    MuyBajo: "MUY BAJO",
  }[key];
}

// Resuelve color y background según clave de nivel
export function getColorSet(key) {
  const varName = {
    MuyAlto: "var(--color-very-high)",
    Alto: "var(--color-high)",
    Medio: "var(--color-primary)",
    Bajo: "var(--color-low)",
    MuyBajo: "var(--color-secondary)",
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

// Datos estáticos de un solo trabajador
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
    return {
      ...sec,
      nivel: label,
      color,
      background,
    };
  });

  const switching = {
    ...sections.find((s) => s.id === "flexibilidad"),
    id: "switching",
    title: "Switching",
    miniDesc: "Cambio de set cognitivo",
  };

  return {
    secciones: sections,
    planificacion: sections.find((s) => s.id === "planificacion"),
    memoriaTrabajo: sections.find((s) => s.id === "memoria"),
    flexibilidad: sections.find((s) => s.id === "flexibilidad"),
    switching,
    loading: false,
  };
}

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [textoBusqueda, setTextoBusqueda] = useState(""); // ✅ para onBuscar
  const { workers } = useWorkers(); // ✅ obtener trabajadores

  // Tab inferior (Nesplora views)
  const tab = searchParams.get("tab") || "resumen";
  const tabIndexMap = {
    resumen: 0,
    planificacion: 1,
    memoria: 2,
    flexibilidad: 3,
  };
  const activeIndex = tabIndexMap[tab];

  const handleTabChange = (index) => {
    const tabKey = Object.keys(tabIndexMap).find((key) => tabIndexMap[key] === index);
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("tab", tabKey);
      return newParams;
    });
  };

  // Tab superior (Dashboard sections)
  const section = searchParams.get("section") || "Nesplora Ice Cream";
  const handleSectionChange = (newSection) => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("section", newSection);
      return newParams;
    });
  };

  const {
    secciones,
    planificacion,
    memoriaTrabajo,
    flexibilidad,
    loading,
  } = getStaticWorkerData();

  const [selectedWorker, setSelectedWorker] = useState(null);


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
        )
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
          <div className="grid grid-cols-3 mt-6 gap-6">
            {secciones.map(
              ({ id, title, tscore, metrics, icon, miniDesc, nivel, color, background }) => (
                <div key={id} className="bg-white rounded-sm shadow p-4 flex flex-col">
                  <div className="flex items-center gap-2.5">
                    {/* Ícono */}
                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-primary/15 shrink-0">
                      {Icons[icon]}
                    </div>

                    {/* Texto */}
                    <div className="flex-1 max-w-xs">
                      <h3 className="font-semibold text-md text-primary-text">{title}</h3>
                      <p className="text-xs text-secondary-text line-clamp-2">{miniDesc}</p>
                    </div>

                    {/* Nivel y semigauge */}
                    <div className="shrink-0 text-right">
                      <p className="text-center text-xs font-medium" style={{ color }}>
                        {nivel}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-6 mt-6">
                    {metrics.map((metric, index) => (
                      <MetricBar
                        key={index}
                        title={metric.label}
                        value={metric.value}
                        scale={1}
                        getColorSetFromValue={(v) => getColorSet(getNivelKey(v))}
                        getNivelFromValue={(v) => getNivelLabel(getNivelKey(v))}
                      />
                    ))}
                  </div>
                </div>
              )
            )}
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