import { Icons } from "../constants/Icons";
import GroupedMetricsCard from "./GroupedMetricsCard";
import CardPunt from "./CardPunt";
import IndicatorCard from "./IndicatorCard";
import ScoreRangeBar from "./ScoreRangeBar";
import { Card } from "./ui/card";

export default function FlexibilityCognitiveView({ section, getColorSet, titleAddon }) {
  const { data = {}, raw } = section || {};
  const sw = data?.switching || {};
  const interferencia = data?.interferencia || {};
  const perseveraciones = data?.perseveraciones || {};
  const tiempoServicios = data?.tiempoServicios || {};

  const triad = (obj = {}) => ({
    PD: obj?.PD ?? null,
    PT: obj?.PT ?? null,
    PC: obj?.PC ?? null,
  });

  // Métricas dinámicas
  const datos = {
    "Switching": triad(sw),
    "Switching aciertos": triad(sw?.aciertos),
    "Switching tiempo": triad(sw?.tiempo),
    "Interferencia": triad(interferencia),
    "Perseveraciones": triad(perseveraciones),
    "Tiempo de servicio": triad(tiempoServicios),
  };

  const metricNames = [
    "Switching",
    "Switching aciertos",
    "Switching tiempo",
    "Interferencia",
    "Perseveraciones",
    "Tiempo de servicio",
  ];

  // GroupedMetricsCard
  const buildGroup = (metricName) => {
    const d = datos[metricName] || {};
    const toCell = (v) => (v === null || v === undefined || v === "" ? "—" : v);
    return {
      title: metricName,
      columnHeaders: ["Valor"],
      rows: ["PD", "PT", "PC"].map((label) => ({
        label,
        values: [toCell(d[label])],
      })),
    };
  };

  // Indicadores dinámicos desde el row normalizado
  const normalize = (s) =>
    String(s || "")
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .toLowerCase().replace(/\s+/g, " ").trim();
  const dict = raw?.dict || {};
  const get = (keys, def = null) => {
    for (const k of keys) {
      const nk = normalize(k);
      if (nk in dict && dict[nk] !== "" && dict[nk] != null) return dict[nk];
    }
    return def;
  };
  const asNum = (v, def = null) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : def;
  };

  const monEjecP1 = asNum(get(["Monitorizacion Ejecución P1", "Monitorizacion Ejecucion P1", "Monitorizacion Ejecución  P1"]), null);
  const monEjecP2 = asNum(get(["Monitorizacion Ejecución P2", "Monitorizacion Ejecucion P2"]), null);
  const monTiempo = asNum(get(["Monitorizacion Tiempo"]), null);

  const consMem = asNum(get(["Consultas Tarea Memoria Trabajo"]), null);
  const consPlan = asNum(get(["Consultas Tarea Planificacion", "Consultas Tarea Planificaicon"]), null);

  const medianaTarea = asNum(get(["Mediana Tarea", "Mediana Tarea "]), null);
  const medianaPlan = asNum(get(["Mediana Planificacion", "Mediana Planificacion "]), null);

  const fmt = (v) => (v === null || v === undefined ? "—" : String(v));

  const monitDesc = `Ejecución: Parte 1: ${fmt(monEjecP1)}. Parte 2: ${fmt(monEjecP2)}.`;
  const tiempoDesc =
    monTiempo === null
      ? "No hay datos de uso de referencia de tiempo."
      : monTiempo > 0
      ? `Usó la referencia de tiempo ${monTiempo} veces.`
      : "No usó la referencia de tiempo.";
  const consMemDesc = `Consultas en Memoria de Trabajo: ${fmt(consMem)}.`;
  const consPlanDesc = `Consultas en Planificación: ${fmt(consPlan)}.`;
  const medianaDesc = `Medianas de consultas — Aprendizaje: ${fmt(medianaTarea)} · Planificación: ${fmt(medianaPlan)}.`;

  return (
    <div className="planif-vars flex flex-col w-full mx-auto px-2 sm:px-4 space-y-5" style={{ rowGap: 'var(--planif-gap-5rem)', maxWidth: '1400px' }}>
      <Card className="px-4 flex flex-row gap-10 py-2 border-0 shadow-sm">
        {titleAddon}
        <ScoreRangeBar />
      </Card>
      {/* Grid 6 tarjetas: 2 filas x 3 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 w-full" style={{ gap: 'var(--planif-gap-6,1.5rem)' }}>
        {metricNames.map((name) => (
          <div key={name} className="flex flex-col h-full" style={{ rowGap: 'var(--planif-gap-3,0.75rem)' }}>
            <CardPunt label={name} punt={datos[name]?.PT ?? "—"} />
            <GroupedMetricsCard
              group={buildGroup(name)}
              panelClassName="bg-gradient-to-br from-white/70 to-white/50 dark:from-zinc-900/70 dark:to-zinc-900/50 h-full"
            />
          </div>
        ))}
      </div>

      {/* Indicadores dinámicos */}
      <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-4" style={{ gap: 'var(--planif-gap-5)' }}>
        <IndicatorCard
          icon={Icons.monitEjec}
          title="Monitorización de ejecución"
          description={monitDesc}
        />
        <IndicatorCard
          icon={Icons.monitTiempo}
          title="Monitorización de tiempo"
          description={tiempoDesc}
        />
        <IndicatorCard
          icon={Icons.estiloCogn}
          title="Estilo cognitivo"
          description={medianaDesc}
        />
        <IndicatorCard
          icon={Icons.helpMemo}
          title="Consultas en la tarea de memoria de trabajo"
          description={consMemDesc}
        />
        <IndicatorCard
          icon={Icons.helpPlan}
          title="Consultas en la tarea de planificación"
          description={consPlanDesc}
        />
        <IndicatorCard
          icon={Icons.mediana}
          title="Mediana de consultas"
          description={medianaDesc}
        />
      </div>
    </div>
  );
}