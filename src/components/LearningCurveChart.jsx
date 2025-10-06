import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useCSSVariables } from './useCSSVariables.jsx';

export default function LearningCurveChart({
  xLabels = [],
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
    'color-neutral',
  ]);

  const colorList = [
    colors['color-primary'],
    colors['color-secondary'],
    colors['color-very-high'],
  ];

  const colorNeutral = (colors['color-neutral'] || '#B0B0B0').trim();

  // --- lógica de percentSeries (igual que antes) ---
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
    xAxisIndex: 0, // usa el eje categórico
    lineStyle: { width: 2, color: colorList[idx % colorList.length] },
    itemStyle: { color: colorList[idx % colorList.length] },
  }));

  // --- coordenada del divisor entre R7 y R8 ---
  const dividerCoord = 6.5;

  const option = {
    title: {
      text: 'Curva de aprendizaje',
      left: 'center',
      textStyle: {
        fontSize: 13,
        fontFamily,
        color: colors['color-primary-text'],
        fontWeight: '600',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
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
      top: 25,
      textStyle: {
        fontSize: 12,
        fontFamily,
        color: colors['color-secondary-text'],
      },
    },
    xAxis: [
      {
        type: 'category',
        data: xLabels,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          fontSize: 12,
          fontFamily,
          color: colors['color-secondary-text'],
        },
        name: 'Rondas',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: { color: colors['color-primary-text'], fontSize: 12, fontFamily },
      },
      // eje auxiliar numérico oculto
      {
        type: 'value',
        show: false,
        min: 0,
        max: Math.max(xLabels.length - 1, 1),
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: yNameAbsolute,
        min: typeof yMinAbsolute === 'number' ? yMinAbsolute : undefined,
        max: typeof yMaxAbsolute === 'number' ? yMaxAbsolute : undefined,
        axisLabel: {
          formatter: (v) => Math.round(v),
          fontSize: 12,
          fontFamily,
          color: colors['color-secondary-text'],
        },
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'solid',
            color: colors['color-neutral'],
            opacity: 0.4,
          },
        },
      },
    ],
    grid: { top: 40, bottom: 20, left: 20, right: 20, containLabel: true },
    series: [
      ...series,
      // serie dummy para markLine
      {
        name: 'Divisor',
        type: 'scatter',
        data: [],
        xAxisIndex: 1,
        yAxisIndex: 0,
        markLine: {
          symbol: 'none',
          label: { show: false },
          lineStyle: {
            color: colorNeutral,
            type: 'dashed',
            width: 1.5,
          },
          data: [{ xAxis: dividerCoord }],
        },
      },
    ],
    graphic: [
      {
        type: 'text',
        left: '25%',
        top: 265,
        z: 5,
        style: {
          text: 'Parte 1',
          fill: colors['color-neutral'],
          font: `normal 12px ${fontFamily}`,
        },
      },
      {
        type: 'text',
        left: '67%',
        top: 265,
        z: 5,
        style: {
          text: 'Parte 2',
          fill: colors['color-neutral'],
          font: `normal 12px ${fontFamily}`,
        },
      },
    ],
  };

  return (
    <div className="w-fit h-fit rounded-md">
      <ReactECharts option={option} style={{ height: '280px', width: '500px' }} />
    </div>
  );
}
