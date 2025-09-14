import { useState, useEffect } from "react";
import WorkerRow from "../components/WorkerRow";
import ArchivoPreviewModal from "../components/ArchivoPreviewModal";
import useWorkers from "./UseWorkers";

export default function WorkersList({
  selectedWorkers,
  setSelectedWorkers,
  actionsMode,
  limitMode,
  textoBusqueda,
}) {
  const { workers: rawWorkers, setWorkers, loading } = useWorkers();
  const [archivoVisible, setArchivoVisible] = useState(null);
  const [filteredWorkers, setFilteredWorkers] = useState([]);

  const toggleWorker = (id) =>
    setSelectedWorkers((prev) => (prev[0] === id ? [] : [id]));

  const limpiarTildes = (txt) =>
    txt.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // 📅 Formato seguro sin desfase
  const formatFecha = (raw) => {
    if (!raw) return "—";
    // Tomar solo la parte de fecha si viene con hora UTC
    const dateOnly =
      typeof raw === "string" && raw.length > 10 ? raw.substring(0, 10) : raw;
    const fecha = new Date(`${dateOnly}T00:00:00`);
    return fecha.toLocaleDateString("es-CL", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const scrollClass =
    limitMode === "fixed"
      ? "max-h-[calc(4*3.5rem)] overflow-y-auto"
      : "max-h-[calc(100vh-14rem)] overflow-y-auto";

  const handleDeleteSuccess = (deletedId) => {
    setSelectedWorkers((prev) => prev.filter((id) => id !== deletedId));
    setWorkers((prev) => prev.filter((w) => w.id !== deletedId));
  };

  // 🔍 Filtrado + Ordenar por fecha/hora de creación más reciente primero
  useEffect(() => {
    const filtroTexto = limpiarTildes(textoBusqueda);

    const ordenados = [...rawWorkers].sort((a, b) => {
      // Si tienes un campo 'created_at', úsalo; si no, usa 'fecha'
      const fechaA = new Date(a.created_at || a.fecha);
      const fechaB = new Date(b.created_at || b.fecha);
      return fechaB - fechaA; // más reciente primero
    });

    const filtrados = ordenados.filter(
      (w) =>
        limpiarTildes(w.nombre).includes(filtroTexto) ||
        limpiarTildes(w.empresa).includes(filtroTexto)
    );

    setFilteredWorkers(filtrados);
  }, [textoBusqueda, rawWorkers]);

  return (
    <div className="space-y-4">
      <div className="bg-secondary-bg p-4 md:px-10 rounded-xs shadow-xs overflow-x-auto space-y-3">
        {/* Cabecera */}
        <div className="grid grid-cols-[1.5fr_2fr_1fr_0.8fr_0.8fr_0.8fr_0.8fr] min-w-[250px] gap-2 px-4 font-normal text-xs text-center text-primary-text">
          <span className="text-left pl-10">Nombre</span>
          <span>Empresa</span>
          <span>Fecha</span>
          <span>Nesplora</span>
          <span>EEG</span>
          <span>Informe</span>
          <span>{actionsMode ? "Acciones" : "Seleccionar"}</span>
        </div>

        {/* Lista */}
        <div className={`${scrollClass} space-y-1.5 min-w-full`}>
          {loading ? (
            <div className="text-center text-sm text-neutral-500 py-4">
              Cargando trabajadores...
            </div>
          ) : filteredWorkers.length === 0 ? (
            <div className="text-center text-sm text-neutral-500 py-4">
              No se encontraron trabajadores.
            </div>
          ) : (
            filteredWorkers.map((w) => (
              <WorkerRow
                key={w.id}
                id={w.id}
                name={w.nombre}
                company={w.empresa}
                date={formatFecha(w.fecha)}
                pdf={w.ruta_PDF}
                excel={w.ruta_EEG}
                informe={w.ruta_informe}
                isSelected={selectedWorkers.includes(w.id)}
                onSelect={() => toggleWorker(w.id)}
                actionsMode={actionsMode}
                onArchivoClick={setArchivoVisible}
                onDeleteSuccess={handleDeleteSuccess}
              />
            ))
          )}
        </div>
      </div>

      {/* Modal global */}
      {archivoVisible && (
        <ArchivoPreviewModal
          file={archivoVisible}
          onClose={() => setArchivoVisible(null)}
        />
      )}
    </div>
  );
}
