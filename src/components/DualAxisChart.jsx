function useLearningCurve(aciertos) {
  const curva = [];
  let acumulado = 0;
  for (let i = 0; i < aciertos.length; i++) {
    acumulado += aciertos[i];
    curva.push(acumulado / (i + 1));
  }
  return curva;
}

export default function DualAxisChart({ data }) {
  const aciertos = data.map((d) => d.aciertos);
  const tiempos = data.map((d) => d.tiempo);
  const curva = useLearningCurve(aciertos);

  const aciertosMax = Math.max(...aciertos);
  const tiempoMax = Math.max(...tiempos);
  const curvaMax = Math.max(...curva);

  const chartHeight = 250;

  const scale = (val, max) =>
    max > 0 ? (val / max) * chartHeight : 0;

  const aciertosTicks = aciertosMax <= 10
    ? [...Array(aciertosMax + 1)].map((_, i) => i)
    : [...Array(5)].map((_, i) => Math.round(i * (aciertosMax / 4)));

 const yStep = tiempoMax > 50 ? 10 : tiempoMax > 20 ? 5 : 1;
 const adjustedMaxTiempo = Math.ceil(tiempoMax / yStep) * yStep;
const tiempoVisualMax = adjustedMaxTiempo + yStep;
const tiempoTicks = [...Array(Math.floor(tiempoVisualMax / yStep) + 1)]
  .map((_, i) => i * yStep);

  return (
    <div className="grid">
      {/* Leyenda */}
      <div className="flex gap-6 items-center justify-center">
        <LegendDot color="bg-primary/65" label="Aciertos" />
        <LegendDot color="bg-very-high" label="Tiempo sg" />
        <LegendDot color="bg-high" label="Curva de aprendizaje" />
      </div>

      <div className="flex px-4 py-2">
        {/* Eje Y Izquierdo */}
        <div className="relative w-4" style={{ height: chartHeight }}>
          {aciertosTicks.map((val, i) => (
            <span
              key={i}
              className="absolute left-0 text-xs text-secondary-text"
              style={{
                bottom: `${scale(val, aciertosMax)}px`,
                transform: "translateY(50%)",
              }}
            >
              {val}
            </span>
          ))}
        </div>

        {/* Zona de gráfico */}
        <div className="flex-1 flex flex-col items-center">
          <div
            className="relative flex items-end glass-secondary-bg rounded-md w-full"
            style={{ height: chartHeight }}
          >
            {data.map((d, i) => {
              const ah = scale(d.aciertos, aciertosMax);
              const th = scale(d.tiempo, tiempoVisualMax);
              const ch = scale(curva[i], curvaMax);
              const bg = i < 7 ? "bg-secondary/10" : "bg-low/10";

              return (
                <div
                  key={i}
                  className={`relative w-7 flex-shrink-0 h-full flex flex-col items-center justify-end ${bg}`}
                >
                  <div
                    className="w-5 bg-primary/65 rounded-t"
                    style={{ height: `${ah}px` }}
                    title={`Aciertos: ${d.aciertos}`}
                  />
                  <div
                    className="absolute w-2 h-2 bg-very-high rounded-full"
                    style={{
                      bottom: `${th}px`,
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                    title={`Tiempo: ${d.tiempo}s`}
                  />
                  <div
                    className="absolute w-2 h-2 bg-high rounded-full"
                    style={{
                      bottom: `${ch}px`,
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                    title={`Curva: ${curva[i].toFixed(2)}`}
                  />
                </div>
              );
            })}
          </div>

          {/* Eje X */}
          <div className="flex pt-2">
            {data.map((_, i) => (
              <div key={i} className="w-7 text-center text-xs text-secondary-text">
                {i + 1}
              </div>
            ))}
          </div>

          <div className="text-xs font-medium text-primary-text text-center mt-1">
            Rondas
          </div>
        </div>

        {/* Eje Y Derecho */}
        <div className="relative w-6" style={{ height: chartHeight }}>
          {tiempoTicks.map((val, i) => (
            <span
              key={i}
              className="absolute right-0 text-xs text-secondary-text"
              style={{
                bottom: `${scale(val, tiempoVisualMax)}px`,
                transform: "translateY(50%)",
              }}
            >
              {val}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-2 w-2 ${color} rounded-full`} />
      <p className="text-xs text-primary-text leading-[0.5rem]">{label}</p>
    </div>
  );
}
