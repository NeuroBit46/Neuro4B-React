import { useState, useEffect, useRef } from 'react';
import ButtonBase from './ButtonBase';
import useWorkers from './UseWorkers';
import { Badge } from '@/components/ui/badge'; // <-- agregado

export default function ButtonCreateReport({
  buttonLabel = 'Generar informe',
  requireTemplate = false,
  selectedWorkers = [],
  selectedTpl = null,
  autoDownload = false,
}) {
  const { workers } = useWorkers();

  const [isReady, setIsReady] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [error, setError] = useState(null);
  const [generatedFileName, setGeneratedFileName] = useState('');

  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressTimerRef = useRef(null);

  const canGenerate = requireTemplate
    ? selectedWorkers.length > 0 && selectedTpl !== null
    : selectedWorkers.length > 0;

  const sanitizeFileName = (s) =>
    String(s).replace(/[\\/:*?"<>|]/g, '-').trim();

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

  const generateReport = async () => {
    if (!canGenerate || generating) return;

    setError(null);
    setIsReady(false);
    setGenerating(true);
    setProgress(0);
    startProgressSim();

    const pk = selectedWorkers[0];
    const workerObj = workers.find((w) => w.id === pk);
    const name = workerObj?.nombre?.trim() || `Trabajador ${pk}`;
    const tplLabel =
      selectedTpl?.label ||
      selectedTpl?.name ||
      'Informe';
    const fileName = sanitizeFileName(`${tplLabel} ${name} - Neuro4B.docx`);

    try {
      revokePreviousUrl();

      const response = await fetch(`/api/descargar-informe/${pk}/`);
      if (!response.ok) {
        stopProgressSim(100);
        setGenerating(false);
        setError('No se pudo generar el informe. Intente nuevamente.');
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      stopProgressSim(100);

      setGeneratedFileName(fileName);
      setFileUrl(url);
      setIsReady(true);

      setTimeout(() => setGenerating(false), 420);

      if (autoDownload) {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
      }
    } catch (e) {
      console.error(e);
      stopProgressSim(100);
      setGenerating(false);
      setError('No se pudo generar el informe. Revisa tu conexión.');
    }
  };

  const handleDownload = () => {
    if (!fileUrl) return;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = generatedFileName || 'informe.docx';
    link.click();
  };

  const pct = Math.min(100, Math.round(progress));

  return (
    <div className="mt-4">
      <div className="flex items-center justify-center gap-4 flex-wrap" aria-live="polite">
        {/* Botón con progreso embebido */}
        <div className="relative">
          <ButtonBase
            onClick={generateReport}
            disabled={!canGenerate || generating}
            variant="primary"
            size="md"
            className="relative overflow-hidden min-w-[170px] justify-center"
            isLoading={false}
          >
            <span className="relative z-10 flex items-center gap-1.5">
              {generating ? 'Generando…' : buttonLabel}
            </span>
            {generating && (
              <span
                className="absolute inset-0 -z-0 bg-gradient-to-r from-primary/25 via-primary/35 to-primary/25"
                style={{
                  clipPath: `inset(0 ${100 - pct}% 0 0)`,
                  transition: 'clip-path 0.35s ease',
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
                  transition: 'width 0.35s cubic-bezier(.4,.8,.4,1)',
                }}
              />
            </div>
          )}
        </div>

        {/* Estado dinámico */}
        {generating && (
          <div className="flex items-center gap-2 text-[11px] text-secondary-text">
            <div className="px-2 py-1 rounded-full bg-muted/60 border border-border/60 backdrop-blur-sm font-medium tabular-nums">
              {pct}%
            </div>
            <span className="hidden sm:inline text-secondary-text/70">
              Procesando…
            </span>
          </div>
        )}

        {!generating && isReady && !error && (
          <div className="flex items-center gap-3 text-xs text-primary-text flex-wrap max-w-[420px]">
            <Badge
              variant="outline"
              className="h-5 px-2 py-0 text-[10px] font-medium border-primary/50 text-primary bg-primary/10 tracking-wide"
            >
              LISTO
            </Badge>
            <span className="truncate text-[11px]" title={generatedFileName}>
              {generatedFileName}
            </span>
            <button
              onClick={handleDownload}
              className="text-[11px] font-medium px-2 py-1 rounded-sm border border-primary/30 text-primary hover:bg-primary/10 transition"
            >
              Descargar
            </button>
          </div>
        )}

        {!generating && error && (
          <div className="flex items-center gap-2 text-[11px] text-secondary-text/80 max-w-[300px]">
            <Badge
              variant="outline"
              className="h-5 px-2 py-0 text-[10px] font-medium border-amber-500/40 text-amber-600 bg-amber-500/10"
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
