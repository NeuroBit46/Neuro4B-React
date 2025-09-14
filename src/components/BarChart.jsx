import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useCSSVariables } from './useCSSVariables.jsx';
import { applyFontToChart } from '../utils/applyFontToChart';

export default function BarGroupChartECharts({
  grupos,
  categorias,
  datos,
  barWidth = 25,
  barGap = '25%',
  barCategoryGap = '0%',
  groupSpacerSlots = 0,
}) {
  const fontFamily = getComputedStyle(document.documentElement)
    .getPropertyValue('--font-sans')
    .trim();

  const colors = useCSSVariables([
    'color-primary-text',
    'color-secondary-text',
    'color-primary-disabled',
    'color-primary',
    'color-secondary',
    'color-very-high',
  ]);

  const colorMap = {
    PuntajeDuro: colors['color-secondary'],
    PT: colors['color-primary'],
    PC: colors['color-very-high'],
  };

  const labelMap = {
    PuntajeDuro: 'Puntaje duro',
    PT: 'Puntaje total',
    PC: 'Puntaje percentil',
  };

  const datosVisibles = useMemo(() => {
    return Object.fromEntries(grupos.map((grupo) => [grupo, datos[grupo]]));
  }, [datos, grupos]);

  const yMin = 0;
  const yMax = 100;
  const yStep = 10;

  const GAP_PREFIX = '__gap__';
  const xCategorias = useMemo(() => {
    const arr = [];
    grupos.forEach((g, i) => {
      arr.push(g);
      if (i < grupos.length - 1) {
        for (let k = 0; k < groupSpacerSlots; k++) arr.push(`${GAP_PREFIX}${i}_${k}`);
      }
    });
    return arr;
  }, [grupos, groupSpacerSlots]);

  const series = categorias.map((cat) => ({
    name: labelMap[cat] || cat,
    type: 'bar',
    data: xCategorias.map((x) => {
      if (x.startsWith(GAP_PREFIX)) return '-';
      const valor = datosVisibles[x]?.[cat] ?? 0;
      const truncado = Math.max(0, Math.min(valor, 100));
      return truncado;
    }),
    itemStyle: {
      color: colorMap[cat],
      opacity: 0.85,
    },
    label: {
      show: false,
      position: 'top',
      formatter: () => '',
      fontSize: 12,
      fontFamily,
      color: colors['color-primary-text'],
    },
    barWidth,
    barGap,
  }));

  const option = {
    legend: {
      show: true,
      data: categorias.map((cat) => labelMap[cat] || cat),
      top: 0,
      selectedMode: 'multiple',
      textStyle: {
        fontSize: 12,
        fontFamily,
        color: colors['color-secondary-text'],
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#fff',
      textStyle: {
        fontFamily,
        fontSize: 12,
        color: colors['color-primary-text'],
      },
      formatter: (params) => {
        if (!params || !params.length) return '';
        const nombreCategoria = params[0].name;
        if (nombreCategoria.startsWith(GAP_PREFIX)) return '';

        const filas = params
          .filter((p) => p.seriesName && p.value !== '-' && p.value != null)
          .map((p) => `<div><strong>${labelMap[p.seriesName] || p.seriesName}</strong> en ${nombreCategoria}: ${p.value}</div>`);

        return filas.join('');
      },
    },
    grid: {
      top: 40,
      bottom: 10,
      left: 20,
      right: 20,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: xCategorias,
      axisLabel: {
        fontSize: 11,
        fontFamily,
        color: colors['color-secondary-text'],
        formatter: (val) => (val.startsWith(GAP_PREFIX) ? '' : val),
      },
      axisTick: {
        alignWithLabel: true,
        interval: (index, val) => !String(val).startsWith(GAP_PREFIX),
      },
    },
    yAxis: {
      type: 'value',
      min: yMin,
      max: yMax,
      interval: yStep,
      axisLabel: {
        fontSize: 11,
        fontFamily,
        color: colors['color-secondary-text'],
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: colors['color-primary-disabled'],
          type: 'dashed',
        },
      },
    },
    barCategoryGap,
    series,
  };

  // applyFontToChart?.(option, fontFamily);

  return (
    <div className="w-fit h-fit px-2 rounded-md">
      <ReactECharts option={option} style={{ height: '300px', width: '450px' }} />
    </div>
  );
}
