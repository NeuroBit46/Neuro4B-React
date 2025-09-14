import React, { useMemo } from 'react';
import { ResponsiveContainer, ScatterChart, XAxis, YAxis, ZAxis, Scatter, Cell, Tooltip } from 'recharts';

// Colores por valor 0–4
const defaultColorMap = {
  0: '#f78da7', // pink
  1: '#f4a261', // orange
  2: '#2a9d8f', // green
  3: '#457b9d', // blue
  4: '#9d4edd', // purple
};

// Mapea categorías a índices numéricos
const buildCategoryIndex = (data) => {
  // Conserva el orden que viene en el objeto
  const cats = Object.keys(data);
  const map = new Map(cats.map((c, i) => [c, i]));
  return { cats, map };
};

// Transforma a { x:number, yIdx:number, yLabel:string, z:number }
const transformData = (data) => {
  const { cats, map } = buildCategoryIndex(data);
  const result = [];
  for (const cat of cats) {
    const yIdx = map.get(cat);
    data[cat].forEach((value, xIndex) => {
      const z = Number(value);
      if (!Number.isNaN(z)) {
        result.push({
          x: xIndex + 1,
          yIdx,
          yLabel: cat,
          z,
        });
      }
    });
  }
  return { data: result, cats };
};

const BubbleMatrixChart = ({ data, colorMap = defaultColorMap, height = 400 }) => {
  const { data: chartData, cats } = useMemo(() => transformData(data), [data]);
  const rounds = Math.max(1, Math.max(...chartData.map(d => d.x), 0)) || 14;

  // Debug opcional
  // console.log('len:', chartData.length);
  // console.log('byCat:', chartData.reduce((a,d)=>((a[d.yLabel]=(a[d.yLabel]||0)+1),a),{}));

  const yTicks = Array.from({ length: cats.length }, (_, i) => i);
  const xTicks = Array.from({ length: rounds }, (_, i) => i + 1);

  return (
    <div style={{ width: '100%', height }}>
      {/* Leyenda simple */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 8 }}>
        {Object.entries(colorMap).map(([value, color]) => (
          <div key={value} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            <span style={{ fontSize: 12 }}>Valor {value}</span>
          </div>
        ))}
      </div>
      <ResponsiveContainer>
        <ScatterChart margin={{ top: 24, right: 24, bottom: 36, left: 24 }}>
          <XAxis
            type="number"
            dataKey="x"
            name="Ronda"
            allowDecimals={false}
            domain={[1, rounds]}
            ticks={xTicks}
            tickFormatter={(t) => `R${t}`}
            tick={{ fontSize: 11, angle: -45, textAnchor: 'end' }}
            label={{ value: 'Rondas', position: 'bottom', offset: 10 }}
            allowDuplicatedCategory={false}
          />
          <YAxis
            type="number"
            dataKey="yIdx"
            name="Categoría"
            domain={[0, cats.length - 1]}
            ticks={yTicks}
            tickFormatter={(i) => cats[i]}
            tick={{ fontSize: 12 }}
          />
          <ZAxis
            type="number"
            dataKey="z"
            name="Valor"
            domain={[0, 4]}       // valores esperados
            range={[30, 110]}     // tamaño de burbuja
          />

          <Tooltip
            cursor={{ strokeDasharray: '3 3' }}
            content={({ active, payload }) => {
              if (!active || !payload || !payload.length) return null;
              const p = payload[0].payload; // { x, yIdx, yLabel, z }
              return (
                <div style={{ background: '#fff', border: '1px solid #ddd', padding: 8, fontSize: 12 }}>
                  <div><strong>Categoría:</strong> {p.yLabel}</div>
                  <div><strong>Ronda:</strong> R{p.x}</div>
                  <div><strong>Valor:</strong> {p.z}</div>
                </div>
              );
            }}
          />

          {/* Una serie por categoría, para máxima claridad y evitar colisiones */}
          {cats.map((cat) => {
            const seriesData = chartData.filter(d => d.yLabel === cat);
            return (
              <Scatter
                key={cat}
                name={cat}
                data={seriesData}
                dataKey="z"
                isAnimationActive={false} // evita glitches
              >
                {seriesData.map((entry) => (
                  <Cell
                    key={`cell-${entry.x}-${entry.yIdx}`}
                    fill={colorMap[entry.z] ?? '#ccc'}
                  />
                ))}
              </Scatter>
            );
          })}
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BubbleMatrixChart;
