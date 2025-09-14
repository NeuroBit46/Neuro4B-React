// import { Icons } from "../constants/Icons";
// import ScoreRangesCard from "./ScoreRangesCard";
// import SemiGauge from "./SemiGauge";
// import BarGroupChartECharts from "./BarChart";
// import BarGroupChart from "./BarGroupChart";

// export default function FlexibilityCognitiveView({ section, getColorSet }) {
//   const {
//     title,
//     tscore,
//     miniDesc,
//     icon,
//     color,
//     background
//   } = section;

//   const categorias = ["PD", "PT", "PC"];
//   const grupos = ["Switching", "Switching aciertos", "Switching tiempo", "Interferencia", "Perseveraciones", "Tiempo de servicio"];
//   const datosPorFiltro = {
//    "Switching": {
//       "Switching": { PD: -37, PT: 36, PC: 9 },
//       "Switching aciertos": { PD: 17, PT: 47, PC: 37 },
//       "Switching tiempo": { PD: -12, PT: 36, PC: 8 }
//     },
//     "Índices": {
//       "Interferencia": { PD: -49, PT: 59, PC: 83 },
//       "Perseveraciones": { PD: 0, PT: 62, PC: 89 },
//       "Tiempo de servicio": { PD: 375.5, PT: 46, PC: 33 }
//     },
//   };

//   return (
//     <div className="space-y-4">
//       <div className="flex flex-row justify-between">
//         <div className="flex flex-col space-y-2">
//           <div className="flex items-center space-x-2">
//             <span className="text-primary-text">{Icons[icon]}</span>
//             <h1 className="text-sm text-primary-text font-medium">{title}</h1>
//           </div>
//           <p className="text-xs text-secondary-text">{miniDesc}</p>
//         </div>
//         <div className="flex flex-row items-start justify-between space-x-8">
//           <SemiGauge value={tscore} color={color} background={background} />
//           <ScoreRangesCard getColorSet={getColorSet} />
//         </div>
//       </div>

//       <div className="grid grid-cols-[0.6fr_1.2fr_0.3fr] gap-6">
//         <div className="space-y-2">
//           {/* <BarGroupChartECharts
//             grupos={grupos}
//             categorias={categorias}
//             datos={datosPorFiltro}
//           /> */}
//           <BarGroupChart
//             grupos={grupos}
//             categorias={categorias}
//             datos={datosPorFiltro}
//           />
//         </div>

//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import { Icons } from "../constants/Icons";
import BarGroupChart from "./BarGroupChart";
import VisualGroup from "./MetricBar";
import ScoreRangesCard from "./ScoreRangesCard";
import SemiGauge from "./SemiGauge";

export default function FlexibilityCognitiveView({ section, getColorSet }) {
  const { title, tscore, metrics, miniDesc, icon, nivel, color, background } = section;
  const categorias = ["PD", "PT", "PC"];
  const datosPorFiltro = {
    "Switching": {
      "Switching": { PD: -37, PT: 36, PC: 9 },
      "Switching aciertos": { PD: 17, PT: 47, PC: 37 },
      "Switching tiempo": { PD: -12, PT: 36, PC: 8 }
    },
    "Índices": {
      "Interferencia": { PD: -49, PT: 59, PC: 83 },
      "Perseveraciones": { PD: 0, PT: 62, PC: 89 },
      "Tiempo de servicio": { PD: 375.5, PT: 46, PC: 33 }
    },
  };
  const grupos = [
    ...Object.entries(datosPorFiltro["Switching"]).map(([key]) => key),
    ...Object.entries(datosPorFiltro["Índices"]).map(([key]) => key),
  ];
  const datosUnificados = {
    ...datosPorFiltro["Switching"],
    ...datosPorFiltro["Índices"],
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-row justify-between space-y-2">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center space-x-2 py-1">
            <span className="text-primary-text">{Icons[icon]}</span>
            <h1 className="text-sm text-primary-text font-medium">{title}</h1>
          </div>
          <p className="text-xs text-secondary-text">
            {miniDesc}
          </p>
        </div>
        <div className="flex flex-row items-start justify-between space-x-8">
          <SemiGauge value={tscore} color={color} background={background} />
          <ScoreRangesCard getColorSet={getColorSet} />
        </div>
      </div>

      <div className="flex flex-col-3">
        <div className="space-y-5">
          <BarGroupChart
            activeFiltro={null}
            grupos={grupos}
            categorias={categorias}
            datos={datosUnificados}
          />
        </div>
      </div>
    </div>
  );
}