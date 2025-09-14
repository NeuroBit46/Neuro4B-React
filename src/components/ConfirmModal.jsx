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
        className="absolute inset-0 glass-secondary-bg"
        onClick={onCancel}
        aria-hidden="true"
      />
      {/* Modal */}
      <div className="relative z-10 w-full max-w-sm bg-secondary-bg rounded-md shadow-md">
        <div className="px-6 py-5 space-y-4 text-center">
          <h2 className="text-base font-semibold text-primary-text">{title}</h2>
          <p className="text-sm text-primary-text">{message}</p>
          <div className="pt-2 flex items-center justify-center gap-3">
            <ButtonBase variant="primary" size="sm" onClick={onConfirm}>
              Confirmar
            </ButtonBase>
            <ButtonBase variant="disabledSecondary" size="sm" onClick={onCancel} className='cursor-pointer'>
              Cancelar
            </ButtonBase>
          </div>
        </div>
      </div>
    </div>
  );
}
