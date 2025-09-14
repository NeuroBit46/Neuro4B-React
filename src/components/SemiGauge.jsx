export default function SemiGauge({ value = 0, color = "var(--color-primary)", background = "rgba(0,0,0,0.1)"  }) {
  const radius = 32;
  const strokeWidth = 6;
  const center = radius + strokeWidth;
  const angle = ((value - 20) / (80 - 20)) * 180;
  const endX = center + radius * Math.cos(Math.PI * (1 - angle / 180));
  const endY = center - radius * Math.sin(Math.PI * (1 - angle / 180));

  return (
    <div
      className="p-1.5 w-fit rounded-sm flex items-center justify-center"
      style={{
        background,
        backdropFilter: "blur(4px)",
        boxShadow: `0 2px 6px ${background.replace(/rgba\((.+), [^)]+\)/, "rgba($1, 0.2)")}`,
      }}
    >
      <div>
        <svg width={center * 2} height={center + 25} className="gauge-dark font-sans">
          {/* Arco base */}
          <path
            d={`M ${center - radius} ${center}
                A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
            stroke="var(--color-primary-bg)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            fill="none"
          />

          {/* Arco progreso */}
          <path
            d={`M ${center - radius} ${center}
                A ${radius} ${radius} 0 ${angle > 180 ? 1 : 0} 1 ${endX} ${endY}`}
            stroke={color}
            strokeWidth={strokeWidth}
            opacity="0.75"
            fill="none"
            strokeLinecap="round"
          />

          {/* Valor dentro del arco */}
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

          {/* Título como etiqueta inferior */}
          <text
            x={center}
            y={center + 18}
            textAnchor="middle"
            fontSize="10"
            fill="var(--color-primary-text)"
            fontFamily="var(--font-sans)"
            fontWeight="600"
          >
            Punt. T
          </text>
        </svg>
      </div>
    </div>
  );
}
