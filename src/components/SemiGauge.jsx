// Aplica el "método 1" (CSS Color Level 4 rgb(from var(--color-*) r g b / α))
// para modular opacidades de fondo, pista y trazo.
export default function SemiGauge({
  value = 0,
  color = 'var(--color-primary)',
  background = 'rgba(0,0,0,0.1)',
  label = 'Punt. T'
}) {
  const radius = 32;
  const strokeWidth = 6;
  const center = radius + strokeWidth;
  const angle = ((value - 20) / (80 - 20)) * 180;
  const endX = center + radius * Math.cos(Math.PI * (1 - angle / 180));
  const endY = center - radius * Math.sin(Math.PI * (1 - angle / 180));

  const isVar = typeof color === 'string' && color.startsWith('var(');
  const alpha = (a) => isVar ? `rgb(from ${color} r g b / ${a})` : color; // fallback mantiene color base

  const trackColor = alpha(0.15);
  const progressColor = alpha(0.80);
  const glowColor = alpha(0.35);

  return (
    <div
      className="p-1.5 w-fit rounded-sm flex items-center justify-center"
      style={{
        background: alpha(0.08),
        backdropFilter: 'blur(6px)',
        boxShadow: `0 2px 6px -1px ${glowColor}`
      }}
    >
      <div>
        <svg width={center * 2} height={center + 25} className="font-sans">
          {/* Arco base (pista) */}
          <path
            d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />
          {/* Arco progreso */}
          <path
            d={`M ${center - radius} ${center} A ${radius} ${radius} 0 ${angle > 180 ? 1 : 0} 1 ${endX} ${endY}`}
            stroke={progressColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 4px ${glowColor})` }}
          />
          {/* Valor */}
          <text
            x={center}
            y={center - 5}
            textAnchor="middle"
            fontSize="14"
            fill="var(--color-primary-text)"
            fontFamily="var(--font-sans)"
            fontWeight="600"
          >
            {value}
          </text>
          {/* Etiqueta */}
          <text
            x={center}
            y={center + 18}
            textAnchor="middle"
            fontSize="10"
            fill="var(--color-primary-text)"
            fontFamily="var(--font-sans)"
            fontWeight="600"
            letterSpacing={0.5}
          >
            {label}
          </text>
        </svg>
      </div>
    </div>
  );
}
