import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useCSSVariables } from './useCSSVariables.jsx';

export default function LearningCurveChart({
  xLabels,
  seriesData,
  aciertosPorRonda = [],
  tiempoPorRonda = [],
  smooth = true,
  percentSeries = [],
  inferPercentByName = true,
  yNameAbsolute = 'Aciertos',
  yMinAbsolute,
  yMaxAbsolute,
  decimalsAbsolute = 0,
}) {
  const fontFamily = getComputedStyle(document.documentElement)
    .getPropertyValue('--font-sans')
    .trim();

  const colors = useCSSVariables([
    'color-primary',
    'color-secondary',
    'color-very-high',
    'color-primary-disabled',
    'color-secondary-text',
    'color-primary-text',
  ]);

  const colorList = [
    colors['color-primary'],
    colors['color-secondary'],
    colors['color-very-high'],
  ];

  const percentSet = new Set(
    (percentSeries || []).map((s) => String(s).toLowerCase().trim())
  );

  const looksPercent = (name) => {
    if (!inferPercentByName) return false;
    const n = String(name).toLowerCase();
    return (
      n.includes('accuracy') ||
      n.includes('acc') ||
      n.includes('eficiencia') ||
      n.includes('precision') ||
      n.includes('%')
    );
  };

  const isPercentSeries = (name) =>
    percentSet.has(String(name).toLowerCase().trim()) || looksPercent(name);

  const filteredSeriesData = Object.fromEntries(
    Object.entries(seriesData).filter(([name]) => !isPercentSeries(name))
  );

  const series = Object.entries(filteredSeriesData).map(([name, values], idx) => ({
    name,
    type: 'line',
    data: values,
    smooth,
    symbol: 'circle',
    symbolSize: 6,
    yAxisIndex: 0,
    lineStyle: { width: 2, color: colorList[idx % colorList.length] },
    itemStyle: { color: colorList[idx % colorList.length] },
  }));

  const option = {
    title: {
      text: 'Curva de aprendizaje',
      left: 'center',
      textStyle: {
        fontSize: 12,
        fontFamily,
        color: colors['color-primary-text'],
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        if (!params || !params.length) return '';
        const i = params[0]?.dataIndex ?? 0;
        const x = params[0]?.axisValueLabel ?? params[0]?.name ?? `Ronda ${i + 1}`;
        const aciertos = aciertosPorRonda[i] ?? '—';
        const tiempo = tiempoPorRonda[i] ?? '—';

        const lines = params.map((p) => {
          const val =
            typeof p.value === 'number'
              ? p.value.toFixed(decimalsAbsolute)
              : Number(p.value).toFixed(decimalsAbsolute);
          return `${p.marker} ${p.seriesName}: ${val}`;
        });

        return `${x}<br/>Aciertos: ${aciertos}<br/>Tiempo: ${tiempo}<br/>${lines.join('<br/>')}`;
      },
    },
    legend: {
      data: Object.keys(filteredSeriesData),
      top: 20,
      textStyle: {
        fontSize: 12,
        fontFamily,
        color: colors['color-secondary-text'],
      },
    },
    xAxis: {
      type: 'category',
      data: xLabels,
      axisLabel: {
        fontSize: 11,
        fontFamily,
        color: colors['color-secondary-text'],
      },
    },
    yAxis: [
      {
        type: 'value',
        name: yNameAbsolute,
        min: typeof yMinAbsolute === 'number' ? yMinAbsolute : undefined,
        max: typeof yMaxAbsolute === 'number' ? yMaxAbsolute : undefined,
        axisLabel: {
          formatter: (v) => Math.round(v),
          fontSize: 11,
          fontFamily,
          color: colors['color-secondary-text'],
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
            color: colors['color-primary-disabled'],
          },
        },
      },
    ],
    series,
  };
  return (
    <div className="w-fit h-fit px-2 rounded-md">
      <ReactECharts option={option} style={{ height: '300px', width: '450px' }} />
    </div>
  );
}
