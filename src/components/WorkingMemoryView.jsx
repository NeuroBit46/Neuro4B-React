import DualYAxisChart from "./Dual";
import RawSummaryCards from "./RawSummaryCards";
import LearningCurveChart from "./LearningCurveChart";
import CardPunt from "./CardPunt";
import GroupedMetricsCard from "./GroupedMetricsCard";
import { Card } from "./ui/card";

export default function WorkingMemoryView({ section, getColorSet }) {
  const {
    title,
    tscore,
    metrics,
    miniDesc,
    icon,
    nivel,
    color,
    background
  } = section;

  const filtros = ["Servicios correctos", "Consultas", "Aciertos netos", "Tiempo de servicio"]; // orden preferido
  const grupos = ["P1", "P2", "Total"];
  const categorias = ["PD", "PT", "PC"]; // PD = PuntajeDuro
  const datosPorFiltro = {
    "Servicios correctos": {
      P1: { PuntajeDuro: 27, PT: 48, PC: 43 },
      P2: { PuntajeDuro: 28, PT: 65, PC: 94 },
      Total: { PuntajeDuro: 55, PT: 62, PC: 90 }
    },
    "Consultas": {
      P1: { PuntajeDuro: 19, PT: 31, PC: 3 },
      P2: { PuntajeDuro: 27, PT: 29, PC: 2 },
      Total: { PuntajeDuro: 46, PT: 29, PC: 2 }
    },
    "Aciertos netos": {
      P1: { PuntajeDuro: 9, PT: 32, PC: 4 },
      P2: { PuntajeDuro: 1, PT: 27, PC: 1 },
      Total: { PuntajeDuro: 10, PT: 31, PC: 3 }
    },
    "Tiempo de servicio": {
      P1: { PuntajeDuro: 393.4, PT: 31, PC: 4 },
      P2: { PuntajeDuro: 434.1, PT: 33, PC: 5 },
      Total: { PuntajeDuro: 827.5, PT: 32, PC: 4 }
    },
  };

  const datos = [
    { aciertos: 0, tiempo: 68.2 },
    { aciertos: 1, tiempo: 66.2 },
    { aciertos: 1, tiempo: 56.6 },
    { aciertos: 2, tiempo: 56 },
    { aciertos: 0, tiempo: 70.7 },
    { aciertos: 3, tiempo: 31 },
    { aciertos: 2, tiempo: 44.7 },
    { aciertos: 0, tiempo: 63.7 },
    { aciertos: 0, tiempo: 61.8 },
    { aciertos: 0, tiempo: 63.1 },
    { aciertos: 1, tiempo: 57.5 },
    { aciertos: 0, tiempo: 62.9 },
    { aciertos: 0, tiempo: 63.4 },
    { aciertos: 0, tiempo: 61.8 },
  ];

  const getNivelFromValue = (value) => {
    if (value >= 20 && value <= 30) return "MUY BAJO";
    if (value >= 31 && value <= 40) return "BAJO";
    if (value >= 41 && value <= 59) return "MEDIO";
    if (value >= 60 && value <= 69) return "ALTO";
    if (value >= 70 && value <= 80) return "MUY ALTO";
    return "DESCONOCIDO";
  };

  const getColorSetFromValue = (value) => {
    const nivel = getNivelFromValue(value);
    return getColorSet(nivel);
  };

  const resumenRaw = {
    aciertosP1: datosPorFiltro["Aciertos netos"].P1.PuntajeDuro,
    aciertosP2: datosPorFiltro["Aciertos netos"].P2.PuntajeDuro,
    aciertosTotal: datosPorFiltro["Aciertos netos"].Total.PuntajeDuro,
    tiempoP1: datosPorFiltro["Tiempo de servicio"].P1.PuntajeDuro,
    tiempoP2: datosPorFiltro["Tiempo de servicio"].P2.PuntajeDuro,
    tiempoTotal: datosPorFiltro["Tiempo de servicio"].Total.PuntajeDuro,
  };

  const aciertosPorRonda = [0, 1, 1, 2, 0, 3, 2, 0, 0, 0, 1, 0, 0, 0];
  const aciertosAcumulados = aciertosPorRonda.map((valor, idx) =>
    aciertosPorRonda.slice(0, idx + 1).reduce((a, b) => a + b, 0)
  );

  const tiempoPorRonda = [68.2, 66.2, 56.6, 56, 70.7, 31, 44.7, 63.7, 61.8, 63.1, 57.5, 62.9, 63.4, 61.8];
  const eficienciaPorRonda = aciertosPorRonda.map((a, i) =>
    tiempoPorRonda[i] > 0 ? a / tiempoPorRonda[i] : 0
  );

  const buildGroup = (filtro) => {
    const data = datosPorFiltro[filtro];
    return {
      title: filtro,
      columnHeaders: grupos,
      rows: categorias.map(cat => ({
        label: cat,
        values: grupos.map(grp => {
          const row = data[grp];
          if (!row) return '-';
          if (cat === 'PD') return row.PuntajeDuro;
          return row[cat];
        })
      }))
    };
  };

  return (
  <div className="planif-vars flex flex-col w-full mx-auto px-2 sm:px-4" style={{ rowGap: 'var(--planif-gap-5)', maxWidth: '1400px' }}>
      {/* Grid superior de métricas (similar a Planification): 4 bloques responsivos */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 w-full" style={{ gap: 'var(--planif-gap-6)' }}>
        {filtros.map((filtro) => (
          <div key={filtro} className="flex flex-col h-full" style={{ rowGap: 'var(--planif-gap-3)' }}>
            <CardPunt label={filtro} punt={datosPorFiltro[filtro].Total.PT} />
            <GroupedMetricsCard
              group={buildGroup(filtro)}
              panelClassName="bg-gradient-to-br from-white/70 to-white/50 dark:from-zinc-900/70 dark:to-zinc-900/50 h-full"
            />
          </div>
        ))}
      </div>
      {/* Sección inferior alineada al layout de Planificación: grid 12 (7/5) */}
      <div className="grid grid-cols-12 w-full items-stretch" style={{ gap: 'var(--planif-gap-x-main)' }}>
        <Card className="col-span-12 xl:col-span-6 planif-card-pad flex flex-col lg:items-center lg:flex-row w-full" style={{ gap: 'var(--planif-gap-6)' }}>
          {/* <div className="flex flex-row lg:flex-col justify-between lg:justify-start w-full lg:w-auto" style={{ gap: 'var(--planif-gap-4)' }}>
            <RawSummaryCards totals={resumenRaw} />
          </div> */}
          <div className="flex-1 min-h-[300px]">
            <DualYAxisChart data={datos} className="h-[320px]" height={320} aciertosScaleMode="zeroToFour" />
          </div>
        </Card>
  <Card className="col-span-12 xl:col-span-6 planif-card-pad w-full flex flex-col" style={{ gap: 'var(--planif-gap-4)' }}>
          <LearningCurveChart
            xLabels={['R1','R2','R3','R4','R5','R6','R7','R8','R9','R10','R11','R12','R13','R14']}
            seriesData={{
              'Rendimiento': aciertosAcumulados,
            }}
            aciertosPorRonda={aciertosPorRonda}
            tiempoPorRonda={tiempoPorRonda}
            yNameAbsolute="Rendimiento"
            yMinAbsolute={0}
            yMaxAbsolute={10}
            smooth
            className="w-full"
            height={320}
          />
        </Card>
      </div>
    </div>
  );
}

