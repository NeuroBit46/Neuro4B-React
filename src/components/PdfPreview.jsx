import { useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf-worker/pdf.worker.min.js";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function PdfPreview({ src, onLoadEnd }) {
  const [numPages, setNumPages] = useState(null);
  const [customError, setCustomError] = useState(null);

  // 🧠 Extrae la URL segura desde src
  const rawUrl =
    typeof src === "string"
      ? src
      : src?.url && typeof src.url === "string"
      ? src.url
      : null;

  // 🔍 Detecta si es ruta local del frontend
  const isPublicFile =
    rawUrl?.startsWith("/plantillas/") ||
    rawUrl?.startsWith("/pdfs/") ||
    rawUrl?.startsWith("/public/");

  // 🔧 Construye la URL final
  const url = useMemo(() => {
    if (!rawUrl) return null;

    if (rawUrl.startsWith("http") || rawUrl.startsWith("./")) return rawUrl;
    if (isPublicFile) return rawUrl;
    if (rawUrl.startsWith("/media/")) return `${API_BASE}${rawUrl}`;

    return `${API_BASE}/${rawUrl.replace(/^\/+/, "")}`;
  }, [rawUrl]);

  // ✅ Verifica que sea una URL válida de PDF
  const isValidUrl =
    typeof url === "string" &&
    (url.startsWith("/") || url.startsWith("http") || url.startsWith("./")) &&
    url.endsWith(".pdf");

  const memoizedFile = useMemo(() => (isValidUrl ? { url } : null), [url]);

  if (!isValidUrl || !memoizedFile) {
    if (onLoadEnd) onLoadEnd();
    return (
      <div className="text-red-500 italic text-center py-4">
        ⚠️ PDF inválido. Verifica que la URL esté completa y apunte a un archivo .pdf
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto">
      <Document
        file={memoizedFile}
        onLoadSuccess={({ numPages }) => {
          setNumPages(numPages);
          if (onLoadEnd) onLoadEnd();
        }}
        onLoadError={(error) => {
          console.error("Error al cargar el PDF:", error);
          if (error.message?.includes("Unexpected token")) {
            setCustomError("El archivo recibido no es un PDF válido.");
          } else {
            setCustomError("No se pudo cargar el archivo. Inténtalo de nuevo.");
          }
          if (onLoadEnd) onLoadEnd();
        }}
        loading={<span className="text-base text-secondary-text">Cargando PDF...</span>}
        error={
          <div className="text-base text-red-500 italic text-center">
            {customError ||
              "No se pudo mostrar la vista previa del PDF. Verifica que el archivo esté disponible."}
          </div>
        }
      >
        <div className="flex flex-col items-center gap-6 py-4">
          {Array.from({ length: numPages }, (_, i) => (
            <Page
              key={`page_${i}`}
              pageNumber={i + 1}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              scale={1.0}
              width={800}
            />
          ))}
        </div>
      </Document>
    </div>
  );
}
