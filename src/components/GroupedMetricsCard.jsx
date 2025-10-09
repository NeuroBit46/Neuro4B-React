import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { getNivelKey, getNivelColorVar } from '../lib/nivel';

export default function GroupedMetricsCard({
  title,
  group = null,            // NUEVO: objeto de grupo único
  groups = [],             // DEPRECATED: se mantiene para compatibilidad (usa primer elemento)
  className = '',
  panelClassName = '',
  columnsPerRow = 1,       // ya no relevante para multi-panel, se mantiene por compatibilidad
  labelColWidth = '3rem',
  cellMinWidth = '2.75rem',
  cellGap = '0.5rem',
  panelMinWidth = '140px',
}) {
  // Compatibilidad: si no se pasó group pero sí groups[], tomar el primero
  const effectiveGroup = React.useMemo(() => {
    if (group) return group;
    if (Array.isArray(groups) && groups.length > 0) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[GroupedMetricsCard] Prop "groups" está deprecado. Usa prop "group".');
      }
      return groups[0];
    }
    return null;
  }, [group, groups]);

  return (
    <Card className={`p-3 space-y-3 border-border/70 shadow-xs bg-gradient-to-br from-white to-white/95 dark:from-zinc-900 dark:to-zinc-900/90 ${className}`}>
      <CardContent className="p-0">
        {effectiveGroup ? (
          <div className="w-full">
            {(() => {
              const group = effectiveGroup;
              const hasRows = Array.isArray(group.rows) && group.rows.length > 0;
              const hasMatrix = !hasRows && Array.isArray(group.valuesRow) && Array.isArray(group.labelsRow);
              const lengthMatch = hasMatrix && group.valuesRow.length === group.labelsRow.length;
              const fallbackMetrics = !hasRows && !hasMatrix && Array.isArray(group.metrics) ? group.metrics : [];

              let columnHeaders = Array.isArray(group.columnHeaders) ? group.columnHeaders : null;
              if (hasRows && !columnHeaders) {
                const maxLen = Math.max(...group.rows.map(r => (Array.isArray(r.values) ? r.values.length : 0)), 0);
                columnHeaders = Array.from({ length: maxLen }, (_, i) => `Col ${i + 1}`);
              }

              return (
                <Card className={`border-0 rounded-sm shadow-none bg-white/70 dark:bg-zinc-800/60 backdrop-blur-sm ${panelClassName}`}>
                  <div className="flex flex-col h-full p-0">
                    <h3 className="text-sm font-semibold text-primary-text mb-2 tracking-wide">
                      {group.title || title}
                    </h3>
                    {hasRows && (
                      <div className="w-full">
                        {columnHeaders && columnHeaders.length > 0 && (
                          <div
                            className="mb-2"
                            style={{
                              display: 'grid',
                              gridTemplateColumns: `${labelColWidth} repeat(${columnHeaders.length}, minmax(${cellMinWidth}, 1fr))`,
                              columnGap: cellGap,
                            }}
                          >
                            <span className="text-[10px]" />
                            {columnHeaders.map((h, i) => (
                              <span
                                key={i}
                                className="text-[12px] font-semibold text-secondary-text text-center uppercase tracking-wide"
                              >
                                {h}
                              </span>
                            ))}
                          </div>
                        )}
                        {(() => {
                          // Detectar si se pasaron columnas explícitas de fases (P1/P2/Total)
                          const explicitHeaders = Array.isArray(group.columnHeaders) ? group.columnHeaders : null;
                          const hasPhaseCols = explicitHeaders ? explicitHeaders.some(h => /^(P1|P2|Total)$/i.test(String(h).trim())) : false;
                          // Si NO hay columnas de fases explícitas, ocultar la fila 'PT'
                          const rowsToRender = Array.isArray(group.rows)
                            ? group.rows.filter(r => !(String(r?.label || '').toUpperCase() === 'PT' && !hasPhaseCols))
                            : [];

                          return (
                            <div className="space-y-1">
                              {rowsToRender.map((row, rIdx) => (
                            <div
                              key={rIdx}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: `${labelColWidth} repeat(${columnHeaders ? columnHeaders.length : (row.values?.length || 0)}, minmax(${cellMinWidth}, 1fr))`,
                                columnGap: cellGap,
                                alignItems: 'center'
                              }}
                            >
                              <span className="text-[12px] font-semibold text-primary-text tracking-wide">
                                {row.label}
                              </span>
                              {Array.isArray(row.values) && row.values.length > 0 ? (
                                row.label === 'PT'
                                  ? row.values.map((v, ci) => {
                                      // Colorear según rango del valor (T-score 20-80 typical)
                                      const num = parseFloat(String(v).replace(/,/g,''));
                                      const nivelKey = Number.isFinite(num) ? getNivelKey(num) : 'MuyBajo';
                                      const rawVar = getNivelColorVar(nivelKey);
                                      const bg = `rgb(from ${rawVar} r g b / 0.22)`; // fondo suave
                                      const border = `rgb(from ${rawVar} r g b / 0.45)`; // borde más marcado
                                      const txt = `rgb(from ${rawVar} r g b / 0.95)`; // texto casi sólido

                                      return (
                                        <span
                                          key={ci}
                                          className="text-[13px] font-semibold text-center px-1 py-1 rounded-sm border"
                                          style={{ background: bg, borderColor: border, color: txt }}
                                        >
                                          {v}
                                        </span>
                                      );
                                    })
                                  : row.values.map((v, ci) => (
                                      <span
                                        key={ci}
                                        className="text-[12px] font-semibold text-primary-text text-center px-1 py-1 rounded-sm bg-primary/7 border border-border/40"
                                      >
                                        {v}
                                      </span>
                                    ))
                              ) : (
                                <span className="text-[12px] italic text-secondary-text">—</span>
                              )}
                            </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                    {!hasRows && hasMatrix && lengthMatch && (
                      <div className="w-full">
                        <div className="flex flex-row gap-4 mb-1">
                          {group.valuesRow.map((val, i) => (
                            <span key={i} className="text-[11px] font-semibold text-primary-text min-w-[1.5rem] text-center">
                              {val}
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-row gap-4 text-[10px] font-medium text-secondary-text tracking-wide">
                          {group.labelsRow.map((lab, i) => (
                            <span key={i} className="min-w-[1.5rem] text-center">
                              {lab}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {!hasRows && !hasMatrix && fallbackMetrics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-1 text-[11px] font-medium text-primary-text">
                        {fallbackMetrics.map((m, i) => (
                          <div
                            key={i}
                            className="flex flex-col items-center justify-center min-w-[2.2rem] px-1 py-1 rounded-sm bg-primary/5 border border-border/40"
                            title={m.label !== String(m.value) ? `${m.label}: ${m.value}` : undefined}
                          >
                            <span className="text-[11px] font-semibold leading-none">
                              {m.value}
                            </span>
                            <span className="text-[9px] text-secondary-text leading-none mt-0.5">{m.label}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {!hasRows && !hasMatrix && fallbackMetrics.length === 0 && (
                      <span className="text-[11px] italic text-secondary-text mb-1">Sin datos</span>
                    )}
                  </div>
                </Card>
              );
            })()}
          </div>
        ) : (
          <div className="p-4 text-[11px] text-secondary-text italic">Sin grupo</div>
        )}
      </CardContent>
    </Card>
  );
}
