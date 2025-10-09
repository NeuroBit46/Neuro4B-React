import React, { useRef, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { useCSSVariables } from './useCSSVariables.jsx';
import { applyFontToChart } from '../utils/applyFontToChart';

// maxTiempo: opcional si se quiere fijar techo para tiempo (sino deja que ECharts calcule)
// Escala de 'Aciertos' configurable:
//  - auto (por defecto): usa el máximo observado (>=1)
//  - binary: fija el máximo en 1 (para datos 0/1)
//  - zeroToFour: fija el máximo en 4 (para datos en 0..4)
// Props responsive: width (default '100%'), height (default 280) y className opcional.
const DualYAxisChart = ({
  data = [],
  maxAciertos, // deprecado (ignorando)
  maxTiempo,
  aciertosScaleMode = 'auto', // 'auto' | 'binary' | 'zeroToFour'
  width = '100%',
  height = 280,
  className = '',
  style = {},
}) => {
  const fontFamily = getComputedStyle(document.documentElement)
    .getPropertyValue('--font-sans')
    .trim();

  const colors = useCSSVariables([
    'color-secondary',
    'color-primary-text',
    'color-secondary-text',
    'color-primary',
    'color-neutral',
  ]);

  const colorPrimary = (colors['color-primary'] || '#1E88E5').trim();
  const colorSecondary = (colors['color-secondary'] || '#E53935').trim();
  const colorPrimaryText = (colors['color-primary-text'] || '#2B2B2B').trim();
  const colorSecondaryText = (colors['color-secondary-text'] || '#808080').trim();
  const colorNeutral = (colors['color-neutral'] || '#B0B0B0').trim();
  const aciertosDataNum = data.map(d => Number(d.aciertos));
  const tiempoDataNum = data.map(d => Number(d.tiempo));

    // Calcular máximo de aciertos según modo (binary, zeroToFour, auto)
    const observedMaxAciertos = aciertosDataNum.reduce((m,v)=> (Number.isFinite(v) && v>m ? v : m), 0);
    let yAxisMaxAciertos;
    if (aciertosScaleMode === 'binary') {
      yAxisMaxAciertos = 1;
    } else if (aciertosScaleMode === 'zeroToFour') {
      yAxisMaxAciertos = 4;
    } else {
      yAxisMaxAciertos = observedMaxAciertos > 0 ? observedMaxAciertos : 1;
    }

  const aciertosDataItems = aciertosDataNum.map(v => ({
    value: v,
    itemStyle: {
      color: v === 0 ? colorSecondary : colorPrimary,
      opacity: 0.9,
    },
  }));

  const dividerCoord = 6.5;

  const baseOption = {
    title: {
      text: 'Ejecución por Rondas',
      left: 'center',
      top: 0,
      textStyle: {
        color: colorPrimaryText,
        fontFamily,
        fontSize: 14,
        fontWeight: 600,
      },
    },

    color: [],
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: params => {
        const i = params[0]?.dataIndex ?? 0;
        const ronda = params[0]?.axisValueLabel ?? '';
        return [
          `${ronda}`,
          `Aciertos: ${aciertosDataNum[i] ?? 0}`,
          `Tiempo de servicio: ${tiempoDataNum[i] ?? 0}`,
        ].join('<br/>');
      },
    },
    legend: {
      data: ['Aciertos', 'Tiempo de servicio'],
      textStyle: { color: colorPrimaryText },
      top: 25,
    },
    xAxis: [
      {
        type: 'category',
        data: data.map((_, i) => `R${i + 1}`),
        axisLine: { show: false },
        axisTick: {show: false},
        axisLabel: {
          color: colorSecondaryText,
        },
        name: 'Rondas',
        nameLocation: 'middle',
        nameGap: 30,
        nameTextStyle: { color: colorPrimaryText, fontSize: 12 },
      },
      {
        type: 'value',
        show: false,
        min: 0,
        max: Math.max(data.length - 1, 1),
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: 'Aciertos',
        position: 'left',
        min: 0,
        max: yAxisMaxAciertos,
        axisLabel: {
          color: colorSecondaryText,
        },
        axisLine: {show: false},
        axisTick: {show: false},
        splitLine: {
          show: true,
          lineStyle: { color: colorPrimary, type: 'dashed', width: 1.5, opacity: 0.6 },
        },
        minInterval: 1,
      },
      {
        type: 'value',
        name: 'Tiempo (sg)',
        position: 'right',
        min: 0,
        max: typeof maxTiempo === 'number' ? maxTiempo : undefined,
        axisLine: {show: false},
        axisTick: {show: false},
        axisLabel: {
          color: colorSecondaryText,
        },
        splitLine: {
          show: true,
          lineStyle: { color: colorNeutral, type: 'solid', width: 1, opacity: 0.4 },
        },
      },
    ],
    grid: { top: 40, bottom: 20, left: 25, right: 25, containLabel: true },
    series: [
      {
        name: 'Aciertos',
        type: 'bar',
        data: aciertosDataItems,
        yAxisIndex: 0,
        xAxisIndex: 0,
        barMinHeight: 5,
        label: { show: false },
        itemStyle: { color: colorPrimary },
      },
      {
        name: 'Tiempo de servicio',
        type: 'line',
        data: tiempoDataNum,
        yAxisIndex: 1,
        xAxisIndex: 0,
        smooth: false,
        lineStyle: { color: colorNeutral, opacity: 1 },
        itemStyle: { color: colorNeutral, opacity: 0.85 },
        symbol: 'circle',
        symbolSize: 8,
      },
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
        top: 305,
        z: 5,
        style: {
          text: 'Parte 1',
          fill: colorNeutral,
          font: `normal 12px ${fontFamily}`,
        },
      },
      {
        type: 'text',
        left: '67%',
        top: 305,
        z: 5,
        style: {
          text: 'Parte 2',
          fill: colorNeutral,
          font: `normal 12px ${fontFamily}`,
        },
      },
    ],
  };

  const option = applyFontToChart(baseOption, fontFamily);

  const chartRef = useRef(null);
  useEffect(() => {
    const handleResize = () => {
      try {
        chartRef.current?.getEchartsInstance()?.resize();
      } catch (_) {
        /* noop */
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div
      className={`rounded-sm ${className}`}
      style={{ width, height, ...style }}
    >
      <ReactECharts
        ref={chartRef}
        option={option}
        style={{ width: '100%', height: '100%' }}
        notMerge
        lazyUpdate
      />
    </div>
  );
};

export default DualYAxisChart;
