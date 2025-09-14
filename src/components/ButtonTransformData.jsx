import { useState, useEffect } from 'react';
import ButtonBase from './ButtonBase';
import useWorkers from './UseWorkers';

export default function ButtonTransformData({
  buttonLabel = 'Transformar datos',
  selectedWorkers = [],
  API_BASE = import.meta.env.VITE_API_BASE,
}) {
  const { workers } = useWorkers();

  const [isReady, setIsReady] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [status, setStatus] = useState(null);
  const [generatedFileName, setGeneratedFileName] = useState('');

  const canTransform = selectedWorkers.length > 0;

  const sanitizeFileName = (s) =>
    String(s).replace(/[\\/:*?"<>|]/g, '-').trim();

  const handleTransform = async () => {
    if (!canTransform) return;

    const workerId = selectedWorkers[0];
    const workerObj = workers.find((w) => w.id === workerId);
    const name = workerObj?.nombre?.trim() || `Trabajador ${workerId}`;
    const date = workerObj?.fecha?.trim();
    const fileName = sanitizeFileName(`Nesplora ${name} ${date}.xlsx`);

    setStatus('Verificando datos...');
    setIsReady(false);
    setGeneratedFileName(fileName);

    try {
      const res = await fetch(`${API_BASE}/api/trabajador/${workerId}/descargar-excel`);

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        setFileUrl(url);
        setIsReady(true);
        setStatus('Archivo listo para descargar.');
      } else {
        setStatus('Archivo no disponible. Ejecutando OCR...');

        const ocrRes = await fetch(`${API_BASE}/api/trabajadores/${workerId}/convertir-pdf/`, {
          method: 'POST',
        });

        if (ocrRes.ok) {
          const blob = await ocrRes.blob();
          const url = window.URL.createObjectURL(blob);
          setFileUrl(url);
          setIsReady(true);
          setStatus('OCR completado. Archivo listo para descargar.');
        } else {
          setStatus('Error al ejecutar OCR.');
        }
      }
    } catch (err) {
      console.error('❌ Error en transformación:', err);
      setStatus('Error de conexión con el servidor.');
    }
  };

  const handleDownload = () => {
    if (!fileUrl) return;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = generatedFileName || 'datos-transformados.xlsx';
    link.click();
  };

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-center">
        <ButtonBase
          onClick={handleTransform}
          disabled={!canTransform}
          variant="primary"
          size="md"
        >
          {buttonLabel}
        </ButtonBase>
      </div>

      {status && (
        <div className="text-center text-sm text-secondary-text">{status}</div>
      )}

      {isReady && (
        <div className="mx-10 p-3 bg-success border border-primary rounded-lg flex items-center justify-between">
          <span className="text-primary-text text-sm pl-2">
            Los datos de {generatedFileName.replace('.xlsx', '')} fueron transformados con éxito.
          </span>
          <ButtonBase
            onClick={handleDownload}
            variant="primary"
            size="sm"
          >
            Descargar
          </ButtonBase>
        </div>
      )}
    </div>
  );
}
