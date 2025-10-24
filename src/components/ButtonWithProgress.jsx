import { useState, useRef, useEffect } from "react";
import ButtonBase from "./ButtonBase";
import { Badge } from "@/components/ui/badge";

export default function ButtonWithProgress({
  buttonLabel = "Acción",
  onAction, // función async que retorna { blob, fileName } o { url, fileName }
  disabled = false,
  autoDownload = false,
  progressText = "Procesando…",
  readyText = "LISTO",
  errorText = "No se pudo completar la acción.",
  downloadLabel = "Descargar",
  fileName: fileNameProp,
  variant = "neutral",
  size = "md",
  minWidth = 170,
  allowNoFile = false,
  showDownload = true, // <-- si usas esta prop
  ...rest
}) {
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [error, setError] = useState(null);
  const [generatedFileName, setGeneratedFileName] = useState(fileNameProp || "");
  const progressTimerRef = useRef(null);

  const sanitizeFileName = (s) =>
    String(s).replace(/[\\/:*?"<>|]/g, "-").trim();

  const revokePreviousUrl = () => {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      setFileUrl(null);
    }
  };

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [fileUrl]);

  const startProgressSim = () => {
    setProgress(3);
    progressTimerRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 92) return p;
        const inc = p < 30 ? 1.4 : p < 60 ? 0.95 : 0.55;
        return Math.min(92, +(p + inc).toFixed(2));
      });
    }, 380);
  };

  const stopProgressSim = (final = 100) => {
    if (progressTimerRef.current) {
      clearInterval(progressTimerRef.current);
      progressTimerRef.current = null;
    }
    setProgress(final);
  };

  const handleAction = async () => {
    if (disabled || generating) return;
    setError(null);
    setIsReady(false);
    setGenerating(true);
    setProgress(0);
    startProgressSim();

    try {
      revokePreviousUrl();
      const result = await onAction();

      // Si es instantáneo, simula progreso al 100% durante 1 segundo
      if (result.instant) {
        stopProgressSim(100);
        setGeneratedFileName(result?.fileName ? sanitizeFileName(result.fileName) : "");
        setFileUrl(result.url || (result.blob ? URL.createObjectURL(result.blob) : null));
        setProgress(100);
        // Espera 1 segundo mostrando barra y número en 100%
        await new Promise((r) => setTimeout(r, 1000));
        setIsReady(true);
        setGenerating(false);
        return;
      }

      let url = result?.url;
      if (!url && result?.blob) {
        url = URL.createObjectURL(result.blob);
      }

      // Permitir éxito aunque no haya archivo si allowNoFile y hay nombre
      if (allowNoFile && !url && result?.nombre) {
        stopProgressSim(100);
        setGeneratedFileName(result?.nombre);
        setFileUrl(null);
        setIsReady(true);
        setGenerating(false);
        return;
      }

      if (!url) throw new Error("No se pudo obtener el archivo.");
      stopProgressSim(100);
      setGeneratedFileName(result?.fileName ? sanitizeFileName(result.fileName) : "");
      setFileUrl(url);
      setIsReady(true);
      setTimeout(() => setGenerating(false), 420);

      if (autoDownload) {
        const link = document.createElement("a");
        link.href = url;
        link.download = result?.fileName || "archivo";
        link.click();
      }
    } catch (e) {
      console.error(e);
      stopProgressSim(100);
      setGenerating(false);
      setError(errorText);
    }
  };

  const handleDownload = () => {
    if (!fileUrl) return;
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = generatedFileName || "archivo";
    link.click();
  };

  const pct = Math.min(100, Math.round(progress));

  return (
    <div className="mt-4">
      <div className="flex items-center justify-center gap-4 flex-wrap" aria-live="polite">
        <div className="relative">
          <ButtonBase
            onClick={handleAction}
            disabled={disabled || generating}
            variant={variant}
            size={size}
            className={`relative overflow-hidden min-w-[${minWidth}px] justify-center`}
            isLoading={false}
            {...rest}
          >
            <span className="relative z-10 flex items-center gap-1.5">
              {generating ? progressText : buttonLabel}
            </span>
            {generating && (
              <span
                className="absolute inset-0 -z-0 bg-gradient-to-r from-primary/25 via-primary/35 to-primary/25"
                style={{
                  clipPath: `inset(0 ${100 - pct}% 0 0)`,
                  transition: "clip-path 0.35s ease",
                }}
              />
            )}
          </ButtonBase>
          {generating && (
            <div className="absolute -bottom-1 left-0 h-[3px] w-full bg-primary/15 overflow-hidden rounded-sm">
              <div
                className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary rounded-sm"
                style={{
                  width: `${pct}%`,
                  transition: "width 0.35s cubic-bezier(.4,.8,.4,1)",
                }}
              />
            </div>
          )}
        </div>

        {generating && (
          <div className="flex items-center gap-2 text-xs text-secondary-text">
            <div className="px-2 py-1 rounded-full bg-muted/60 border border-border/60 backdrop-blur-sm font-medium tabular-nums">
              {pct}%
            </div>
            <span className="hidden sm:inline text-secondary-text/70">
              {progressText}
            </span>
          </div>
        )}

        {!generating && isReady && !error && (
          <div className="flex items-center gap-3 text-xs text-primary-text flex-wrap">
            <Badge
              variant="outline"
              className="h-5 px-2 py-0 text-xs font-medium border-primary/50 text-primary bg-primary/10 tracking-wide"
            >
              Listo
            </Badge>
            {allowNoFile && generatedFileName && !fileUrl ? (
              <span className="text-xs font-medium">
                {readyText}
              </span>
            ) : (
              <>
                <span className="truncate text-xs" title={generatedFileName}>
                  {generatedFileName}
                </span>
                {showDownload && downloadLabel && fileUrl && (
                  <button
                    onClick={handleDownload}
                    className="text-xs font-medium px-2 py-1 rounded-sm border border-primary/50 text-primary hover:bg-primary/75 hover:text-primary-bg transition cursor-pointer"
                  >
                    {downloadLabel}
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {!generating && error && (
          <div className="flex items-center gap-2 text-xs text-secondary-text/80 max-w-[300px]">
            <Badge
              variant="outline"
              className="h-5 px-2 py-0 text-xs font-medium border-amber-500/40 text-amber-600 bg-amber-500/10"
            >
              Aviso
            </Badge>
            <span className="leading-snug">
              {error}
            </span>
          </div>
        )}

        {generating && (
          <span className="sr-only">
            Progreso de generación {pct} por ciento
          </span>
        )}
      </div>
    </div>
  );
}