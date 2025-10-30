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
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import AverageCard from "./AverageCard";
import { Activity } from "lucide-react";

export default function EEGDashboard({ workerId }) {
  const [data, setData] = useState([]);
  const [averages, setAverages] = useState({});
  const [variableA, setVariableA] = useState("Atencion");
  const [variableB, setVariableB] = useState("");
  const [range, setRange] = useState([0, 10]);
  const [startMin, setStartMin] = useState("");
  const [startSec, setStartSec] = useState("");
  const [endMin, setEndMin] = useState("");
  const [endSec, setEndSec] = useState("");
  const [manualRange, setManualRange] = useState(null);
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
    rangeInitializedRef.current = false;

    fetch(`${import.meta.env.VITE_API_BASE}/api/trabajador/${workerId}/indicadores`)
      .then((res) => res.json())
      .then((json) => {
        const registros = json.datos_normalizados || [];
        const promedios = {};
        for (const [k, v] of Object.entries(json.promedios || {})) {
          promedios[k] = v != null && !isNaN(v) ? Number(v) : null;
        }
        setData(registros.filter((d) => d.Hora));
        setAverages(promedios);

        if (!variableA) {
          const firstVar = Object.keys(promedios).find(
            (k) => k !== "TimeDate" && k !== "Hora"
          );
          if (firstVar) setVariableA(firstVar);
        }
      })
      .catch((err) => console.error("Error cargando indicadores EEG:", err));
  }, [workerId]);

  useEffect(() => {
    if (rangeInitializedRef.current) return;
    if (!Array.isArray(data) || data.length === 0) return;
    const timeToSeconds = (t) => {
      const parts = String(t || "").split(":").map(Number);
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
      if (parts.length === 2) return parts[0] * 60 + parts[1];
      return NaN;
    };
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

  const parsedData = data.map((d, i) => ({
    ...d,
    index: i,
  }));

  const filteredData = parsedData.filter(
    (d) => d.index >= range[0] && d.index <= range[1]
  );

  const options = data.length > 0
    ? Object.keys(data[0])
        .filter((k) => k !== "TimeDate" && k !== "index" && k !== "Hora")
        .map((key) => ({
          key,
          label: variablesLabels[key] || key.replace(/_/g, " "),
        }))
        .sort((a, b) => a.label.localeCompare(b.label, "es", { sensitivity: "base" }))
    : [];

  // Convierte tiempo a índice
  const timeToIndex = (min, sec) => {
    const targetSec = Number(min) * 60 + Number(sec);
    for (let i = 0; i < parsedData.length; i++) {
      const [m, s] = String(parsedData[i]?.Hora || "").split(":").map(Number);
      if ((m * 60 + s) >= targetSec) return i;
    }
    return parsedData.length - 1;
  };

  // Aplica el filtro manual
  const handleApplyManualRange = () => {
    if (startMin === "" || startSec === "") return;
    const startIdx = timeToIndex(startMin, startSec);
    let endIdx = parsedData.length - 1;
    if (endMin !== "" && endSec !== "") {
      endIdx = timeToIndex(endMin, endSec);
      if (endIdx < startIdx) endIdx = startIdx;
    }
    setManualRange([startIdx, endIdx]);
    setRange([startIdx, endIdx]);
  };

  return (
    <div className="bg-white p-4 rounded-sm shadow-xs text-xs text-neutral">
      {/* Fila de selectores, filtro de tiempo y promedios */}
      <div className="flex gap-6 items-center mb-6">
        {/* Selectores a la izquierda */}
        <div className="flex gap-4">
          <Select value={variableA} onValueChange={setVariableA}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Variable 1" />
            </SelectTrigger>
            <SelectContent>
              {options.map(({ key, label }) => (
                <SelectItem
                  key={key}
                  value={key}
                  disabled={key === variableB}
                >
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={variableB} onValueChange={v => setVariableB(v === "__none__" ? "" : v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Variable 2 (opcional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="__none__" value="__none__">
                Ninguna
              </SelectItem>
              {options.map(({ key, label }) => (
                <SelectItem
                  key={key}
                  value={key}
                  disabled={key === variableA}
                >
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Promedio(s) a la derecha */}
        <div className="flex gap-4 ml-auto">
          {variableA && averages[variableA] != null && (
            <AverageCard
              icon={Activity}
              variableName={`${variablesLabels[variableA] || variableA.replace(/_/g, " ")} promedio`}
              average={averages[variableA].toFixed(2)}
            />
          )}
          {variableB && averages[variableB] != null && (
            <AverageCard
              icon={Activity}
              variableName={`${variablesLabels[variableB] || variableB.replace(/_/g, " ")} promedio`}
              average={averages[variableB].toFixed(2)}
            />
          )}
        </div>

      </div>
        {/* Filtro de tiempo exacto al centro */}
        <div className="flex justify-center w-fit items-center mb-6 gap-2 mx-auto bg-neutral/10 px-6 py-2 rounded-xl">
          <span className="text-sm font-medium text-secondary-text mr-2">Inicio</span>
          <Input
            type="number"
            min={0}
            max={59}
            value={startMin}
            onChange={e => setStartMin(e.target.value.replace(/\D/, ""))}
            placeholder="mm"
            className="w-14 text-center text-sm input-no-spinner"
          />
          <span>:</span>
          <Input
            type="number"
            min={0}
            max={59}
            value={startSec}
            onChange={e => setStartSec(e.target.value.replace(/\D/, ""))}
            placeholder="ss"
            className="w-14 input-no-spinner text-center text-sm"
          />
          <span className="mx-2 text-sm font-medium text-secondary-text">Fin</span>
          <Input
            type="number"
            min={0}
            max={59}
            value={endMin}
            onChange={e => setEndMin(e.target.value.replace(/\D/, ""))}
            placeholder="mm"
            className="w-14 text-center text-sm input-no-spinner"
          />
          <span>:</span>
          <Input
            type="number"
            min={0}
            max={59}
            value={endSec}
            onChange={e => setEndSec(e.target.value.replace(/\D/, ""))}
            placeholder="ss"
            className="w-14 text-center text-sm input-no-spinner"
          />
          <Button
            size="sm"
            variant="neutral"
            className="ml-2"
            onClick={handleApplyManualRange}
            disabled={startMin === "" || startSec === ""}
          >
            Aplicar
          </Button>
        </div>

      {/* Gráficos */}
      <div>
        {variableA && (
          <div className={variableB ? "mb-10" : ""}>
            <ResponsiveContainer width="100%" height={variableB ? 220 : 340}>
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Hora" interval="preserveStartEnd" tick={{ dy: 10 }} />
                <YAxis
                  tick={{ dx: -5 }}
                  domain={[0, 100]}
                  ticks={Array.from({ length: 11 }, (_, i) => i * 10)}
                  allowDecimals={false}
                  interval={0}
                  width={42}
                  tickMargin={6}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey={variableA}
                  stroke="var(--color-neutral)"
                  strokeWidth={2}
                  dot={{ stroke: "var(--color-neutral)", strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ stroke: "var(--color-neutral)", strokeWidth: 3, fill: '#fff', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="text-center font-semibold mt-2 text-primary-text">
              {variablesLabels[variableA] || variableA.replace(/_/g, " ")}
            </div>
          </div>
        )}
        {variableB && (
          <div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Hora" interval="preserveStartEnd" tick={{ dy: 10 }} />
                <YAxis
                  tick={{ dx: -5 }}
                  domain={[0, 100]}
                  ticks={Array.from({ length: 11 }, (_, i) => i * 10)}
                  allowDecimals={false}
                  interval={0}
                  width={42}
                  tickMargin={6}
                />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey={variableB}
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={{ stroke: "var(--color-primary)", strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ stroke: "var(--color-primary)", strokeWidth: 3, fill: '#fff', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="text-center font-semibold mt-2 text-primary-text">
              {variablesLabels[variableB] || variableB.replace(/_/g, " ")}
            </div>
          </div>
        )}
      </div>

      {/* Slider de tiempo debajo de los gráficos */}
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
  );
}
