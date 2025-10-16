import ButtonBase from './ButtonBase';

export default function ConfirmModal({
  open = false,
  title = '¿Estás seguro?',
  message = '',
  onConfirm = () => {},
  onCancel = () => {},
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 glass-neutral-bg"
        onClick={onCancel}
        aria-hidden="true"
      />
      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm bg-primary-bg rounded-md shadow-md">
        <div className="px-6 py-5 space-y-4 text-center">
          <h2 className="text-lg font-semibold text-primary-text">{title}</h2>
          <div className="text-base text-primary-text whitespace-pre-line">
            {message}
          </div>
          <div className="pt-2 flex items-center justify-around gap-3">
            <ButtonBase variant="neutral" size="base" onClick={onConfirm}>
              Confirmar
            </ButtonBase>
            <ButtonBase size="base" onClick={onCancel} className='cursor-pointer glass-neutral-bg text-neutral'>
              Cancelar
            </ButtonBase>
          </div>
        </div>
      </div>
    </div>
  );
}
