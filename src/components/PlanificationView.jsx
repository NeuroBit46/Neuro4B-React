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
    data: plan = {}, // <- viene de useWorkerData.planificacion.data
  } = section || {};

  // Fallbacks defensivos
  const safeTriad = (obj) => ({
    P1: { PD: obj?.P1?.PD ?? null, PT: obj?.P1?.PT ?? null, PC: obj?.P1?.PC ?? null },
    P2: { PD: obj?.P2?.PD ?? null, PT: obj?.P2?.PT ?? null, PC: obj?.P2?.PC ?? null },
    Total: { PD: obj?.Total?.PD ?? null, PT: obj?.Total?.PT ?? null, PC: obj?.Total?.PC ?? null },
  });

  const aciertos = safeTriad(plan?.aciertos);
  const tiempoAsignacion = safeTriad(plan?.tiempoAsignacion);
  const seriesA = Array.isArray(plan?.series?.aciertos) ? plan.series.aciertos : [];
  const seriesT = Array.isArray(plan?.series?.tiempo) ? plan.series.tiempo : [];
  const totales = plan?.totales || {};

  const categorias = ["PD", "PT", "PC"];
  const grupos = ["P1", "P2", "Total"];
  const KEY_ACIERTOS = "Aciertos";
  const KEY_TIEMPO = "Tiempo de asignación";

  const coerceNumber = (val) => {
    if (val === null || val === undefined || val === "—") return null;
    if (typeof val === "number") return val;
    const n = Number(String(val).replace(/,/g, ""));
    return Number.isFinite(n) ? n : null;
  };
  const formatMaybeNumber = (val, opts = {}) => {
    const num = coerceNumber(val);
    if (num === null) return val ?? "—";
    const { forceDecimals } = opts;
    const parts = String(val).split(".");
    const originalDecimals = parts[1] ? parts[1].length : 0;
    if (!forceDecimals) {
      if (originalDecimals === 0) return Math.round(num).toString();
      if (Number(num.toFixed(1)) === Math.trunc(num) && /\.0+$/.test(num.toFixed(1))) {
        return Math.trunc(num).toString();
      }
    }
    const trimmed = Number(num.toFixed(Math.min(originalDecimals, 2)));
    return forceDecimals ? trimmed.toFixed(Math.min(originalDecimals, 2)) : trimmed.toString();
  };

  // Estructura para GroupedMetricsCard
  const toGrouped = (triad) => ({
    P1: { PuntajeDuro: triad.P1.PD, PT: triad.P1.PT, PC: triad.P1.PC },
    P2: { PuntajeDuro: triad.P2.PD, PT: triad.P2.PT, PC: triad.P2.PC },
    Total: { PuntajeDuro: triad.Total.PD, PT: triad.Total.PT, PC: triad.Total.PC },
  });
  const planificacionData = {
    [KEY_ACIERTOS]: toGrouped(aciertos),
    [KEY_TIEMPO]: toGrouped(tiempoAsignacion),
  };

  // Serie combinada para DualYAxisChart
  const roundCount = Math.max(seriesA.length, seriesT.length);
  const datos = Array.from({ length: roundCount }, (_, i) => ({
    aciertos: coerceNumber(seriesA[i]) ?? 0,
    tiempo: coerceNumber(seriesT[i]) ?? 0,
  }));

  // Curva de aprendizaje (acumulados)
  const aciertosPorRonda = seriesA.map((v) => coerceNumber(v) ?? 0);
  const aciertosAcumulados = aciertosPorRonda.reduce((acc, v, i) => {
    acc.push((acc[i - 1] || 0) + v);
    return acc;
  }, []);
  const tiempoPorRonda = seriesT.map((v) => coerceNumber(v) ?? 0);

  // Nivel por T-score de la sección (para colores/estética general)
  const nivelKey = getNivelKey(tscore);
  const nivelLabel = getNivelLabel(nivelKey);
  const { color, background } = getColorSet(nivelKey);

  const getNivelFromValue = (value) => getNivelLabel(getNivelKey(value));
  const getColorSetFromValue = (value) => getColorSet(getNivelKey(value));

  const buildGroup = (tipo) => {
    const data = planificacionData[tipo];
    return {
      title: tipo,
      columnHeaders: grupos,
      rows: categorias.map((cat) => ({
        label: cat,
        values: grupos.map((grp) => {
          const row = data[grp];
          if (!row) return "—";
          if (cat === "PD") return formatMaybeNumber(row.PuntajeDuro) ?? "—";
          return formatMaybeNumber(row[cat]) ?? "—";
        }),
      })),
    };
  };

  return (
    <div className="planif-vars flex flex-col w-full mx-auto px-2 sm:px-4" style={{ rowGap: 'var(--planif-gap-5)', maxWidth: '1400px' }}>
      {/* Sección superior: Aciertos y Tiempo con P1/P2/Total (PD/PT/PC) */}
      <div className="grid grid-cols-1 w-full items-center" style={{ gap: 'var(--planif-gap-x-main)' }}>
        <div className="col-span-12 md:col-span-8 grid grid-cols-1 md:grid-cols-2" style={{ gap: 'var(--planif-gap-5)' }}>
          <div className="flex flex-col h-full" style={{ rowGap: 'var(--planif-gap-3)' }}>
            <CardPunt label="Aciertos" punt={formatMaybeNumber(aciertos.Total.PT) ?? "—"} />
            <GroupedMetricsCard
              group={buildGroup(KEY_ACIERTOS)}
              panelClassName="bg-gradient-to-br from-white/70 to-white/50 dark:from-zinc-900/70 dark:to-zinc-900/50 h-full"
            />
          </div>
          <div className="flex flex-col h-full" style={{ rowGap: 'var(--planif-gap-3)' }}>
            <CardPunt label="Tiempo de Asignación" punt={formatMaybeNumber(tiempoAsignacion.Total.PT) ?? "—"} />
            <GroupedMetricsCard
              group={buildGroup(KEY_TIEMPO)}
              panelClassName="bg-gradient-to-br from-white/70 to-white/50 dark:from-zinc-900/70 dark:to-zinc-900/50 h-full"
            />
          </div>
        </div>
      </div>

      {/* Gráficas por ronda */}
      <div className="grid grid-cols-12 w-full items-stretch" style={{ gap: 'var(--planif-gap-x-main)' }}>
        <Card className="col-span-12 xl:col-span-6 planif-card-pad flex flex-col lg:items-center lg:flex-row w-full" style={{ gap: 'var(--planif-gap-6)' }}>
          <div className="flex-1 min-h-[280px]">
            <DualYAxisChart data={datos} className="h-[300px]" height={320} aciertosScaleMode="binary" />
          </div>
        </Card>
        <Card className="col-span-12 xl:col-span-6 planif-card-pad w-full flex flex-col" style={{ gap: 'var(--planif-gap-4)' }}>
          <LearningCurveChart
            xLabels={Array.from({ length: roundCount }, (_, i) => `R${i + 1}`)}
            seriesData={{ Rendimiento: aciertosAcumulados }}
            aciertosPorRonda={aciertosPorRonda}
            tiempoPorRonda={tiempoPorRonda}
            yNameAbsolute="Rendimiento"
            yMinAbsolute={0}
            yMaxAbsolute={Math.max(10, Math.max(...aciertosAcumulados, 0))}
            smooth
            className="w-full"
            height={320}
          />
        </Card>
      </div>

      {/* Indicadores (placeholder) */}
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
