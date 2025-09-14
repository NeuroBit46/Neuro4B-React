import { Icons } from "../constants/Icons";

export default function RawSummaryCards({ totals }) {
  const grupos = [
    {
      title: 'Aciertos',
      icon: 'aciertos',
      total: totals.aciertosTotal,
      p1: totals.aciertosP1,
      p2: totals.aciertosP2,
    },
    {
      title: 'Tiempo',
      icon: 'time',
      total: totals.tiempoTotal,
      p1: totals.tiempoP1,
      p2: totals.tiempoP2,
    },
  ];

  return (
    <div className="flex flex-col space-y-4">
      {grupos.map(({ title, icon, total, p1, p2 }, idx) => (
        <div key={idx} className="grid grid-cols-[1fr_0.6fr] gap-3 items-start">
          {/* Card principal (Total) */}
          <div className="glass-secondary-bg min-w-[80px] shadow-sm w-fit h-fit rounded-sm py-4.5 flex flex-col items-center">
            <span className="text-md">{Icons[icon]}</span>
            <span className="text-md font-bold">{total}</span>
            <span className="text-xs text-gray-600 text-center">{title} <br /> Total</span>
          </div>

          {/* Columna P1 + P2 */}
          <div className="flex flex-col space-y-3">
            {[{ label: 'P1', value: p1 }, { label: 'P2', value: p2 }].map(({ label, value }, subIdx) => (
              <div key={subIdx} className="glass-secondary-bg min-w-[65px] shadow-sm w-fit h-fit rounded-sm py-1.5 px-4 flex flex-col items-center">
                <span className="text-sm font-semibold">{value}</span>
                <span className="text-xs text-gray-500">{label}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
