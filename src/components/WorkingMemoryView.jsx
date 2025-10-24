import DualYAxisChart from "./Dual";
import LearningCurveChart from "./LearningCurveChart";
import CardPunt from "./CardPunt";
import GroupedMetricsCard from "./GroupedMetricsCard";
import { Card } from "./ui/card";
import ScoreRangeBar from "./ScoreRangeBar";

export default function WorkingMemoryView({ section, getColorSet, titleAddon }) {
  const { data: mem = {} } = section || {};

  const filtros = ["Servicios correctos", "Consultas", "Aciertos netos", "Tiempo de servicio"];
  const grupos = ["P1", "P2", "Total"];
  const categorias = ["PD", "PT", "PC"]; // PD = PuntajeDuro

  const toGrouped = (triad = {}) => ({
    P1: { PuntajeDuro: triad?.P1?.PD ?? null, PT: triad?.P1?.PT ?? null, PC: triad?.P1?.PC ?? null },
    P2: { PuntajeDuro: triad?.P2?.PD ?? null, PT: triad?.P2?.PT ?? null, PC: triad?.P2?.PC ?? null },
    Total: { PuntajeDuro: triad?.Total?.PD ?? null, PT: triad?.Total?.PT ?? null, PC: triad?.Total?.PC ?? null },
  });

  const datosPorFiltro = {
    "Servicios correctos": toGrouped(mem?.serviciosCorrectos),
    "Consultas": toGrouped(mem?.consultas),
    "Aciertos netos": toGrouped(mem?.aciertosNetos),
    "Tiempo de servicio": toGrouped(mem?.tiempoServicio),
  };

  // Series dinámicas (R1..R14)
  const aciertosPorRonda = Array.isArray(mem?.series?.aciertos) ? mem.series.aciertos.map(v => Number(v) || 0) : [];
  const tiempoPorRonda = Array.isArray(mem?.series?.tiempo) ? mem.series.tiempo.map(v => Number(v) || 0) : [];
  const rounds = Math.max(aciertosPorRonda.length, tiempoPorRonda.length);

  const datos = Array.from({ length: rounds }, (_, i) => ({
    aciertos: aciertosPorRonda[i] ?? 0,
    tiempo: tiempoPorRonda[i] ?? 0,
  }));

  const aciertosAcumulados = aciertosPorRonda.reduce((acc, v, i) => {
    acc.push((acc[i - 1] || 0) + v);
    return acc;
  }, []);

  const buildGroup = (filtro) => {
    const data = datosPorFiltro[filtro] || {};
    return {
      title: filtro,
      columnHeaders: grupos,
      rows: categorias.map(cat => ({
        label: cat,
        values: grupos.map(grp => {
          const row = data[grp];
          if (!row) return '—';
          if (cat === 'PD') return row.PuntajeDuro ?? '—';
          return row[cat] ?? '—';
        })
      }))
    };
  };

  return (
    <div className="planif-vars flex flex-col w-full mx-auto px-2 sm:px-4" style={{ rowGap: 'var(--planif-gap-5)', maxWidth: '1400px' }}>
          <Card className="px-4 flex flex-row gap-10 py-2 border-0 shadow-sm">
            {titleAddon}
            <ScoreRangeBar />
          </Card>
      {/* Grid superior: 4 bloques (cada filtro con su Total PT) */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 w-full" style={{ gap: 'var(--planif-gap-6)' }}>
        {filtros.map((filtro) => (
          <div key={filtro} className="flex flex-col h-full" style={{ rowGap: 'var(--planif-gap-3)' }}>
            <CardPunt label={filtro} punt={datosPorFiltro[filtro]?.Total?.PT ?? '—'} />
            <GroupedMetricsCard
              group={buildGroup(filtro)}
              panelClassName="bg-gradient-to-br from-white/70 to-white/50 dark:from-zinc-900/70 dark:to-zinc-900/50 h-full"
            />
          </div>
        ))}
      </div>

      {/* Sección inferior: gráficos por ronda */}
      <div className="grid grid-cols-12 w-full items-stretch" style={{ gap: 'var(--planif-gap-x-main)' }}>
        <Card className="col-span-12 xl:col-span-6 planif-card-pad flex flex-col lg:items-center lg:flex-row w-full" style={{ gap: 'var(--planif-gap-6)' }}>
          <div className="flex-1 min-h-[300px]">
            <DualYAxisChart data={datos} className="h-[320px]" height={320} aciertosScaleMode="zeroToFour" />
          </div>
        </Card>
        <Card className="col-span-12 xl:col-span-6 planif-card-pad w-full flex flex-col" style={{ gap: 'var(--planif-gap-4)' }}>
          <LearningCurveChart
            xLabels={Array.from({ length: rounds }, (_, i) => `R${i + 1}`)}
            seriesData={{ 'Rendimiento': aciertosAcumulados }}
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
    </div>
  );
}

