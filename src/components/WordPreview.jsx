// filepath: c:\Users\vania\OneDrive\Documentos\GitHub\Neuro4B-React\src\components\WordPreview.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { renderAsync } from "docx-preview";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function WordPreview({ file, onLoadEnd, className = "" }) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  const loadDocx = useCallback(async () => {
    if (!file) return;
    setError(null);
    setReady(false);
    let aborted = false;

    try {
      let arrayBuffer;
      if (file instanceof File) {
        arrayBuffer = await file.arrayBuffer();
      } else if (typeof file === "string") {
        const res = await fetch(file);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        arrayBuffer = await res.arrayBuffer();
      } else {
        throw new Error("Fuente de archivo no soportada");
      }

      if (!containerRef.current) return;
      containerRef.current.innerHTML = "";

      await renderAsync(arrayBuffer, containerRef.current, null, {
        inWrapper: true,
        breakPages: true,
        useBase64URL: true,
        experimental: true,
        className: "docx-wrapper"
      });

      // Ajustar páginas
      const pages = containerRef.current.querySelectorAll(".docx");
      pages.forEach((p, idx) => {
        p.classList.add("word-page");
        p.setAttribute("data-page-number", idx + 1);
      });

      if (aborted) return;
      setReady(true);
    } catch (e) {
      if (!aborted) setError(e.message || "Error leyendo DOCX");
    } finally {
      if (!aborted && onLoadEnd) onLoadEnd();
    }

    return () => { aborted = true; };
  }, [file, onLoadEnd]);

  useEffect(() => {
    loadDocx();
  }, [loadDocx]);

  return (
    <div className={`w-full h-full ${className}`}>
      {error && (
        <div className="text-red-500 italic text-center py-4">
          {error}
        </div>
      )}
      {!error && !ready && (
        <div className="flex justify-center py-6 text-secondary-text text-sm">
          Cargando documento...
        </div>
      )}
      {!error && (
        <ScrollArea type="auto" className="h-full w-full [--scrollbar-size:12px] pr-2 pb-2">
          <div className="flex flex-col items-center gap-6 py-4">
            <div ref={containerRef} className="flex flex-col items-center gap-6 w-full" />
          </div>
          <ScrollBar orientation="vertical" forceMount className="z-30" />
          <ScrollBar orientation="horizontal" forceMount className="z-30" />
        </ScrollArea>
      )}
    </div>
  );
}