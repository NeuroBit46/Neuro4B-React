import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

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
                <Card className={`border border-border/60 rounded-sm shadow-sm bg-white/70 dark:bg-zinc-800/60 backdrop-blur-sm ${panelClassName}`}>
                  <div className="flex flex-col h-full p-2">
                    <h3 className="text-xs font-semibold text-primary-text mb-2 tracking-wide">
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
                                className="text-[10px] font-semibold text-secondary-text text-center uppercase tracking-wide"
                              >
                                {h}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="space-y-1">
                          {group.rows.map((row, rIdx) => (
                            <div
                              key={rIdx}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: `${labelColWidth} repeat(${columnHeaders ? columnHeaders.length : (row.values?.length || 0)}, minmax(${cellMinWidth}, 1fr))`,
                                columnGap: cellGap,
                                alignItems: 'center'
                              }}
                            >
                              <span className="text-[10px] font-semibold text-primary-text tracking-wide">
                                {row.label}
                              </span>
                              {Array.isArray(row.values) && row.values.length > 0 ? (
                                row.values.map((v, ci) => (
                                  <span
                                    key={ci}
                                    className="text-[11px] font-semibold text-primary-text text-center px-1 py-1 rounded-sm bg-primary/5 border border-border/40"
                                  >
                                    {v}
                                  </span>
                                ))
                              ) : (
                                <span className="text-[10px] italic text-secondary-text">—</span>
                              )}
                            </div>
                          ))}
                        </div>
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
