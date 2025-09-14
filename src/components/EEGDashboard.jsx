import { useEffect, useState } from "react";
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
  const [range, setRange] = useState([0, 10]); // segundos visibles

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

  // Parsear Hora a índice
  const parsedData = data.map((d, i) => ({
    ...d,
    index: i, // índice que se usa en el slider
  }));

  // Filtrar según el rango elegido
  const filteredData = parsedData.filter(
    (d) => d.index >= range[0] && d.index <= range[1]
  );

  return (
    <div className="grid grid-cols-2 gap-4 z-0">
      <div className="col-span-3 flex gap-10 items-center justify-center">
        <Select onValueChange={setVariable} value={variable}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Seleccione una variable" />
          </SelectTrigger>
          <SelectContent>
            {data.length > 0 &&
              Object.keys(data[0])
                .filter((k) => k !== "TimeDate" && k !== "index" && k !== "Hora")
                .map((key) => (
                  <SelectItem key={key} value={key}>
                    {variablesLabels[key] || key.replace(/_/g, " ")}
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
      <div className="col-span-5 bg-white p-4 rounded-sm shadow-xs text-xs">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Hora" interval="preserveStartEnd" tick={{ dy: 10 }} />
            <YAxis tick={{ dx: -5 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey={variable}
              stroke="#8884d8"
              strokeWidth={2}
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
