import ButtonBase from './ButtonBase';

export default function ReportDownloadModal({
  open = false,
  name = '',
  onDownload = () => {},
  onClose = () => {},
  subtitle = 'Tu archivo está listo para descargar.',
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 glass-secondary-bg"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-secondary-bg rounded-md shadow-md">
        <div className="px-6 py-5 space-y-3 text-center">
          <h2 className="text-normal font-semibold text-primary-text">
            Informe generado
          </h2>
          <p className="text-sm text-primary-text">
            El informe de <strong>{name}</strong> está listo.
          </p>
          {subtitle && (
            <p className="text-xs text-primary-text">
              {subtitle}
            </p>
          )}
          <div className="pt-2 flex items-center justify-center gap-3">
            <ButtonBase variant="primary" size="sm" onClick={onDownload}>
              Descargar informe
            </ButtonBase>
            <ButtonBase variant="secondary" size="sm" onClick={onClose}>
              Cerrar
            </ButtonBase>
          </div>
        </div>
      </div>
    </div>
  );
}
