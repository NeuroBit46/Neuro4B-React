import { useEffect, useState, useRef } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import AverageCard from "./AverageCard";
import { Activity } from "lucide-react";

export default function EEGDashboard({ workerId }) {
  const [data, setData] = useState([]);
  const [averages, setAverages] = useState({});
  const [variable, setVariable] = useState("Atencion");
  const [range, setRange] = useState([0, 10]); // será reajustado al cargar datos
  const rangeInitializedRef = useRef(false);

  const variablesLabels = {
    Atencion: "Atención",
    Meditacion: "Meditación",
    Carga_Cognitiva: "Carga cognitiva",
    Estres: "Estrés",
    Activacion_General: "Activación general",
    Fatiga_Mental: "Fatiga mental",
    Alegria: "Alegría",
    Tristeza: "Tristeza",
    Motivacion: "Motivación",
    Sorpresa: "Sorpresa",
    Desagrado: "Desagrado",
    Rabia: "Rabia",
    Compromiso_Cognitivo: "Compromiso cognitivo",
  };

  useEffect(() => {
    if (!workerId) return;
    rangeInitializedRef.current = false; // reset al cambiar de trabajador

    fetch(`${import.meta.env.VITE_API_BASE}/api/trabajador/${workerId}/indicadores`)
      .then((res) => res.json())
      .then((json) => {
        const registros = json.datos_normalizados || [];

        // limpiar y normalizar promedios
        const promedios = {};
        for (const [k, v] of Object.entries(json.promedios || {})) {
          promedios[k] = v != null && !isNaN(v) ? Number(v) : null;
        }

        setData(registros.filter((d) => d.Hora)); // usar Hora
        setAverages(promedios);

        // Si no hay variable seleccionada, tomar la primera válida
        if (!variable) {
          const firstVar = Object.keys(promedios).find(
            (k) => k !== "TimeDate" && k !== "Hora"
          );
          if (firstVar) setVariable(firstVar);
        }
      })
      .catch((err) => console.error("Error cargando indicadores EEG:", err));
  }, [workerId]);

  // Al tener datos, fija un rango inicial mínimo de 90s (1.5 min)
  useEffect(() => {
    if (rangeInitializedRef.current) return;
    if (!Array.isArray(data) || data.length === 0) return;
    // Convierte "HH:MM" o "MM:SS" a segundos
    const timeToSeconds = (t) => {
      const parts = String(t || "").split(":").map(Number);
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      return NaN;
    };
    // Estima dt (segundos por muestra). Fallback a 1s si no se puede calcular.
    let dt = 1;
    if (data.length >= 2) {
      const s0 = timeToSeconds(data[0]?.Hora);
      const s1 = timeToSeconds(data[1]?.Hora);
      if (Number.isFinite(s0) && Number.isFinite(s1) && s1 > s0) {
        dt = Math.max(1, s1 - s0);
      }
    }
    const minSeconds = 90;
    const neededPoints = Math.max(2, Math.ceil(minSeconds / dt));
    const maxIndex = data.length - 1;
    const endIndex = Math.min(neededPoints - 1, maxIndex);
    setRange([0, endIndex]);
    rangeInitializedRef.current = true;
  }, [data]);

  // Parsear Hora a índice
  const parsedData = data.map((d, i) => ({
    ...d,
    index: i, // índice que se usa en el slider
  }));

  // Filtrar según el rango elegido
  const filteredData = parsedData.filter(
    (d) => d.index >= range[0] && d.index <= range[1]
  );

  // Opciones del dropdown ordenadas alfabéticamente por etiqueta (es)
  const options = data.length > 0
    ? Object.keys(data[0])
        .filter((k) => k !== "TimeDate" && k !== "index" && k !== "Hora")
        .map((key) => ({
          key,
          label: variablesLabels[key] || key.replace(/_/g, " "),
        }))
        .sort((a, b) => a.label.localeCompare(b.label, "es", { sensitivity: "base" }))
    : [];

  return (
    <div className="grid grid-cols-2 gap-4 z-0">
      <div className="col-span-3 flex gap-10 items-center justify-center">
        <Select onValueChange={setVariable} value={variable}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Seleccione una variable" />
          </SelectTrigger>
          <SelectContent>
            {options.map(({ key, label }) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {variable && averages[variable] != null && (
          <AverageCard
            icon={Activity}
            variableName={variablesLabels[variable] || variable.replace(/_/g, " ")}
            average={averages[variable].toFixed(2)}
          />
        )}
      </div>

      {/* Gráfico principal */}
      <div className="col-span-5 bg-white p-4 rounded-sm shadow-xs text-xs text-neutral">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Hora" interval="preserveStartEnd" tick={{ dy: 10 }} />
            <YAxis
              tick={{ dx: -5 }}
              domain={[0, 100]}
              ticks={Array.from({ length: 11 }, (_, i) => i * 10)}
              allowDecimals={false}
              interval={0}          // fuerza a mostrar todos los ticks
              width={42}            // espacio para las etiquetas
              tickMargin={6}        // separa texto del eje
            />
            <Tooltip />
            <Line
              type="monotone"
              dataKey={variable}
              stroke="currentColor"        // línea en color neutral heredado
              strokeWidth={2}
              dot={{ stroke: 'currentColor', strokeWidth: 2, fill: '#fff' }}
              activeDot={{ stroke: 'currentColor', strokeWidth: 3, fill: '#fff', r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Slider estilo "scrubber" */}
        <div className="mt-4">
          <Slider
            value={range}
            onValueChange={setRange}
            min={0}
            max={parsedData.length - 1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-center gap-3 text-sm mt-2 text-primary-text">
            <span>{parsedData[range[0]]?.Hora}</span>
            <span>-</span>
            <span>{parsedData[range[1]]?.Hora}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
