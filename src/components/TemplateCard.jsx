import { useState } from 'react';
import { Icons } from '../constants/Icons';
import ArchivoPreviewModal from './ArchivoPreviewModal';

export function TemplateCard({ name, file, isSelected, onSelect, onPreview }) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handlePreviewClick = async () => {
    if (!file || hasError) return;

    try {
      setIsLoading(true);

      // Validación liviana: HEAD para verificar existencia
      const res = await fetch(file, { method: 'HEAD' });
      if (!res.ok) throw new Error('Archivo no encontrado');

      onPreview(file);
    } catch (e) {
      console.error(`Error al cargar la plantilla "${name}":`, e);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="rounded-sm bg-primary-bg border border-border shadow-xs p-2"
      role="checkbox"
      aria-checked={isSelected}
      title={isSelected ? 'Plantilla seleccionada' : 'Seleccionar plantilla'}
    >
      {/* Encabezado */}
      <div
        className="flex items-center justify-between cursor-pointer mb-3"
        onClick={onSelect}
      >
        <p className="font-medium text-xs text-primary-text">{name}</p>
        <span>{Icons.selector(isSelected)}</span>
      </div>

      {/* Vista previa */}
      <div className="flex justify-center">
        {file ? (
          <button
            disabled={hasError || isLoading}
            onClick={handlePreviewClick}
            className={`text-xs px-4 py-1 rounded-full transition
              ${hasError
                ? 'bg-primary-bg text-secondary-disabled border border-secondary-disabled cursor-default'
                : 'bg-secondary text-primary-bg hover:bg-secondary-hover cursor-pointer'}
            `}
          >
            {hasError ? 'Vista no disponible' : isLoading ? 'Cargando…' : 'Ver vista previa'}
          </button>
        ) : (
          <span className="text-xs text-secondary-disabled">Sin archivo disponible</span>
        )}
      </div>
    </div>
  );
}

export default function TemplateCardList({ selectedTpl, setSelectedTpl }) {
  const templates = [
    { name: 'Informe Ejecutivo', file: '/plantillas/ejecutivo.pdf' },
    { name: 'Informe Supervisor' },
    { name: 'Informe Gerente', file: '' },
  ];

  const [previewInfo, setPreviewInfo] = useState(null);

  const openPreview = (file) =>
    setPreviewInfo({
      url: file,
      type: "pdf",
      name: "Plantilla",
      size: null,
      lastModified: null,
    });

  const closePreview = () => setPreviewInfo(null);

  return (
    <div className="space-y-4 rounded-sm mt-6 bg-white border border-border shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 md:gap-20 gap-8 p-4 md:px-10">
        {templates.map((tpl) => (
          <TemplateCard
            key={tpl.name}
            name={tpl.name}
            file={tpl.file}
            isSelected={selectedTpl?.name === tpl.name}
            onSelect={() => setSelectedTpl(tpl)}
            onPreview={openPreview}
          />
        ))}
      </div>

      {previewInfo && (
        <ArchivoPreviewModal
          file={previewInfo}
          onClose={closePreview}
        />
      )}
    </div>
  );
}
