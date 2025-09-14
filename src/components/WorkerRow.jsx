import { Icons } from "../constants/Icons";
import { useNavigate } from "react-router-dom";
import OptionsDropdown from "./OptionsDropdown";
import ConfirmModal from "./ConfirmModal";
import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function WorkerRow({
  id,
  name,
  company,
  date,
  pdf,
  excel,
  isSelected,
  onSelect,
  actionsMode,
  onDeleteSuccess,
  onArchivoClick,
}) {
  const navigate = useNavigate();
  const [showConfirm, setShowConfirm] = useState(false);

  const normalizeRuta = (ruta) =>
    ruta.startsWith("archivos/") ? `/media/${ruta}` : ruta;

  const pdfRuta = pdf ? normalizeRuta(pdf) : null;
  const excelRuta = excel ? normalizeRuta(excel) : null;
  const informeRuta = null;

  const handlePdfClick = () => {
    if (!pdfRuta) return;

    onArchivoClick({
      name: `PDF de ${name}`,
      url: pdfRuta,
      type: "pdf",
    });
  };

  const handleExcelClick = () => {
    if (!excelRuta) return;

    onArchivoClick({
      name: `${name}-EEG.xlsx`,
      url: excelRuta,
      type: "excel",
    });
  };

  const handleEliminar = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/eliminar/${id}/`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("No se pudo eliminar");

      onDeleteSuccess?.(id);
    } catch (err) {
      console.error("Error eliminando trabajador:", err);
    } finally {
      setShowConfirm(false);
    }
  };

  return (
    <>
    <div className="grid grid-cols-[1.5fr_2fr_1fr_0.8fr_0.8fr_0.8fr_0.8fr] min-w-[250px] gap-2 bg-primary-bg rounded-sm py-2.5 px-4 items-center text-xs">
      {/* Nombre */}
      <div className="flex font-medium text-left text-primary-text items-center">
        <span className="text-primary pr-4 text-3xl">
          {Icons.workers("text-xl", "text-primary")}
        </span>
        {name}
      </div>

      {/* Empresa */}
      <div className="justify-self-center px-2 text-primary bg-success rounded-sm max-w-[12rem] overflow-hidden text-ellipsis whitespace-nowrap">
        {company}
      </div>

      {/* Fecha */}
      <div className="text-center text-primary-text">{date}</div>

      {/* PDF */}
      <div
        className={`inline-flex justify-center ${
          pdfRuta ? "cursor-pointer text-primary" : "text-secondary-text"
        }`}
        onClick={handlePdfClick}
        title={pdfRuta ? "Ver PDF" : "No disponible"}
        role="button"
      >
        {Icons.pdf(!!pdfRuta)}
      </div>

      {/* Excel */}
      <div
        className={`inline-flex justify-center ${
          excelRuta ? "cursor-pointer text-primary" : "text-secondary-text"
        }`}
        onClick={handleExcelClick}
        title={excelRuta ? "Ver EEG" : "No disponible"}
        role="button"
      >
        {Icons.excel(!!excelRuta)}
      </div>
      <div
        className={`inline-flex justify-center ${
          informeRuta ? "cursor-pointer text-primary" : "text-secondary-text"
        }`}
        onClick={handlePdfClick}
        title={informeRuta ? "Ver PDF" : "No disponible"}
        role="button"
      >
        {Icons.word(!!informeRuta)}
      </div>

      {/* Acciones / Selector */}
      <div className="inline-flex items-center justify-center">
        {actionsMode ? (
          <OptionsDropdown
            onVer={() => navigate(`/detalles-trabajador/${id}`)}
            onEditar={() => navigate(`/editar-trabajador/${id}`)}
            onEliminar={() => setShowConfirm(true)}
          />
          ) : (
            <div
              className="cursor-pointer inline-flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
              onClick={onSelect}
              role="checkbox"
              aria-checked={isSelected}
              title={isSelected ? "Seleccionado" : "Seleccionar"}
            >
              {Icons.selector(isSelected)}
            </div>
          )}
      </div>
    </div>
    <ConfirmModal
        open={showConfirm}
        title="Eliminar trabajador"
        message={`¿Seguro que desea eliminar a ${name}? Esta acción no se puede deshacer.`}
        onConfirm={handleEliminar}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
