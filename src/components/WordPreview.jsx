// filepath: c:\Users\vania\OneDrive\Documentos\GitHub\Neuro4B-React\src\components\WordPreview.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { renderAsync } from "docx-preview";

export default function WordPreview({ file, onLoadEnd, className = "" }) {
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
      containerRef.current.innerHTML = "";

      await renderAsync(arrayBuffer, containerRef.current, null, {
        inWrapper: true,
        breakPages: true,
        useBase64URL: true,
        experimental: true,
        className: "docx-wrapper"
      });

      // Ajusta cada página para que imite estilo PDF
      const pages = containerRef.current.querySelectorAll(".docx");
      pages.forEach((p, idx) => {
        p.classList.add("word-page");
        p.setAttribute("data-page-number", idx + 1);
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
    <div className={`w-full h-full overflow-auto ${className}`}>
      <div className="flex items-center gap-4 mb-2 text-xs text-high">
        {loading && <span>Cargando documento...</span>}
        {error && <span className="text-red-500">Error: {error}</span>}
        {!loading && !error && file && <span className="text-high">Listo</span>}
      </div>
      {error && (
        <div className="text-red-500 italic py-4 text-center">
          {error}
        </div>
      )}
      {!error && (
        <div className="flex flex-col items-center gap-6 py-4">
          <div ref={containerRef} className="flex flex-col items-center gap-6 w-full" />
        </div>
      )}
    </div>
  );
}