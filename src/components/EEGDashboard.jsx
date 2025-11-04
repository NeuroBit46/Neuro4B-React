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
import { ChevronDown } from "lucide-react";

export default function EEGDashboard({ workerId }) {
  const [data, setData] = useState([]);
  const [averages, setAverages] = useState({});
  const [variableA, setVariableA] = useState("Atencion");
  const [variableB, setVariableB] = useState("");
  const [range, setRange] = useState([0, data.length > 0 ? data.length - 1 : 0]);
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
    if (!Array.isArray(data) || data.length === 0) return;
    setRange([0, data.length - 1]);
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

  useEffect(() => {
    if (!parsedData.length) return;
    // Inicio
    const [startIdx, endIdx] = range;
    const startHora = parsedData[startIdx]?.Hora || "00:00";
    const endHora = parsedData[endIdx]?.Hora || "00:00";
    const [startMinVal, startSecVal] = startHora.split(":");
    const [endMinVal, endSecVal] = endHora.split(":");
    setStartMin(startMinVal || "");
    setStartSec(startSecVal || "");
    setEndMin(endMinVal || "");
    setEndSec(endSecVal || "");
  }, [range, parsedData]);

  return (
    <div className="bg-white p-4 rounded-sm shadow-xs text-xs text-neutral">
      {/* Fila de selectores, filtro de tiempo y promedios */}
      <div className="flex gap-6 items-center justify-between mb-2">
        {/* Selectores a la izquierda */}
        <div className="flex gap-4">
          <Select value={variableA} onValueChange={setVariableA}>
            <SelectTrigger className="w-55 cursor-pointer glass-neutral-bg text-sm">
              <SelectValue placeholder="Variable 1" />
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </SelectTrigger>
            <SelectContent>
              {options.map(({ key, label }) => (
                <SelectItem
                  key={key}
                  value={key}
                  disabled={key === variableB}
                  className="cursor-pointer text-sm"
                >
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={variableB} onValueChange={v => setVariableB(v === "__none__" ? "" : v)}>
            <SelectTrigger className="w-55 cursor-pointer glass-primary-bg text-sm">
              <SelectValue placeholder="Variable 2 (opcional)" />
              <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem key="__none__" value="__none__" className="cursor-pointer text-sm">
                Ninguna
              </SelectItem>
              {options.map(({ key, label }) => (
                <SelectItem
                  key={key}
                  value={key}
                  disabled={key === variableA}
                  className="cursor-pointer text-sm"
                >
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Filtro de tiempo exacto al centro */}
        <div className="flex w-fit items-center gap-2 bg-neutral/10 px-6 py-1 rounded-md bg-primary-bg shadow-xs border border-neutral/30">
          <span className="text-sm font-medium text-secondary-text mr-2">Inicio</span>
          <Input
            type="number"
            min={0}
            max={59}
            value={startMin}
            onChange={e => setStartMin(e.target.value.replace(/\D/, ""))}
            placeholder="mm"
            className="w-12 h-8 text-center text-sm input-no-spinner bg-white"
          />
          <span>:</span>
          <Input
            type="number"
            min={0}
            max={59}
            value={startSec}
            onChange={e => setStartSec(e.target.value.replace(/\D/, ""))}
            placeholder="ss"
            className="w-12 input-no-spinner text-center text-sm h-8 bg-white"
          />
          <span className="mx-2 text-sm font-medium text-secondary-text">Fin</span>
          <Input
            type="number"
            min={0}
            max={59}
            value={endMin}
            onChange={e => setEndMin(e.target.value.replace(/\D/, ""))}
            placeholder="mm"
            className="w-12 h-8 text-center text-sm input-no-spinner bg-white"
          />
          <span>:</span>
          <Input
            type="number"
            min={0}
            max={59}
            value={endSec}
            onChange={e => setEndSec(e.target.value.replace(/\D/, ""))}
            placeholder="ss"
            className="w-12 h-8 text-center text-sm input-no-spinner bg-white"
          />
          <Button
            size="sm"
            variant="secondary"
            className="ml-2"
            onClick={handleApplyManualRange}
            disabled={startMin === "" || startSec === ""}
          >
            Aplicar
          </Button>
        </div>

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
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="bg-white rounded shadow-xs px-3 py-2 text-xs">
                        <div className="font-semibold text-primary-text/65">{label}</div>
                        {payload.map((entry, idx) => (
                          <div key={idx} className="mt-1">
                            <span className="font-medium">{entry.name}:</span>{" "}
                            <span>{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
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
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload || !payload.length) return null;
                    return (
                      <div className="bg-white rounded shadow-xs px-3 py-2 text-xs">
                        <div className="font-semibold text-primary-text/65">{label}</div>
                        {payload.map((entry, idx) => (
                          <div key={idx} className="mt-1">
                            <span className="font-medium">{entry.name}:</span>{" "}
                            <span>{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
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
      <div className="my-4">
        <Slider
          value={range}
          onValueChange={setRange}
          min={0}
          max={parsedData.length - 1}
          step={1}
          className="w-full"
        />
        {/* <div className="flex justify-center gap-3 text-sm mt-2 text-primary-text">
          <span>{parsedData[range[0]]?.Hora}</span>
          <span>-</span>
          <span>{parsedData[range[1]]?.Hora}</span>
        </div> */}
      </div>

        {/* Promedio(s) a la derecha */}
        <div className="flex gap-4 ml-auto mt-2">
          {variableA && averages[variableA] != null && (
            <AverageCard
              icon={Activity}
              variableName={`${variablesLabels[variableA] || variableA.replace(/_/g, " ")} promedio`}
              average={averages[variableA].toFixed(2)}
              color="neutral"
            />
          )}
          {variableB && averages[variableB] != null && (
            <AverageCard
              icon={Activity}
              variableName={`${variablesLabels[variableB] || variableB.replace(/_/g, " ")} promedio`}
              average={averages[variableB].toFixed(2)}
              color="primary"
            />
          )}
        </div>
    </div>
  );
}
