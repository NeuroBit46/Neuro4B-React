import { Icons } from "../constants/Icons";
import GroupedMetricsCard from "./GroupedMetricsCard";
import CardPunt from "./CardPunt";
import IndicatorCard from "./IndicatorCard";

export default function FlexibilityCognitiveView({ section, getColorSet }) {
  const { title, tscore, miniDesc, icon, color, background } = section;

  // Datos base (mismos 6 indicadores solicitados)
  const datos = {
    "Switching": { PD: -16, PT: 61, PC: 86 },
    "Switching aciertos": { PD: -5, PT: 65, PC: 94 },
    "Switching tiempo": { PD: -2, PT: 62, PC: 88 },
    "Interferencia": { PD: -82, PT: 70, PC: 98 },
    "Perseveraciones": { PD: 0, PT: 61, PC: 87 },
    "Tiempo de servicio": { PD: 434.1, PT: 33, PC: 5 },
  };

  const metricNames = [
    "Switching",
    "Switching aciertos",
    "Switching tiempo",
    "Interferencia",
    "Perseveraciones",
    "Tiempo de servicio",
  ];

  // Construye el objeto "group" que consume GroupedMetricsCard
  const buildGroup = (metricName) => {
    const d = datos[metricName] || {};
    return {
      title: metricName,
      columnHeaders: ["Valor"],
      rows: ["PD", "PT", "PC"].map(label => ({
        label,
        values: [d[label] !== undefined ? d[label] : '—']
      }))
    };
  };

  return (
    <div className="planif-vars flex flex-col w-full mx-auto px-2 sm:px-4" style={{ rowGap: 'var(--planif-gap-5rem)', maxWidth: '1400px' }}>

      {/* Grid 6 tarjetas: 2 filas x 3 columnas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 w-full" style={{ gap: 'var(--planif-gap-6,1.5rem)' }}>
        {metricNames.map(name => (
          <div key={name} className="flex flex-col h-full" style={{ rowGap: 'var(--planif-gap-3,0.75rem)' }}>
            <CardPunt label={name} punt={datos[name]?.PT} />
            <GroupedMetricsCard
              group={buildGroup(name)}
              panelClassName="bg-gradient-to-br from-white/70 to-white/50 dark:from-zinc-900/70 dark:to-zinc-900/50 h-full"
            />
          </div>
        ))}
      </div>

      {/* Indicadores: una sola fila en pantallas grandes; se envuelven en 1 o 2 columnas en tamaños menores */}
      <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mt-4" style={{ gap: 'var(--planif-gap-5)' }}>
        <IndicatorCard
          icon={Icons.monitEjec}
          title="Monitorización de ejecución"
          description="El trabajador ha completado la ejecución de la prueba con corrección de errores en: Parte 1: 0. Parte 2:1."
        />
        <IndicatorCard
          icon={Icons.monitTiempo}
          title="Monitorización de tiempo"
          description="El trabajador no ha usado la referencia para revisar su tiempo de ejecución durante la prueba."
        />
        <IndicatorCard
          icon={Icons.estiloCogn}
          title="Estilo cognitivo"
          description="Observar la mediana de consultas frente al sujeto puede indicar una condición de toma de decisiones adversa al riesgo, con aumento de opciones seguras, o arriesgada."
        />
        <IndicatorCard
          icon={Icons.helpMemo}
          title="Consultas en la tarea de memoria de trabajo"
          description="El trabajador ha consultado las referencias a su disposición para esta tarea 6 veces."
        />
        <IndicatorCard
          icon={Icons.helpPlan}
          title="Consultas en la tarea de planificación"
          description="El trabajador no ha consultado las referencias a su disposición para esta tarea."
        />
        <IndicatorCard
          icon={Icons.mediana}
          title="Mediana de consultas"
          description="En su grupo normativo la mediana de consultas para aprender la tarea es 3 en aprendizaje y 0 en planificación."
        />
      </div>
    </div>
  );
}