export default function MetricBar({
  title,
  value,
  getColorSetFromValue = () => ({ color: '#ccc', background: '#eee' }),
  getNivelFromValue = () => '',
}) {
  const porcentaje = Math.max(0, Math.min(100, Math.round(((value - 20) / 60) * 100)));
  const { color, background } = getColorSetFromValue(value);
  const nivel = getNivelFromValue(value);

  const valueTextColor = (nivel === "ALTO" || nivel === "MUY ALTO")
    ? "var(--color-primary-bg)"
    : "var(--color-primary-text)";

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-primary-text font-medium">{title}</span>
        <span className="text-xs font-semibold" style={{ color }}>{nivel}</span>
      </div>

      <div className="relative h-4 rounded-sm overflow-hidden" style={{ background }}>
        <div
          className="absolute top-0 left-0 h-4 rounded-sm"
          style={{
            width: `${porcentaje}%`,
            backgroundColor: color,
            transition: 'width 0.3s ease',
          }}
        />
        <div
          className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold"
          style={{ color: valueTextColor }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}
