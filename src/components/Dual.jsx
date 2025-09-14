import React from 'react';
import ReactECharts from 'echarts-for-react';
import { useCSSVariables } from './useCSSVariables.jsx';
import { applyFontToChart } from '../utils/applyFontToChart';

const DualYAxisChart = ({ data }) => {
  const fontFamily = getComputedStyle(document.documentElement)
    .getPropertyValue('--font-sans')
    .trim();

  const colors = useCSSVariables([
    'color-secondary',
    'color-primary-text',
    'color-secondary-text',
    'color-primary',
  ]);

  const aciertosData = data.map(d => d.aciertos);
  const tiempoData = data.map(d => d.tiempo);

  const baseOption = {
    title: {
      text: 'Aciertos vs Tiempo de servicio',
      left: 'left',
      top: 0,
      textStyle: {
        fontSize: 14,
        fontWeight: '500',
        color: colors['color-primary-text'],
      },
      show: false,
    },
    tooltip: { trigger: 'axis'},
    legend: { data: ['Aciertos', 'Tiempo de servicio'] },
    xAxis: {
      type: 'category',
      data: data.map((_, i) => `R${i + 1}`),
      axisLine: {
        lineStyle: { color: colors['color-secondary-text'] },
      },
      name: 'Rondas',
      nameLocation: 'middle',
      nameGap: 30,
      nameTextStyle: {
        color: colors['color-primary-text'],
        fontSize: 12,
        fontWeight: 'normal',
      },
    },
    yAxis: [
      {
        type: 'value',
        name: 'Aciertos',
        position: 'left',
        axisLine: {
          lineStyle: { color: colors['color-secondary-text'] },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: colors['color-primary'],
            type: 'dashed',
            width: 1.5,
            opacity: 0.6,
          },
        },
        minInterval: 1,
      },
      {
        type: 'value',
        name: 'Tiempo (sg)',
        position: 'right',
        axisLine: {
          lineStyle: { color: colors['color-secondary-text'] },
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: colors['color-secondary'],
            type: 'solid',
            width: 1,
            opacity: 0.4,
          },
        },
      },
    ],
    grid: {
      top: 40,
      bottom: 20,
      left: 20,
      right: 20,
      containLabel: true,
    },
    series: [
      {
        name: 'Aciertos',
        type: 'bar',
        data: aciertosData,
        yAxisIndex: 0,
        itemStyle: {
          color: colors['color-primary'],
          opacity: 0.75,
        }
      },
      {
        name: 'Tiempo de servicio',
        type: 'line',
        data: tiempoData,
        yAxisIndex: 1,
        smooth: false,
        lineStyle: {
          color: colors['color-secondary'],
          opacity: 1,
        },
        itemStyle: {
          color: colors['color-secondary'],
          opacity: 0.75,
        },
        symbol: 'circle',
        symbolSize: 8,
      },
    ],
  };

  const option = applyFontToChart(baseOption, fontFamily);

  return(
      <div className="w-fit h-fit pr-2 pt-2 pb-3 rounded-sm">
        <ReactECharts option={option} style={{ height: '320px', width: '600px' }} />
      </div>
    );
};

export default DualYAxisChart;
