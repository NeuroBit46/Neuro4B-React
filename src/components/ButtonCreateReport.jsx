import { useState, useEffect } from 'react';
import ButtonBase from './ButtonBase';
import useWorkers from './UseWorkers';
import ReportDownloadModal from './ReportDownloadModal';

export default function ButtonCreateReport({
  buttonLabel = 'Generar informe',
  requireTemplate = false,
  selectedWorkers = [],
  selectedTpl = null,
  autoDownload = true,
}) {
  const { workers } = useWorkers();

  const [isReady, setIsReady] = useState(false);
  const [fileUrl, setFileUrl] = useState(null);
  const [status, setStatus] = useState(null);

  const [generatedName, setGeneratedName] = useState('');
  const [generatedTplLabel, setGeneratedTplLabel] = useState('');
  const [generatedFileName, setGeneratedFileName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    };
  }, [fileUrl]);

  const generateReport = async () => {
    if (!canGenerate) return;

    setStatus('Generando informe...');
    setIsReady(false);

    // Congelamos selección actual
    const pk = selectedWorkers[0];

    // Lookup del trabajador y etiqueta de plantilla en el momento del click
    const workerObj = workers.find((w) => w.id === pk);
    const name = workerObj?.nombre?.trim() || `Trabajador ${pk}`;
    const tplLabel =
      selectedTpl?.label ||
      selectedTpl?.name ||
      'Ejecutivo'; // fallback compartido para todas las plantillas

    // Armamos nombre de archivo estable
    const fileName = sanitizeFileName(`${tplLabel} ${name} - Neuro4B.docx`);

    try {
      // Evitamos fugas del URL anterior si existiera
      revokePreviousUrl();

      const response = await fetch(`/api/descargar-informe/${pk}/`);
      if (!response.ok) {
        const txt = await response.text();
        console.warn('⚠️', txt);
        setStatus('Error al generar el informe');
        return;
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      // Guardamos estado “congelado” para este informe
      setGeneratedName(name);
      setGeneratedTplLabel(tplLabel);
      setGeneratedFileName(fileName);
      setFileUrl(url);
      setIsReady(true);
      setStatus('Informe generado correctamente');
      setIsModalOpen(true);

      // Descarga inmediata opcional
      if (autoDownload) {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        // No revocar aquí: el usuario podría querer descargar de nuevo desde el modal
      }
    } catch (e) {
      console.error(e);
      setStatus('Error de conexión con el servidor');
    }
  };

  const handleDownload = () => {
    if (!fileUrl) return;
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = generatedFileName || 'informe.docx';
    link.click();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Si quieres limpiar el URL cuando cierran el modal, descomenta:
    revokePreviousUrl();
    setIsReady(false);
  };

  return (
    <div className="space-y-4 mt-6">
      <div className="flex justify-center">
        <ButtonBase
          onClick={generateReport}
          disabled={!canGenerate}
          variant="primary"
          size="md"
        >
          {buttonLabel}
        </ButtonBase>
      </div>

      {status && (
        <div className="text-center text-sm text-gray-600">
          <strong>Estado:</strong> {status}
        </div>
      )}

      {/* Modal de descarga compartido para cualquier plantilla */}
      <ReportDownloadModal
        open={isModalOpen && isReady}
        name={generatedName}
        fileName={generatedFileName}
        onDownload={handleDownload}
        onClose={handleCloseModal}
        subtitle={`Plantilla: ${generatedTplLabel}`}
      />
    </div>
  );
}
