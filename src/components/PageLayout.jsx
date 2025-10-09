import { useLocation } from 'react-router-dom';
import InfoTooltip from './InfoTooltip';

/**
 * PageLayout
 * - Si se pasa la prop `title`, se usa directamente.
 * - Si NO se pasa `title`, intenta inferir un título a partir de la ruta actual.
 *   Útil para no repetir lógica simple en cada página.
 * - Rutas con parámetros (/:id) se reconocen por prefix.
 * - Se puede extender el mapa sin romper compatibilidad.
 */
export default function PageLayout({ title, tooltip, headerAction, titleAddon, children }) {
  const location = useLocation();

  // Mapa básico de rutas -> título por defecto
  const TITLE_MAP = {
    '/dashboard': 'Dashboard',
    '/generar-informe': 'Generar informe',
    '/transformar-datos': 'Transformar datos',
    '/archivos-trabajadores': 'Archivos trabajadores',
    '/añadir-trabajador': 'Añadir trabajador',
  };

  // Rutas que empiezan con estos prefijos (dinámicas)
  const PREFIX_TITLE = [
    { prefix: '/detalles-trabajador/', title: 'Detalle trabajador' },
    { prefix: '/editar-trabajador/', title: 'Editar trabajador' },
  ];

  let inferredTitle = TITLE_MAP[location.pathname];
  if (!inferredTitle) {
    const match = PREFIX_TITLE.find(p => location.pathname.startsWith(p.prefix));
    if (match) inferredTitle = match.title;
  }

  // Fallback final
  if (!inferredTitle) inferredTitle = 'Página';

  const effectiveTitle = title || inferredTitle;

  return (
    <div className="absolute inset-0 mb-2 mt-1 mx-3 bg-primary-bg rounded-sm flex flex-col">
      {/* Header con centro absoluto para que permanezca centrado sin importar el ancho lateral */}
      <div className="shrink-0 z-1 isolate relative flex items-center rounded-sm px-6 py-2 bg-white border-b border-primary/10 min-h-[54px]">
        {/* Bloque izquierdo (título, tooltip, addon) */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-md font-semibold text-primary-text pl-2" data-testid="page-title">
              {effectiveTitle}
            </h1>
            {tooltip && <InfoTooltip message={tooltip} />}
          </div>
          {titleAddon && (
            <div className="flex items-center">{titleAddon}</div>
          )}
        </div>

        {/* Centro absoluto: se mantiene centrado aunque crezcan los lados */}
        {(headerAction?.center || headerAction?.left) && (
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
            {headerAction?.left && (
              <div className="pointer-events-auto flex items-center shrink-0">{headerAction.left}</div>
            )}
            {headerAction?.center && (
              <div
                className="pointer-events-auto flex items-center"
                style={{ minWidth: '300px', width: 'clamp(300px, 50vw, 300px)' }}
              >
                {headerAction.center}
              </div>
            )}
          </div>
        )}

        {/* Bloque derecho */}
        <div className="flex items-center gap-4 ml-auto">
            {headerAction?.right}
        </div>
      </div>

      {/* Contenido scrollable dentro del layout */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden px-2 sm:px-4 pb-6 pt-2 min-h-0">
        <div className="max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}

