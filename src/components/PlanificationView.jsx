import { Icons } from "../constants/Icons";
import DualYAxisChart from "./Dual";
import { getNivelKey, getNivelLabel } from "../lib/nivel";
import LearningCurveChart from "./LearningCurveChart";
import CardPunt from "./CardPunt";
import GroupedMetricsCard from "./GroupedMetricsCard";
import IndicatorCard from "./IndicatorCard";
import { Card } from "./ui/card";

export default function PlanificationView({ section, getColorSet }) {
  const {
    tscore,
  } = section;

  const categorias = ["PD", "PT", "PC"]; // PD mostrará el valor de PuntajeDuro (alias visual)
  const grupos = ["P1", "P2", "Total"];
  // Estructura alineada al formato usado en WorkingMemory (PuntajeDuro, PT, PC)
  // Permite reutilizar misma lógica de buildGroup (alias PD => PuntajeDuro)
  const KEY_ACIERTOS = "Aciertos totales";
  const KEY_TIEMPO = "Tiempo de asignación";
  const planificacionData = {
    [KEY_ACIERTOS]: {
      P1: { PuntajeDuro: 7, PT: 58, PC: 78 },
      P2: { PuntajeDuro: 7, PT: 56, PC: 73 },
      Total: { PuntajeDuro: 14, PT: 59, PC: 81 }
    },
    [KEY_TIEMPO]: {
      P1: { PuntajeDuro: 26.4, PT: 57, PC: 76 },
      P2: { PuntajeDuro: 23.6, PT: 55, PC: 68 },
      Total: { PuntajeDuro: 50.1, PT: 58, PC: 78 }
    }
  };

  const coerceNumber = (val) => {
    if (val === null || val === undefined) return null;
    if (typeof val === 'number') return val;
    const n = Number(String(val).replace(/,/g,''));
    return Number.isFinite(n) ? n : null;
  };

  const formatMaybeNumber = (val, opts = {}) => {
    const num = coerceNumber(val);
    if (num === null) return val; // devolver el string original tal cual
    // Regla: si termina en .0 mostrar entero; si necesita decimales conservarlos.
    const { forceDecimals } = opts; // opcional si en algún caso se quisiera forzar
    // Determinar cuántos decimales significativos tiene el número original
    const parts = String(val).split('.');
    const originalDecimals = parts[1] ? parts[1].length : 0;
    if (!forceDecimals) {
      // Si no hay decimales originales -> devolver entero
      if (originalDecimals === 0) return Math.round(num).toString();
      // Si los decimales originales resultan en .0 -> también entero
      if (Number(num.toFixed(1)) === Math.trunc(num) && /\.0+$/.test(num.toFixed(1))) {
        return Math.trunc(num).toString();
      }
    }
    // Mantener máximo 2 decimales pero sin recortar injustificadamente
    const trimmed = Number(num.toFixed(Math.min(originalDecimals, 2)));
    // Eliminar ceros de más excepto si se pidió forceDecimals
    return forceDecimals ? trimmed.toFixed(Math.min(originalDecimals, 2)) : trimmed.toString();
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
    aciertosP1: formatMaybeNumber(planificacionData[KEY_ACIERTOS].P1.PuntajeDuro),
    aciertosP2: formatMaybeNumber(planificacionData[KEY_ACIERTOS].P2.PuntajeDuro),
    aciertosTotal: formatMaybeNumber(planificacionData[KEY_ACIERTOS].Total.PuntajeDuro),
    tiempoP1: formatMaybeNumber(planificacionData[KEY_TIEMPO].P1.PuntajeDuro),
    tiempoP2: formatMaybeNumber(planificacionData[KEY_TIEMPO].P2.PuntajeDuro),
    tiempoTotal: formatMaybeNumber(planificacionData[KEY_TIEMPO].Total.PuntajeDuro),
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
        values: grupos.map(grp => {
          const row = data[grp];
          if (!row) return '—';
          if (cat === 'PD') return formatMaybeNumber(row.PuntajeDuro);
            return formatMaybeNumber(row[cat]);
        })
      }))
    };
  };

  return (
  <div className="planif-vars flex flex-col w-full mx-auto px-2 sm:px-4" style={{ rowGap: 'var(--planif-gap-5)', maxWidth: '1400px' }}>
      {/* Sección superior: grid 12 columnas estable */}
      <div className="grid grid-cols-1 w-full items-center" style={{ gap: 'var(--planif-gap-x-main)' }}>
        {/* Columna métricas (span 12 -> stack, md:8) */}
        <div className="col-span-12 md:col-span-8 grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--planif-gap-5)' }}>
          <div className="flex flex-col h-full" style={{ rowGap: 'var(--planif-gap-3)' }}>
            <CardPunt label="Aciertos" punt={ formatMaybeNumber(planificacionData[KEY_ACIERTOS].Total.PT) } />
            <GroupedMetricsCard
              group={buildGroup(KEY_ACIERTOS)}
              panelClassName="bg-gradient-to-br from-white/70 to-white/50 dark:from-zinc-900/70 dark:to-zinc-900/50 h-full"
            />
          </div>
          <div className="flex flex-col h-full" style={{ rowGap: 'var(--planif-gap-3)' }}>
            <CardPunt label="Tiempo" punt={ formatMaybeNumber(planificacionData[KEY_TIEMPO].Total.PT, {decimals:1}) } />
            <GroupedMetricsCard
              group={buildGroup(KEY_TIEMPO)}
              panelClassName="bg-gradient-to-br from-white/70 to-white/50 dark:from-zinc-900/70 dark:to-zinc-900/50 h-full"
            />
          </div>
        </div>
        {/* Columna indicadores (span 12 -> abajo, md:4 a la derecha) */}
      </div>

      {/* Sección inferior: grid 12 para dar más ancho a la curva en desktop */}
      <div className="grid grid-cols-12 w-full items-stretch" style={{ gap: 'var(--planif-gap-x-main)' }}>
        <Card className="col-span-12 xl:col-span-6 planif-card-pad flex flex-col lg:items-center lg:flex-row w-full" style={{ gap: 'var(--planif-gap-6)' }}>
          {/* <div className="flex flex-row lg:flex-col justify-between lg:justify-start w-full lg:w-auto" style={{ gap: 'var(--planif-gap-4)' }}>
            <RawSummaryCards totals={resumenRaw} />
          </div> */}
          <div className="flex-1 min-h-[280px]">
            <DualYAxisChart data={datos} className="h-[300px]" height={320} aciertosScaleMode="binary" />
          </div>
        </Card>
  <Card className="col-span-12 xl:col-span-6 planif-card-pad w-full flex flex-col" style={{ gap: 'var(--planif-gap-4)' }}>
          <LearningCurveChart
            xLabels={['R1','R2','R3','R4','R5','R6','R7','R8','R9','R10','R11','R12','R13','R14']}
            seriesData={{ Rendimiento: aciertosAcumulados }}
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
      {/* Indicadores: una sola fila en pantallas grandes; se envuelven en 1 o 2 columnas en tamaños menores */}
      <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 'var(--planif-gap-5)' }}>
        <IndicatorCard
          icon={Icons.cognitiveLoad}
          title="Carga cognitiva"
          description="Los aciertos no han aumentado, es posible que la carga cognitiva afecte al aprendizaje."
        />
        <IndicatorCard
          icon={Icons.fatigue}
          title="Fatigabilidad"
          description="No muestra signos de fatigabilidad."
        />
        <IndicatorCard
          icon={Icons.attention}
          title="Planificación procesual y memoria prospectiva"
          description="La planificación procesual se ha aprendido y la memoria prospectiva es adecuada."
        />
      </div>
    </div>
  );
}
