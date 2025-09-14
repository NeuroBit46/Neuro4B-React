import { useState } from "react";
import { Icons } from "../constants/Icons";
import { FiltroSwitch } from "./BarGroupChart";
import ScoreRangesCard from "./ScoreRangesCard";
import SemiGauge from "./SemiGauge";
import DualYAxisChart from "./Dual";
import BarGroupChartECharts from "./BarChart";
import RawSummaryCards from "./RawSummaryCards";
import LearningCurveChart from "./LearningCurveChart";

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

  const categorias = ["PuntajeDuro", "PT", "PC"];
  const grupos = ["P1", "P2", "Total"];
  const filtros = ["Servicios correctos", "Consultas", "Aciertos netos", "Tiempo de servicio"];
  const [activeFiltro, setActiveFiltro] = useState(filtros[0]);
  const datosPorFiltro = {
    "Servicios correctos": {
      "P1": { PuntajeDuro: 28, PT: 56, PC: 72 },
      "P2": { PuntajeDuro: 25, PT: 49, PC: 46 },
      "Total": { PuntajeDuro: 53, PT: 51, PC: 55 }
    },
    "Consultas": {
      "P1": { PuntajeDuro: 2, PT: 40, PC: 17 },
      "P2": { PuntajeDuro: 16, PT: 33, PC: 5 },
      "Total": { PuntajeDuro: 19, PT: 35, PC: 7 }
    },
    "Aciertos netos": {
      "P1": { PuntajeDuro: 25, PT: 45, PC: 33 },
      "P2": { PuntajeDuro: 9, PT: 39, PC: 14 },
      "Total": { PuntajeDuro: 34, PT: 42, PC: 21 }
    },
    "Tiempo de servicio": {
      "P1": { PuntajeDuro: 212.1, PT: 55, PC: 69 },
      "P2": { PuntajeDuro: 375.5, PT: 46, PC: 33 },
      "Total": { PuntajeDuro: 587.6, PT: 39, PC: 13 }
    },
  };

  const datos = [
    { aciertos: 3, tiempo: 47.9 },
    { aciertos: 3, tiempo: 34.9 },
    { aciertos: 4, tiempo: 26.5 },
    { aciertos: 3, tiempo: 32.1 },
    { aciertos: 4, tiempo: 26.9 },
    { aciertos: 4, tiempo: 21.1 },
    { aciertos: 4, tiempo: 22.8 },
    { aciertos: 2, tiempo: 48.2 },
    { aciertos: 0, tiempo: 57.4 },
    { aciertos: 0, tiempo: 65.7 },
    { aciertos: 1, tiempo: 53.8 },
    { aciertos: 1, tiempo: 54.9 },
    { aciertos: 4, tiempo: 55.7 },
    { aciertos: 1, tiempo: 39.8 },
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
    aciertosP1: datosPorFiltro["Aciertos netos"]["P1"].PuntajeDuro,
    aciertosP2: datosPorFiltro["Aciertos netos"]["P2"].PuntajeDuro,
    aciertosTotal: datosPorFiltro["Aciertos netos"]["Total"].PuntajeDuro,
    tiempoP1: datosPorFiltro["Tiempo de servicio"]["P1"].PuntajeDuro,
    tiempoP2: datosPorFiltro["Tiempo de servicio"]["P2"].PuntajeDuro,
    tiempoTotal: datosPorFiltro["Tiempo de servicio"]["Total"].PuntajeDuro,
  };

  const aciertosPorRonda = [1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1];
  const aciertosAcumulados = aciertosPorRonda.map((valor, idx) =>
    aciertosPorRonda.slice(0, idx + 1).reduce((a, b) => a + b, 0)
  );

  const tiempoPorRonda = [8.3, 8.5, 8, 6.8, 5.1, 6.1, 6.6, 6.1, 6.2, 7.6, 6.3, 5.7, 9.9, 7];
  const eficienciaPorRonda = aciertosPorRonda.map((a, i) =>
    tiempoPorRonda[i] > 0 ? a / tiempoPorRonda[i] : 0
  );
    
  const bubbleData = {
    "Servicios Correctos": [2, 3, 1, 4, 0, 2, 3, 1, 2, 4, 3, 2, 1, 0],
    "Consultas": [1, 0, 2, 3, 4, 2, 1, 3, 0, 2, 4, 1, 2, 3],
    "Aciertos netos": [3, 2, 4, 1, 0, 3, 2, 4, 1, 0, 3, 2, 1, 4]
  };

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

      <div className="grid grid-cols-[0.6fr_1.2fr_0.3fr] gap-4">
        <div className="space-y-2">
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
        {/* <div className="flex flex-col items-center space-y-4">
          <SemiGauge value={tscore} color={color} background={background} />
          <RawSummaryCards
            totals={resumenRaw}
          />
        </div> */}
        <LearningCurveChart
          xLabels={['R1','R2','R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10', 'R11', 'R12', 'R13','R14']}
          seriesData={{
            'Aciertos acumulados': aciertosAcumulados,
            'Eficiencia': eficienciaPorRonda,
          }}
          yName="Rendimiento"
          smooth={true}
          lineMin={0}
          lineMax={14}
        />
      </div>
    </div>
  );
}

