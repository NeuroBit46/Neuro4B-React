import { Badge } from "@/components/ui/badge";
import { useMemo } from "react";

export default function MetricBar({
  title,
  value,
  getColorSetFromValue = () => ({ color: "#64748b", background: "rgba(100,116,139,0.12)" }),
  getNivelFromValue = () => "",
}) {
  // Porcentaje (rango 20–80)
  const porcentaje = useMemo(
    () => Math.max(0, Math.min(100, Math.round(((value - 20) / 60) * 100))),
    [value]
  );

  const { color } = getColorSetFromValue(value);
  const nivel = getNivelFromValue(value);

  const isVarRef = typeof color === "string" && color.startsWith("var(");
  const base = color;
  const alpha = (a) => (isVarRef ? `rgb(from ${base} r g b / ${a})` : toRGBA(base, a));
  const trackBg = alpha(0.10);
  const barGradient = alpha(0.75);

  return (
    <div className="w-full select-none" aria-label={title}>
      {/* Row general: izquierda (título+badge+barra), derecha (value) */}
      <div className="flex items-stretch gap-3">
        {/* Col izquierda */}
        <div className="flex-1 min-w-0">
          {/* Fila 1: título + badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary-text truncate">{title}</span>
            <Badge
              className="h-4 px-1.5 rounded-full text-xs font-semibold border"
              style={{
                background: alpha(0.18),
                color: alpha(0.90),
                borderColor: alpha(0.40),
              }}
            >
              {nivel}
            </Badge>
          </div>

          {/* Fila 2: barra de progreso */}
          <div
            className="mt-2 relative h-4.5 rounded-md overflow-hidden backdrop-blur-sm"
            style={{
              background: trackBg,
              boxShadow: `inset 0 0 0 1px ${alpha(0.18)}`,
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
                background: barGradient,
                boxShadow: `
                  0 0 0 1px ${alpha(0.25)} inset,
                  0 1px 2px -1px ${alpha(0.45)}
                `,
                transition: "width .45s cubic-bezier(.4,0,.2,1)",
              }}
            />
          </div>
        </div>

        {/* Col derecha: value */}
        <div className="flex flex-col justify-center items-end">
          <div className="text-base font-semibold tabular-nums text-primary-text">
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

/* --------- Helpers --------- */
function toRGBA(color, alpha = 1) {
  if (!color) return `rgba(0,0,0,${alpha})`;
  if (color.startsWith("#")) {
    let hex = color.slice(1);
    if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
    const num = parseInt(hex, 16);
    const r = (num >> 16) & 255;
    const g = (num >> 8) & 255;
    const b = num & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const m = color.match(/\d+/g);
  if (m && m.length >= 3) {
    const [r, g, b] = m;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return color;
}
