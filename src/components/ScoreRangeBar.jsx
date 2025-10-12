import React from 'react';
import { cn } from '@/lib/utils';

export function ScoreRangeBar({
  className,
  bands = [
    { label: 'MUY BAJO', from: 20, to: 30, color: 'var(--color-very-low)' },
    { label: 'BAJO', from: 30, to: 40, color: 'var(--color-low)' },
    { label: 'MEDIO', from: 40, to: 60, color: 'var(--color-medium)' },
    { label: 'ALTO', from: 60, to: 70, color: 'var(--color-high)' },
    { label: 'MUY ALTO', from: 70, to: 80, color: 'var(--color-very-high)' },
  ],
  thickness = 28,
  showLabels = true,
  showTicks = true,
  bleedX = 0,
}) {
  if (!bands.length) return null;

  const ordered = [...bands].sort((a, b) => a.from - b.from);

  // Pesos proporcionales (puedes mantener el *2 si quieres exagerar)
  const weights = ordered.map(b => (b.to - b.from) * 2);
  const totalWeight = weights.reduce((a, c) => a + c, 0);

  // Calcular posiciones acumuladas de cada límite
  let acc = 0;
  const boundaries = [];
  ordered.forEach((b, idx) => {
    boundaries.push({ value: b.from, pos: (acc / totalWeight) * 100 });
    acc += weights[idx];
  });
  // último límite (to del último rango)
  boundaries.push({ value: ordered[ordered.length - 1].to, pos: 100 });

  const bleedStyle = bleedX
    ? { marginLeft: -bleedX, marginRight: -bleedX, paddingLeft: bleedX, paddingRight: bleedX }
    : undefined;

  return (
    <div className={cn('w-full flex flex-col items-stretch select-none', className)} style={bleedStyle}>
      {showTicks && (
        <div className="w-full mb-4 relative">
          {boundaries.map(b => (
            <span
              key={b.value}
              className="absolute text-[0.6rem] font-medium text-primary-text/70 tabular-nums"
              style={{ left: `${b.pos}%`, transform: 'translateX(-50%)' }}
            >
              {b.value}
            </span>
          ))}
        </div>
      )}

      {/* Barra de bandas */}
      <div
        className="relative w-full flex overflow-hidden rounded-full"
        style={{ height: thickness, minWidth: '440px', maxHeight: '20px' }}
      >
        {ordered.map((b, idx) => {
          const colVar = b.color; // ej: var(--color-medium)
          const bg = `rgb(from ${colVar} r g b / 0.30)`; // intensidad moderada
          const labelColor = `rgb(from ${colVar} r g b / 0.85)`;
          const borderColor = `rgb(from ${colVar} r g b / 0.45)`; // opcional si se quisiera delimitar
          return (
            <div
              key={b.label + idx}
              className="h-full flex items-center justify-center relative"
              style={{
                width: `${(weights[idx] / totalWeight) * 100}%`,
                background: bg,
                // borderLeft: idx === 0 ? 'none' : `1px solid ${borderColor}`,
                // borderRight: idx === ordered.length -1 ? 'none' : `1px solid ${borderColor}`
              }}
            >
              {showLabels && (
                <span className="text-xs font-semibold tracking-wide px-1 text-center leading-tight select-none" style={{ color: labelColor }}>
                  {b.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ScoreRangeBar;
