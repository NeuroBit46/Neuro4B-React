import { useState, useEffect, useRef } from 'react';
import ButtonBase from './ButtonBase';
import useWorkers from './UseWorkers';
import { Badge } from '@/components/ui/badge'; // <-- agregado

export default function ButtonTransformData({
  buttonLabel = 'Transformar datos',
  selectedWorkers = [],
  API_BASE = import.meta.env.VITE_API_BASE,
}) {
  const { workers } = useWorkers();

  // Estados
  const [isReady, setIsReady] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [generatedFileName, setGeneratedFileName] = useState('');
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  // Progreso simulado
  const [progress, setProgress] = useState(0);
  const progressTimerRef = useRef(null);

  const canTransform = selectedWorkers.length > 0;

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
    setProgress(2);
    progressTimerRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 92) return p;
        const inc = p < 30 ? 1.6 : p < 60 ? 1.0 : 0.55;
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

  const handleTransform = async () => {
    if (!canTransform || generating) return;

    setError(null);
    setIsReady(false);
    setGenerating(true);
    setProgress(0);
    startProgressSim();

    const workerId = selectedWorkers[0];
    const workerObj = workers.find(w => w.id === workerId);
    const name = workerObj?.nombre?.trim() || `Trabajador ${workerId}`;
    const date = workerObj?.fecha?.trim() || '';
    const fileName = sanitizeFileName(`Nesplora ${name} ${date}.xlsx`);
    setGeneratedFileName(fileName);

    try {
      revokePreviousUrl();

      // 1) intentar descargar existente
      let res = await fetch(`${API_BASE}/api/trabajador/${workerId}/descargar-excel`);
      if (!res.ok) {
        // 2) fallback conversión
        res = await fetch(`${API_BASE}/api/trabajadores/${workerId}/convertir-pdf/`, { method: 'POST' });
      }

      if (!res.ok) {
        stopProgressSim(100);
        setGenerating(false);
        setError('No se pudieron transformar los datos. Intenta de nuevo.');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      stopProgressSim(100);
      setFileUrl(url);
      setIsReady(true);
      setTimeout(() => setGenerating(false), 420);
    } catch (e) {
      console.error('Error transformación:', e);
      stopProgressSim(100);
      setGenerating(false);
      setError('No se pudieron transformar los datos. Revisa tu conexión.');
    }
  };

  const handleDownload = () => {
    if (!fileUrl) return;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = generatedFileName || 'datos-transformados.xlsx';
    link.click();
  };

  const pct = Math.min(100, Math.round(progress));

  return (
    <div className="mt-4">
      <div className="flex items-center justify-center gap-4 flex-wrap" aria-live="polite">
        {/* Botón con progreso embebido */}
        <div className="relative">
          <ButtonBase
            onClick={handleTransform}
            disabled={!canTransform || generating}
            variant="primary"
            size="md"
            className="relative overflow-hidden min-w-[170px] justify-center"
            isLoading={false} // oculto spinner propio; usamos barra interna
          >
            <span className="relative z-10 flex items-center gap-1.5">
              {generating ? 'Transformando…' : buttonLabel}
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
                Procesando datos…
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

        {/* Oculto para lectores de pantalla */}
        {generating && (
          <span className="sr-only">
            Progreso de transformación {pct} por ciento
          </span>
        )}
      </div>
    </div>
  );
}
