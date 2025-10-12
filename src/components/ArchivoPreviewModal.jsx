import { useEffect, useMemo, useState, useCallback } from "react";
import PdfPreview from "./PdfPreview";
import ExcelPreview from "./ExcelPreview";
import WordPreview from "./WordPreview";
import { formatBytes, formatDate } from "../utils/fileUtils";
import { Icons } from "../constants/Icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const API_BASE = import.meta.env.VITE_API_BASE;

export default function ArchivoPreviewModal({ file, onClose }) {
  const [tipo, setTipo] = useState("desconocido");
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ columnsCount: 0, rowsCount: 0 });

  // Evita recrear la función en cada render
  const handleMeta = useCallback(
    (m) => setMeta({ columnsCount: m?.columnsCount || 0, rowsCount: m?.rowsCount || 0 }),
    []
  );

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
      else if (t.includes("sheet") || t.includes("excel") || t.includes("spreadsheet")) setTipo("excel");
      else if (t.includes("word") || t.includes("officedocument.wordprocessingml")) setTipo("word");
      else setTipo("desconocido");
    } else {
      const ext = file.url.split(".").pop().toLowerCase();
      if (ext === "pdf") setTipo("pdf");
      else if (["xls", "xlsx", "csv"].includes(ext)) setTipo("excel");
      else if (["doc", "docx"].includes(ext)) setTipo("word");
      else setTipo("desconocido");
    }
  }, [file]);

  const isPublicFile =
    file?.url?.startsWith("/plantillas/") ||
    file?.url?.startsWith("/pdfs/") ||
    file?.url?.startsWith("/public/");

  const fullUrl = useMemo(() => {
    if (!file?.url) return "";
    return file.url.startsWith("/media/")
      ? `${API_BASE}${file.url}`
      : isPublicFile
      ? file.url
      : file.url.startsWith("http")
      ? file.url
      : `${API_BASE}/${file.url.replace(/^\/+/, "")}`;
  }, [file, isPublicFile]);

  const title = file?.name || "Vista previa";

  const renderVista = () => {
    if (!file || !file.url) return null;
    if (tipo === "pdf") {
      return <PdfPreview src={fullUrl} onLoadEnd={() => setLoading(false)} />;
    }
    if (tipo === "excel") {
      return (
        <ExcelPreview
          file={fullUrl}
          onLoadEnd={() => setLoading(false)}
          onMetaChange={handleMeta}
        />
      );
    }
    if (tipo === "word") {
      return <WordPreview file={fullUrl} onLoadEnd={() => setLoading(false)} zoom={0.9} />;
    }
    return null;
  };

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose?.(); }}>
      {/* Altura explícita: permite que h-full de los hijos funcione y haya scroll */}
      <DialogContent className="min-w-2xl h-[85vh] p-0 flex flex-col min-h-0 [&>button]:hidden">
        <DialogHeader className="px-6 pt-5 pb-0">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <DialogTitle className="truncate">{title}</DialogTitle>

              {/* DialogDescription debe contener solo texto (renderiza <p>) */}
              <DialogDescription className="sr-only">
                Vista previa del archivo
              </DialogDescription>

              {/* Badges y metadatos fuera del <p> de DialogDescription */}
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                {file?.size > 0 && (
                  <Badge variant="secondary">📦 {formatBytes(file.size)}</Badge>
                )}
                {file?.uploadedAt && (
                  <Badge variant="secondary">🗓️ {formatDate(file.uploadedAt)}</Badge>
                )}
                <Badge variant={tipo === "excel" ? "default" : "secondary"}>
                  {tipo.toUpperCase()}
                </Badge>
                {tipo === "excel" && (
                  <>
                    <Badge variant="outline">{meta.columnsCount} columnas</Badge>
                    <Badge variant="outline">{meta.rowsCount} filas</Badge>
                  </>
                )}
              </div>
            </div>

            {/* Descargar */}
            {file?.url && (
              <Button asChild variant={tipo === "excel" ? "default" : "secondary"} size="sm" className="shrink-0">
                <a href={fullUrl} target="_blank" rel="noopener noreferrer">Descargar</a>
              </Button>
            )}
          </div>
        </DialogHeader>

        <Separator />

        {/* Body ocupa el alto restante del modal (altura definida) */}
        <div className="relative px-4 flex-1 min-h-0 overflow-hidden">
          {/* Wrapper que da altura explícita a los previews */}
          <div className="h-full min-h-0">
            {tipo === "excel" && (
              <ExcelPreview
                file={fullUrl}
                onLoadEnd={() => setLoading(false)}
                onMetaChange={handleMeta}
                height="100%"   // ahora 100% es altura real
              />
            )}

            {tipo === "pdf" && (
              <div className="h-full min-h-0">
                <PdfPreview
                  src={fullUrl}
                  onLoadEnd={() => setLoading(false)}
                />
              </div>
            )}

            {tipo === "word" && (
              <div className="h-full min-h-0">
                <WordPreview
                  file={fullUrl}
                  onLoadEnd={() => setLoading(false)}
                  zoom={0.9}
                />
              </div>
            )}
          </div>

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-zinc-900/70 z-10">
              <p className="text-center text-gray-500 dark:text-gray-300 italic py-6">
                ⏳ Cargando archivo...
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 pb-5">
          <Button variant="outline" onClick={onClose} className="ml-auto">Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
