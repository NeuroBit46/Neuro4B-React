import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

pdfjs.GlobalWorkerOptions.workerSrc = "/pdf-worker/pdf.worker.min.js";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function PdfPreview({ src, onLoadEnd }) {
  const [numPages, setNumPages] = useState(null);
  const [customError, setCustomError] = useState(null);

  // ancho del viewport del ScrollArea (para renderizar páginas responsive)
  const viewportRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(800);

  // Normaliza la URL
  const rawUrl =
    typeof src === "string" ? src : src?.url && typeof src.url === "string" ? src.url : null;

  const isPublicFile =
    rawUrl?.startsWith("/plantillas/") ||
    rawUrl?.startsWith("/pdfs/") ||
    rawUrl?.startsWith("/public/");

  const url = useMemo(() => {
    if (!rawUrl) return null;
    if (rawUrl.startsWith("http") || rawUrl.startsWith("./")) return rawUrl;
    if (isPublicFile) return rawUrl;
    if (rawUrl.startsWith("/media/")) return `${API_BASE}${rawUrl}`;
    return `${API_BASE}/${rawUrl.replace(/^\/+/, "")}`;
  }, [rawUrl]);

  const isValidUrl =
    typeof url === "string" && (url.startsWith("/") || url.startsWith("http") || url.startsWith("./"));

  const fileProp = useMemo(
    () => (isValidUrl ? { url, withCredentials: true } : null),
    [isValidUrl, url]
  );

  // Observa tamaño del viewport del ScrollArea
  useEffect(() => {
    if (!viewportRef.current) return;
    const ro = new ResizeObserver(() => {
      const w = viewportRef.current.clientWidth || 800;
      setViewportWidth(Math.max(320, Math.min(w, 2000)));
    });
    ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, []);

  if (!fileProp) {
    onLoadEnd?.();
    return (
      <div className="text-red-500 italic text-center py-4">
        No se pudo construir la URL del PDF.
      </div>
    );
  }

  return (
    <div className="h-full w-full min-h-0">
      {/* Scroll de shadcn en todo el PDF */}
      <ScrollArea type="auto" className="h-full w-full [--scrollbar-size:12px] pr-2 pb-2">
        {/* Este div es el viewport observado (ancho responsive) */}
        <div ref={viewportRef} className="w-full">
          <Document
            file={fileProp}
            onLoadSuccess={({ numPages }) => {
              setNumPages(numPages);
              onLoadEnd?.();
            }}
            onLoadError={(error) => {
              console.error("Error al cargar el PDF:", error);
              setCustomError("No se pudo cargar el PDF.");
              onLoadEnd?.();
            }}
            loading={<span className="text-sm text-muted-foreground">Cargando PDF…</span>}
            error={
              <div className="text-sm text-red-500 italic text-center">
                {customError || "No se pudo mostrar la vista previa del PDF."}
              </div>
            }
          >
            <div className="flex flex-col items-center gap-6 py-4">
              {Array.from({ length: numPages || 0 }, (_, i) => (
                <Page
                  key={`page_${i}`}
                  pageNumber={i + 1}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  width={viewportWidth} // se adapta al ancho visible
                />
              ))}
            </div>
          </Document>
        </div>

        <ScrollBar orientation="vertical" forceMount className="z-30" />
        <ScrollBar orientation="horizontal" forceMount className="z-30" />
      </ScrollArea>
    </div>
  );
}
