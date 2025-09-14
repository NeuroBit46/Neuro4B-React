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

export default function PlanificationView({ section, getColorSet }) {
  const {
    title,
    tscore,
    metrics,
    miniDesc,
    icon,
    nivel,
  } = section;

  const categorias = ["PuntajeDuro", "PT", "PC"];
  const grupos = ["P1", "P2", "Total"];
  const filtros = ["Aciertos en planificación", "Tiempo de asignación"];
  const [activeFiltro, setActiveFiltro] = useState(filtros[0]);

  const datosPorFiltro = {
    "Aciertos en planificación": {
      "P1": { PuntajeDuro: 2, PT: 39, PC: 14 },
      "P2": { PuntajeDuro: 2, PT: 41, PC: 18 },
      "Total": { PuntajeDuro: 4, PT: 40, PC: 16 }
    },
    "Tiempo de asignación": {
      "P1": { PuntajeDuro: 39.9, PT: 47, PC: 39 },
      "P2": { PuntajeDuro: 28.2, PT: 50, PC: 49 },
      "Total": { PuntajeDuro: 68.2, PT: 48, PC: 44 }
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
    aciertosP1: datosPorFiltro["Aciertos en planificación"]["P1"].PuntajeDuro,
    aciertosP2: datosPorFiltro["Aciertos en planificación"]["P2"].PuntajeDuro,
    aciertosTotal: datosPorFiltro["Aciertos en planificación"]["Total"].PuntajeDuro,
    tiempoP1: datosPorFiltro["Tiempo de asignación"]["P1"].PuntajeDuro,
    tiempoP2: datosPorFiltro["Tiempo de asignación"]["P2"].PuntajeDuro,
    tiempoTotal: datosPorFiltro["Tiempo de asignación"]["Total"].PuntajeDuro,
  };

  const aciertosPorRonda = [1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1];
  const aciertosAcumulados = aciertosPorRonda.map((valor, idx) =>
    aciertosPorRonda.slice(0, idx + 1).reduce((a, b) => a + b, 0)
  );

  const tiempoPorRonda = [8.3, 8.5, 8, 6.8, 5.1, 6.1, 6.6, 6.1, 6.2, 7.6, 6.3, 5.7, 9.9, 7];
  const eficienciaPorRonda = aciertosPorRonda.map((a, i) =>
    tiempoPorRonda[i] > 0 ? a / tiempoPorRonda[i] : 0
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2">
            <span className="text-primary-text">{Icons[icon]}</span>
            <h1 className="text-sm text-primary-text font-medium">{title}</h1>
          </div>
          <p className="text-xs text-secondary-text">{miniDesc}</p>
        </div>
      </div>

      <div className="grid grid-cols-[0.2fr_1fr_0.2fr] place-items-center">
        <div className="space-y-2 rounded-sm pt-2">
          <FiltroSwitch
            filtros={filtros}
            active={activeFiltro}
            onChange={setActiveFiltro}
          />
          <BarGroupChartECharts
            activeFiltro={activeFiltro}
            grupos={grupos}
            categorias={categorias}
            datos={datosPorFiltro[activeFiltro]}
          />
        </div>
        <DualYAxisChart data={datos} />
        <div className="flex flex-col items-center space-y-4">
          <SemiGauge value={tscore} color={color} background={background} />
          <RawSummaryCards
            totals={resumenRaw}
          />
        </div>
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
      </div>
    </div>
  );
}
