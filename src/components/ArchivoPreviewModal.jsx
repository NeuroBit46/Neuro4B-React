import { useEffect, useState } from "react";
import PdfPreview from "./PdfPreview";
import ExcelPreview from "./ExcelPreview";
import WordPreview from "./WordPreview";
import { formatBytes, formatDate } from "../utils/fileUtils";
import { Icons } from "../constants/Icons";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function ArchivoPreviewModal({ file, onClose }) {
  const [tipo, setTipo] = useState("desconocido");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  useEffect(() => {
    setLoading(true);
    if (!file || typeof file !== "object" || !file.url) {
      setTipo("desconocido");
      return;
    }
    if (file.type) {
      const t = file.type.toLowerCase();
      if (t.includes("pdf")) setTipo("pdf");
      else if (
        t.includes("sheet") ||
        t.includes("excel") ||
        t.includes("spreadsheet")
      ) setTipo("excel");
      else if (
        t.includes("word") ||
        t.includes("officedocument.wordprocessingml")
      ) setTipo("word");
      else setTipo("desconocido");
    } else {
      const ext = file.url.split(".").pop().toLowerCase();
      if (ext === "pdf") setTipo("pdf");
      else if (["xls", "xlsx"].includes(ext)) setTipo("excel");
      else if (["doc", "docx"].includes(ext)) setTipo("word");
      else setTipo("desconocido");
    }
  }, [file]);

  const isPublicFile =
    file.url?.startsWith("/plantillas/") ||
    file.url?.startsWith("/pdfs/") ||
    file.url?.startsWith("/public/");

  const fullUrl = file.url?.startsWith("/media/")
    ? `${API_BASE}${file.url}`
    : isPublicFile
    ? file.url
    : file.url?.startsWith("http")
    ? file.url
    : `${API_BASE}/${file.url?.replace(/^\/+/, "")}`;

  const renderVista = () => {
    if (!file || !file.url) return null;

    let preview = null;
    if (tipo === "pdf") {
      preview = <PdfPreview src={fullUrl} onLoadEnd={() => setLoading(false)} />;
    } else if (tipo === "excel") {
      preview = <ExcelPreview file={fullUrl} onLoadEnd={() => setLoading(false)} />;
    } else if (tipo === "word") {
      preview = <WordPreview file={fullUrl} onLoadEnd={() => setLoading(false)} zoom={0.9} />;
    }

    return (
      <div className="relative min-h-[220px]">
        {(tipo === "pdf" || tipo === "excel" || tipo === "word") && preview}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-zinc-900/70 z-10">
            <p className="text-center text-gray-500 dark:text-gray-300 italic py-6">
              ⏳ Cargando archivo...
            </p>
          </div>
        )}
        {!loading && tipo === "desconocido" && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <p className="text-center text-red-500 italic py-6">
              ⚠️ Formato no soportado.
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 glass-secondary-bg z-50 flex items-center justify-center min-h-screen">
      <div
        className={`bg-primary-bg rounded-xl p-6 w-full max-w-4xl max-h-[90vh] shadow-xl overflow-y-auto border-l-4 ${
          tipo === "excel"
            ? "border-primary"
            : tipo === "word"
            ? "border-high"
            : "border-secondary"
        } flex flex-col gap-4`}
      >
        {/* Encabezado */}
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">
            {file?.name || "Vista previa"}
          </h2>
          <button
            onClick={onClose}
            className="text-secondary-text cursor-pointer hover:text-secondary text-sm transition-colors duration-200"
          >
            {Icons.close("text-2xl", "text-current")}
          </button>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 text-sm">
          {file?.size > 0 && (
            <span className="bg-gray-200 px-2 py-1 rounded-full">
              📦 {formatBytes(file.size)}
            </span>
          )}
          {file?.uploadedAt && (
            <span className="bg-gray-200 px-2 py-1 rounded-full">
              🗓️ {formatDate(file.uploadedAt)}
            </span>
          )}
          <span className="bg-gray-200 px-2 py-1 rounded-full">
            📁 {tipo.toUpperCase()}
          </span>

          {/* Descargar */}
          {file?.url && (
            <a
              href={fullUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sm ml-auto relative group font-medium ${
                tipo === "excel"
                  ? "text-primary"
                  : tipo === "word"
                  ? "text-high"
                  : "text-secondary"
              }`}
            >
              <span className="relative z-10">Descargar</span>
              <span
                className={`absolute bottom-0 left-0 w-full h-0.5 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-200 ${
                  tipo === "excel"
                    ? "bg-primary"
                    : tipo === "word"
                    ? "bg-high"
                    : "bg-secondary"
                }`}
              />
            </a>
          )}
        </div>

        {/* Vista previa */}
        <div className="bg-gray-100 p-4 rounded-md flex-1 overflow-auto">
          {renderVista()}
        </div>
      </div>
    </div>
  );
}
