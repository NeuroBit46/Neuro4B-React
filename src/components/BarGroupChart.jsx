export default function BarGroupChart({ activeFiltro, grupos, categorias, datos }) {
  const datosVisibles =
    typeof activeFiltro === "string"
      ? datos[activeFiltro]
      : Object.fromEntries(grupos.map((grupo) => [grupo, datos[grupo]]))
  ;
  const todosValores = Object.values(datosVisibles).flatMap((grupo) =>
    categorias.map((cat) => grupo?.[cat] ?? 0)
  );
  const umbral = 100;
  const valorMax = Math.max(...todosValores);
  const hayNegativos = todosValores.some((v) => v < 0);
  const hayNegativosExtremos = todosValores.some((v) => v < -umbral);
  const valorMin = hayNegativos ? Math.min(...todosValores) : 0;
  const rango = valorMax - valorMin;
  const yStep = rango > 50 ? 10 : rango > 20 ? 5 : 1;
  const yMax = valorMax < umbral ? Math.ceil(valorMax / yStep) * yStep : umbral;
  const yMin = hayNegativosExtremos ? -umbral : Math.floor(valorMin / yStep) * yStep;
  const chartHeight = 250;
  const totalSteps = (yMax - yMin) / yStep + 1;
  const zeroY = ((yMax - 0) / (yMax - yMin)) * chartHeight;

  return (
    <div className="flex flex-col items-center w-full glass-secondary-bg pt-5 px-3 pb-2 rounded-md">
      <div className="relative flex ml-8">
        <div className="absolute -left-[50px] top-0 h-[250px] flex flex-col justify-between pr-2 text-xs text-secondary-text w-[48px]">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div key={i} className="h-[1px] relative w-full flex items-center justify-end">
             <span className="absolute -top-[9px]">
                {i === 0 && yMax === umbral ? '+100' : yMax - i * yStep}
              </span>
            </div>
          ))}
        </div>

        <div className="relative flex gap-6 rounded-md px-4 w-full">
          <div className="relative z-10 flex gap-8">
            {grupos.map((grupo) => (
              <div key={grupo} className="flex flex-col items-center">
                <div className="flex gap-2">
                  {categorias.map((cat) => {
                    const valor = datosVisibles[grupo]?.[cat] ?? 0;
                    const esNegativo = valor < 0;
                    const valorTruncado = esNegativo && valor < -umbral
                      ? -umbral
                      : Math.min(valor, umbral);
                    const barHeight = (Math.abs(valorTruncado) / (yMax - yMin)) * chartHeight;
                    const claseBarra = esNegativo
                      ? "bg-error rounded-b"
                      : "bg-primary rounded-t";

                    return (
                      <div key={cat} className="flex flex-col items-center relative h-[250px] w-5">
                        <div
                          style={{
                            height: `${barHeight}px`,
                            position: "absolute",
                            top: esNegativo ? `${zeroY}px` : `${zeroY - barHeight}px`,
                          }}
                          className={`${esNegativo ? "bg-secondary/45" : "bg-primary/65"} w-full ${claseBarra} transition-all`}
                          title={`${cat}: ${valor}`}
                        />
                        <span className="text-xs text-secondary-text pt-[255px] mt-2">{cat}</span>
                      </div>
                    );
                  })}
                </div>
                <span className="text-xs font-normal text-primary-text mt-8 text-center">{grupo}</span>

              </div>
            ))}
          </div>
        </div>
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
            {Array.from({ length: totalSteps }, (_, i) => {
              const yPos = (1 - i / (totalSteps - 1)) * chartHeight;
              const isZeroLine = Math.abs(yPos - zeroY) < 1;
              return (
                <div
                  key={i}
                  className={`absolute left-0 right-0 border-t ${
                    isZeroLine ? "border-secondary-text z-20" : "border-primary-disabled"
                  }`}
                  style={{ top: `${yPos}px`,
                    height: isZeroLine ? "2px" : "1px",
                  }}
                />
              );
            })}
          </div>
      </div>
    </div>
  );
}

export function FiltroSwitch({ filtros, active, onChange }) {
    return (
        <div className="flex gap-2 justify-center">
        {filtros.map((f) => (
            <button
            key={f}
            onClick={() => onChange(f)}
            className={`px-1.5 py-1 text-xs rounded-md cursor-pointer ${f === active ? "bg-primary text-primary-bg" : "text-primary-text hover:bg-primary-disabled"}`}
            >
            {f}
            </button>
        ))}
        </div>
    );
}