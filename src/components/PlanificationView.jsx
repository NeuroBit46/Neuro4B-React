import { useState } from "react";
import { Icons } from "../constants/Icons";
import { FiltroSwitch } from "./BarGroupChart";
import ScoreRangesCard from "./ScoreRangesCard";
import SemiGauge from "./SemiGauge";
import DualYAxisChart from "./Dual";
import BarGroupChartECharts from "./BarChart";
import { getNivelKey, getNivelLabel } from "../pages/Dashboard";
import RawSummaryCards from "./RawSummaryCards";
import LearningCurveChart from "./LearningCurveChart";
import CardPunt from "./CardPunt";
import GroupedMetricsCard from "./GroupedMetricsCard";
import IndicatorCard from "./IndicatorCard";
import { Card } from "./ui/card";

export default function PlanificationView({ section, getColorSet }) {
  const {
    title,
    tscore,
    metrics,
    miniDesc,
    icon,
    nivel,
  } = section;

  const categorias = ["PD", "PT", "PC"]; // PD reemplaza a PuntajeDuro en nueva estructura
  const grupos = ["P1", "P2", "Total"];
  // Nueva estructura sin filtros, organizada por tipo principal (Aciertos, Tiempo)
  // Cada tipo contiene P1, P2 y Total con sub-métricas PD (PuntajeDuro), PT y PC
  const planificacionData = {
    Aciertos: {
      P1: { PD: 2, PT: 39, PC: 14 },
      P2: { PD: 2, PT: 41, PC: 18 },
      Total: { PD: 4, PT: 40, PC: 16 }
    },
    Tiempo: {
      P1: { PD: 39.9, PT: 47, PC: 39 },
      P2: { PD: 28.2, PT: 50, PC: 49 },
      Total: { PD: 68.2, PT: 48, PC: 44 }
    }
  };

  const datos = [
    { aciertos: 0, tiempo: 5.3 },
    { aciertos: 0, tiempo: 7.2 },
    { aciertos: 0, tiempo: 6.3 },
    { aciertos: 1, tiempo: 5.9 },
    { aciertos: 0, tiempo: 8 },
    { aciertos: 0, tiempo: 4.7 },
    { aciertos: 1, tiempo: 3 },
    { aciertos: 0, tiempo: 5 },
    { aciertos: 0, tiempo: 4.4 },
    { aciertos: 1, tiempo: 3.3 },
    { aciertos: 1, tiempo: 4.8 },
    { aciertos: 0, tiempo: 3.8 },
    { aciertos: 0, tiempo: 2.1 },
    { aciertos: 0, tiempo: 4.8 }
  ];

    // Ahora derive nivelKey y label de tscore
  const nivelKey = getNivelKey(tscore);
  const nivelLabel = getNivelLabel(nivelKey);
  const { color, background } = getColorSet(nivelKey);

  // Para los valores de VisualGroup
  const getNivelFromValue = (value) => {
    const key = getNivelKey(value);
    return getNivelLabel(key);
  };

  const getColorSetFromValue = (value) => {
    const key = getNivelKey(value);
    return getColorSet(key);
  };

  const resumenRaw = {
    aciertosP1: planificacionData.Aciertos.P1.PD,
    aciertosP2: planificacionData.Aciertos.P2.PD,
    aciertosTotal: planificacionData.Aciertos.Total.PD,
    tiempoP1: planificacionData.Tiempo.P1.PD,
    tiempoP2: planificacionData.Tiempo.P2.PD,
    tiempoTotal: planificacionData.Tiempo.Total.PD,
  };

  const aciertosPorRonda = [1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1];
  const aciertosAcumulados = aciertosPorRonda.map((valor, idx) =>
    aciertosPorRonda.slice(0, idx + 1).reduce((a, b) => a + b, 0)
  );

  const tiempoPorRonda = [8.3, 8.5, 8, 6.8, 5.1, 6.1, 6.6, 6.1, 6.2, 7.6, 6.3, 5.7, 9.9, 7];
  const eficienciaPorRonda = aciertosPorRonda.map((a, i) =>
    tiempoPorRonda[i] > 0 ? a / tiempoPorRonda[i] : 0
  );

  // Builder para un solo grupo reutilizable
  const buildGroup = (tipo) => {
    const data = planificacionData[tipo];
    return {
      title: tipo,
      columnHeaders: grupos,
      rows: categorias.map(cat => ({
        label: cat,
        values: grupos.map(grp => data[grp][cat])
      }))
    };
  };

  return (
  <div className="planif-vars planif-scale-110 flex flex-col items-center" style={{ rowGap: 'var(--planif-gap-4)' }}>
      <div className="flex items-center justify-evenly">
      </div>
  {/* Grid principal: sustituye gap-x-10 por variable */}
  <div className="grid grid-cols-[1fr_auto] items-start" style={{ columnGap: 'var(--planif-gap-x-main)' }}>
        <div className="flex flex-col w-full" style={{ rowGap: 'var(--planif-gap-6)' }}>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--planif-gap-6)' }}>
            <div className="flex flex-col" style={{ rowGap: 'var(--planif-gap-3)' }}>
              <CardPunt title="Aciertos Total Punt. T" punt={ planificacionData.Aciertos.P1.PT } />
              <GroupedMetricsCard
                group={buildGroup('Aciertos')}
                panelClassName="bg-gradient-to-br from-white/70 to-white/50 dark:from-zinc-900/70 dark:to-zinc-900/50"
              />
            </div>
            <div className="flex flex-col" style={{ rowGap: 'var(--planif-gap-3)' }}>
              <CardPunt title="Tiempo Total Punt. T" punt={ planificacionData.Tiempo.P1.PT } />
              <GroupedMetricsCard
                group={buildGroup('Tiempo')}
                panelClassName="bg-gradient-to-br from-white/70 to-white/50 dark:from-zinc-900/70 dark:to-zinc-900/50"
              />
            </div>
          </div>
        </div>
        {/* Columna central: indicadores */}
        <div className="grid grid-cols-2 max-w-189" style={{ gap: 'var(--planif-gap-5)' }}>
          <IndicatorCard
            icon={Icons.time}
            title="Carga cognitiva"
            description="Los aciertos no han aumentado, es posible que la carga cognitiva afecte al aprendizaje."
          />
          <IndicatorCard
            icon={Icons.aciertos}
            title="Fatigabilidad"
            description="No muestra signos de fatigabilidad."
          />
          <IndicatorCard
            icon={Icons.time}
            title="Planificación proceual y memoria prospectiva"
            description="La planificación proceual se ha aprendido y la memoria prospectiva es adecuada."
          />
        </div>
      </div>
      <div className="flex items-center" style={{ columnGap: 'var(--planif-space-x-bottom)' }}>
  <Card className="flex-row items-center justify-around planif-card-pad">
          <div className="flex flex-col items-center" style={{ rowGap: 'var(--planif-gap-4)' }}>
            <RawSummaryCards
              totals={resumenRaw}
            />
          </div>
          <DualYAxisChart data={datos} />
        </Card>
        <Card className="planif-card-pad">
          <LearningCurveChart
            xLabels={['R1','R2','R3','R4','R5','R6','R7','R8','R9','R10','R11','R12','R13','R14']}
            seriesData={{
              Rendimiento: aciertosAcumulados, // <- ya calculada por ti (p. ej., con aciertos acumulados)
            }}
            aciertosPorRonda={aciertosPorRonda}
            tiempoPorRonda={tiempoPorRonda}
            yNameAbsolute="Rendimiento"
            yMinAbsolute={0}
            yMaxAbsolute={10}
            smooth
          />
        </Card>
      </div>
    </div>
  );
}
