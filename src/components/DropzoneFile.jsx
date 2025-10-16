import React, { forwardRef, useImperativeHandle } from 'react';
import { useDropzone } from 'react-dropzone';
import { Icons } from '../constants/Icons';

const formatSize = (bytes) => {
  if (!bytes && bytes !== 0) return null;
  const units = ['B', 'KB', 'MB', 'GB'];
  let v = bytes;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) {
    v /= 1024;
    i++;
  }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`;
};

const DropzoneField = forwardRef(
  (
    {
      onDrop,
      file,
      disabled,
      fileLabel,
      onClick,
      onRemove,
      forceDisabled = false,
      className = "",
      innerClassName = "",
    },
    ref
  ) => {
    const isPreviewMode = !!file;
    const isViewDisabled = disabled && !isPreviewMode;
    const completelyDisabled = forceDisabled || isViewDisabled;

    const {
      getRootProps,
      getInputProps,
      open,
      isDragActive,
      isDragReject
    } = useDropzone({
      onDrop: acceptedFiles => {
        if (completelyDisabled) return;
        if (!acceptedFiles?.length) return;
        onDrop?.(acceptedFiles);
      },
      noClick: isPreviewMode || completelyDisabled,
      noKeyboard: true,
      multiple: false,
      disabled: completelyDisabled
    });

    useImperativeHandle(ref, () => ({
      openPicker: open
    }));

    // Detectar tipo
    const detectFileType = () => {
      if (file) {
        const name = (file.name || file).toLowerCase();
        const mime = file.type?.toLowerCase() || '';
        if (name.endsWith('.pdf') || mime.includes('pdf')) return 'pdf';
        if (name.endsWith('.csv') || mime.includes('csv')) return 'csv';
        if (name.endsWith('.xls') || name.endsWith('.xlsx') || mime.includes('spreadsheet')) return 'excel';
      }
      const label = (fileLabel || '').toLowerCase();
      if (label.includes('pdf')) return 'pdf';
      if (label.includes('csv')) return 'csv';
      if (label.includes('excel')) return 'excel';
      return null;
    };
    const fileType = detectFileType();

    const handleClick = e => {
      e.stopPropagation();
      if (completelyDisabled) return;
      if (file) {
        onClick?.(e);
      } else {
        open();
      }
    };

    const sizeLabel = file instanceof File ? formatSize(file.size) : null;

    const placeholderLabel = !file
      ? isViewDisabled
        ? fileType === 'pdf'
          ? (<><span>Archivo PDF Nesplora</span><br /><span className="font-semibold">No subido</span></>)
          : (fileType === 'csv' || fileType === 'excel')
            ? (<><span>Archivo Excel EEG</span><br /><span className="font-semibold">No subido</span></>)
            : fileLabel
        : fileType === 'pdf'
          ? 'Suba o arrastre el archivo PDF Nesplora'
          : (fileType === 'csv' || fileType === 'excel')
            ? 'Suba o arrastre el archivo Excel EEG'
            : (fileLabel || 'Arrastra o haz clic para subir')
      : null;

    const accent =
      fileType === 'pdf'
        ? 'from-rose-500/70 to-pink-500/70'
        : (fileType === 'csv' || fileType === 'excel')
          ? 'from-emerald-500/70 to-teal-500/70'
          : 'from-primary/70 to-primary/50';

    const subtleBg =
      fileType === 'pdf'
        ? 'bg-secondary/15'                       // antes bg-rose-500/5
        : (fileType === 'csv' || fileType === 'excel')
          ? 'bg-primary/15'                       // antes bg-emerald-500/5
          : 'bg-primary/15';                       // mantenido para otros casos

    const iconColor =
      fileType === 'pdf'
        ? 'text-rose-500'
        : (fileType === 'csv' || fileType === 'excel')
          ? 'text-emerald-500'
          : 'text-primary';

    return (
      <div
        className={[
          "relative group",
          className
        ].join(' ')}
      >
        <div
          {...getRootProps({
            className: [
              "relative rounded-md border border-border/60 transition",
              "p-4 sm:p-5",
              "cursor-pointer",
              "bg-gradient-to-br from-background to-background/95",
              "hover:border-primary/50",
              completelyDisabled && "opacity-60 pointer-events-none",
              isDragActive && "border-transparent",
              isDragReject && "border-destructive/60",
              innerClassName
            ].join(' ')
          })}
          data-state={isPreviewMode ? 'file' : 'empty'}
          onClick={handleClick}
          title={completelyDisabled ? 'No disponible' : undefined}
          aria-label={
            file
              ? `Archivo: ${(file.name || fileLabel)}`
              : placeholderLabel?.toString()
          }
        >
          <input {...getInputProps()} />

            {/* Borde degradado animado */}
            <div
              className={[
                "pointer-events-none absolute inset-0 rounded-md",
                "opacity-0 group-hover:opacity-100 transition-opacity",
                "bg-[conic-gradient(var(--tw-gradient-stops))]",
                accent,
                isDragActive && "opacity-100 animate-pulse"
              ].join(' ')}
              style={{
                mask: "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
                WebkitMask:
                  "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
                maskComposite: "exclude",
                WebkitMaskComposite: "xor",
                padding: 1.5
              }}
            />

            {/* Fondo interno */}
            <div
              className={[
                "relative z-10 rounded-sm border border-dashed",
                "flex flex-col items-center justify-center text-center",
                "min-h-[140px] sm:min-h-[120px] px-4",
                subtleBg,
                isDragActive && "!border-primary/60",
                isPreviewMode ? "border-border/40" : "border-border/60",
              ].join(' ')}
            >
              <div className="mb-2 text-2xl sm:text-xl">
                {fileType === 'pdf'
                  ? Icons.pdf(true, iconColor)
                  : (fileType === 'csv' || fileType === 'excel')
                    ? Icons.excel(true, iconColor)
                    : Icons.file(true, iconColor)}
              </div>

              {file ? (
                <div className="space-y-1">
                  <p className="text-sm uppercase tracking-wide font-medium text-secondary-text/70">
                    {fileType === 'pdf'
                      ? 'Archivo PDF Nesplora'
                      : (fileType === 'csv' || fileType === 'excel')
                        ? 'Archivo Excel EEG'
                        : 'Archivo'}
                  </p>
                  <p className="text-sm font-semibold text-primary-text break-all max-w-[220px]">
                    {file.name || fileLabel}
                  </p>
                  {sizeLabel && (
                    <p className="text-sm text-secondary-text/60">
                      {sizeLabel}
                    </p>
                  )}
                  <div className="flex gap-2 justify-center pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClick?.(e); // abrir preview zoom in
                      }}
                      className="text-sm px-2 py-1 rounded-sm border border-border/50 hover:border-primary/50 hover:bg-primary/5 text-primary/80 transition cursor-pointer"
                    >
                      Ver
                    </button>
                    {onRemove && !completelyDisabled && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemove();
                        }}
                        className="text-sm px-2 py-1 rounded-sm border border-destructive/40 text-destructive/80 hover:bg-destructive/10 hover:border-destructive/60 transition"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-relaxed text-secondary-text/80 max-w-[240px]">
                  {isDragActive
                    ? 'Suelta el archivo aquí'
                    : placeholderLabel}
                </p>
              )}

              {isDragReject && (
                <p className="mt-2 text-sm text-destructive">
                  Tipo de archivo no permitido
                </p>
              )}
            </div>

            {/* Overlay bloqueado */}
            {completelyDisabled && (
              <div className="absolute inset-0 rounded-md bg-background/30 backdrop-blur-[1px]" />
            )}

            {/* Texto oculto para lectores de pantalla */}
            <span className="sr-only">
              {file
                ? `Archivo seleccionado ${(file.name || fileLabel)}`
                : 'Área para subir archivo'}
            </span>
        </div>
      </div>
    );
  }
);

export default DropzoneField;
