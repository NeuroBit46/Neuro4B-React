// filepath: c:\Users\vania\OneDrive\Documentos\GitHub\Neuro4B-React\src\components\WordPreview.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { renderAsync } from "docx-preview";

export default function WordPreview({
  file,
  onLoadEnd,
  className = "",
  zoom = 1
}) {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadDocx = useCallback(async () => {
    if (!file) return;
    setError(null);
    setLoading(true);
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
        throw new Error("Formato de entrada no soportado");
      }

      if (!containerRef.current) return;

      // Limpia render previo
      containerRef.current.innerHTML = "";

      await renderAsync(arrayBuffer, containerRef.current, null, {
        inWrapper: true,
        ignoreLastRenderedPageBreak: true,
        experimental: true,
        className: "docx-wrapper",
        useBase64URL: true,
        breakPages: true,
        // Desactiva si prefieres fuentes del sistema
        renderHeaders: true,
        renderFooters: true
      });

      if (aborted) return;
    } catch (e) {
      if (!aborted) setError(e.message || "Error leyendo DOCX");
    } finally {
      if (!aborted) {
        setLoading(false);
        onLoadEnd && onLoadEnd();
      }
    }

    return () => {
      aborted = true;
    };
  }, [file, onLoadEnd]);

  useEffect(() => {
    loadDocx();
  }, [loadDocx]);

  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      <div className="flex items-center gap-4 mb-2 text-xs text-secondary-text">
        {loading && <span>Cargando documento...</span>}
        {error && <span className="text-red-500">Error: {error}</span>}
        {!loading && !error && file && <span>Listo</span>}
      </div>
      <div
        className="relative flex-1 overflow-auto bg-neutral-200/60 dark:bg-zinc-800/60 rounded-md p-4"
        style={{
          WebkitOverflowScrolling: "touch"
        }}
      >
        <div
          ref={containerRef}
          className="docx-preview-scale"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
            transition: "transform 0.2s"
          }}
        />
      </div>
    </div>
  );
}