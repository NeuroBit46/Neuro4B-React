import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";

export default function MetricBar({
  title,
  value,
  getColorSetFromValue = () => ({ color: '#64748b', background: 'rgba(100,116,139,0.12)' }),
  getNivelFromValue = () => '',
}) {
  // Normaliza a porcentaje (suponiendo rango 20–80 como antes)
  const porcentaje = useMemo(
    () => Math.max(0, Math.min(100, Math.round(((value - 20) / 60) * 100))),
    [value]
  );

  const { color, background } = getColorSetFromValue(value);
  const nivel = getNivelFromValue(value);

  // Derivados de color para efectos
  const trackBg = background || 'rgba(0,0,0,0.06)';
  const barColorSolid = color;
  const barGradient = toRGBA(color, 0.75); // antes gradiente con blancos

  // Texto dentro de la barra (elige blanco o primario oscuro según luminancia simple)
  const valueTextColor = getReadableTextColor(color);

  return (
    <div className="w-full select-none" aria-label={title}>
      <div className="flex justify-between items-center mb-1 gap-2">
        <span className="text-[11px] font-medium text-primary-text truncate">{title}</span>
        <Badge
          className="h-4 px-1.5 rounded-full text-[10px] font-semibold border"
          style={{
            background: toRGBA(color, 0.15),
            color: barColorSolid,
            borderColor: toRGBA(color, 0.35)
          }}
        >
          {nivel}
        </Badge>
      </div>

      <div
        className="relative h-4.5 mt-2 rounded-md overflow-hidden backdrop-blur-sm"
        style={{
          background: toRGBA(color, 0.10),          // track muy sutil
          boxShadow: `inset 0 0 0 1px ${toRGBA(color,0.12)}`
        }}
        role="progressbar"
        aria-valuemin={20}
        aria-valuemax={80}
        aria-valuenow={value}
        aria-label={`${title}: ${value}`}
      >
        <div
          className="absolute top-0 left-0 h-full rounded-md"
          style={{
            width: `${porcentaje}%`,
            background: barGradient,                // color liso
            boxShadow: `
              0 0 0 1px ${toRGBA(color,0.2)} inset,
              0 1px 2px -1px ${toRGBA(color,0.35)}
            `,
            transition: 'width .45s cubic-bezier(.4,0,.2,1)'
          }}
        />

        {/* Texto centrado (sin fondo blanquecino) */}
        <div
          className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold tracking-tight tabular-nums"
          style={{
            color: getReadableTextColor(color),
            textShadow: '0 1px 1px rgba(0,0,0,0.25)'
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

/* --------- Helpers internos --------- */

function toRGBA(color, alpha = 1) {
  if (!color) return `rgba(0,0,0,${alpha})`;
  if (color.startsWith('#')) {
    let hex = color.slice(1);
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const m = color.match(/\d+/g);
  if (m && m.length >= 3) {
    const [r,g,b] = m;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}

function getReadableTextColor(color) {
  const m = color.match(/\d+/g);
  if (!m || m.length < 3) return '#fff';
  const [r,g,b] = m.map(Number);
  // luminancia aproximada
  const l = (0.299*r + 0.587*g + 0.114*b)/255;
  return l > 0.55 ? '#183247' : '#ffffff';
}
