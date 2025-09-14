export default function ScoreRangesCard({ getColorSet }) {
  const niveles = [
    { rango: "20 - 30", nombre: "MUY BAJO" },
    { rango: "31 - 40", nombre: "BAJO" },
    { rango: "41 - 59", nombre: "MEDIO" },
    { rango: "60 - 69", nombre: "ALTO" },
    { rango: "70 - 80", nombre: "MUY ALTO" },
  ];
  return (
    <div className="glass-secondary-bg rounded-md shadow-xs py-3 px-2 w-full max-w-sm text-primary-text space-y-2">
      <h2 className="text-xs font-semibold tracking-tight text-center">Rango de Puntuación T</h2>
      <div className="flex flex-row items-center justify-center gap-x-4 text-xs leading-tight place-items-center">
        {niveles.map(({ rango, nombre }, j) => {
          const { color } = getColorSet(nombre);
          return (
            <div key={j} className="flex flex-col items-center space-x-2 space-y-1">
              <div className="text-secondary-text font-medium text-center">{rango}</div>
              <div className="uppercase font-medium tracking-tight text-center" style={{ color }}>
                {nombre}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
