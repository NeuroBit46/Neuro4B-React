import React, { forwardRef, useImperativeHandle } from 'react';
import { useDropzone } from 'react-dropzone';
import { Icons } from '../constants/Icons';

const DropzoneField = forwardRef(({ onDrop, file, disabled, fileLabel, onClick, forceDisabled = false }, ref) => {
  const isPreviewMode = !!file;

  // Desactivar solo vista "ver" sin archivo
  const isViewDisabled = disabled && !isPreviewMode;

  // Bloqueo total (ej. mientras crea)
  const completelyDisabled = forceDisabled || isViewDisabled;

  const {
    getRootProps,
    getInputProps,
    open
  } = useDropzone({
    onDrop: acceptedFiles => {
      if (completelyDisabled) return;
      onDrop(acceptedFiles);
    },
    noClick: isPreviewMode || completelyDisabled,
    noKeyboard: true,
    multiple: false,
    disabled: completelyDisabled
  });

  useImperativeHandle(ref, () => ({
    openPicker: open
  }));

  // --- Detectar tipo real ---
  const detectFileType = () => {
    // 1) Si hay archivo seleccionado
    if (file) {
      const name = (file.name || file).toLowerCase();
      const mime = file.type?.toLowerCase() || '';
      if (name.endsWith('.pdf') || mime.includes('pdf')) return 'pdf';
      if (name.endsWith('.csv') || mime.includes('csv')) return 'csv';
      if (name.endsWith('.xls') || name.endsWith('.xlsx') || mime.includes('spreadsheet')) return 'excel';
    }
    // 2) Si no hay archivo, usar label como pista
    const label = (fileLabel || '').toLowerCase();
    if (label.includes('pdf')) return 'pdf';
    if (label.includes('csv')) return 'csv';
    if (label.includes('excel')) return 'excel';
    return null;
  };

  const fileType = detectFileType();

  const placeholderLabel = !file
    ? isViewDisabled
      ? fileType === 'pdf'
        ? (<><span>Archivo PDF Nesplora</span><br /><span className="font-semibold">No subido</span></>)
        : (fileType === 'csv' || fileType === 'excel')
          ? (<><span>Archivo Excel EEG</span><br /><span className="font-semibold">No subido</span></>)
          : fileLabel
      : fileType === 'pdf'
        ? 'Suba o arrastre el archivo PDF Nesplora'
        : fileType === 'csv' || fileType === 'excel'
          ? 'Suba o arrastre el archivo Excel EEG'
          : fileLabel
    : null;

  const handleClick = e => {
    e.stopPropagation();
    if (completelyDisabled) return;   // bloquea todo
    if (file) {
      onClick?.(e);
    } else {
      open();
    }
  };

  return (
    <div className="space-y-2 bg-primary-bg shadow-xs rounded-sm p-4 px-10 md:px-20 text-primary-text">
      <div
        {...getRootProps({
          className: [
            'p-8 border-3 border-dashed rounded-sm transition',
            completelyDisabled
              ? 'opacity-60 cursor-not-allowed'
              : isPreviewMode
                ? 'hover:shadow-md cursor-zoom-in'
                : 'cursor-pointer',
            fileType === 'pdf' ? 'bg-secondary/20 border-secondary' : '',
            fileType === 'csv' || fileType === 'excel' ? 'bg-primary/20 border-primary' : '',
            !fileType ? 'bg-primary/20 border-primary' : ''
          ].join(' ')
        })}
        onClick={handleClick}
        title={completelyDisabled ? 'No disponible' : undefined}
      >
        <input {...getInputProps()} />

        <div className="flex justify-center text-xl mb-2">
          {fileType === 'pdf'
            ? Icons.pdf(true)
            : (fileType === 'csv' || fileType === 'excel')
              ? Icons.excel(true)
              : Icons.file(true)}
        </div>

        <p className="text-xs text-center">
          {file ? (
            <>
              {fileType === 'pdf' && 'Archivo PDF Nesplora'}
              {fileType === 'csv' || fileType === 'excel' ? 'Archivo Excel EEG' : ''}
              <br />
              <span className="font-semibold">
                {file.name || fileLabel}
              </span>
            </>
          ) : (
            placeholderLabel
          )}
        </p>
      </div>
    </div>
  );
});

export default DropzoneField;
