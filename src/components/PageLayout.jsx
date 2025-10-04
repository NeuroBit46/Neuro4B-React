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
export default function PageLayout({ title, tooltip, headerAction, children }) {
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
    <div className="absolute inset-0 mb-2 mt-1 mx-3 bg-primary-bg rounded-sm">
      {/* Sticky header con slot adicional */}
      <div className="sticky top-0 z-1 isolate grid grid-cols-3 items-center px-6 my-2 bg-primary-bg">
        {/* Izquierda: h1 + tooltip */}
        <div className="flex items-center gap-4">
          <h1 className="text-md font-semibold text-primary-text pl-2" data-testid="page-title">
            {effectiveTitle}
          </h1>
          {tooltip && <InfoTooltip message={tooltip} />}
        </div>

        {/* Centro: search bar */}
        <div className="flex justify-center">
          {headerAction?.center}
        </div>

        {/* Derecha: botón u otro */}
        <div className="flex justify-end space-x-4">
          {headerAction?.right}
        </div>
      </div>

      {/* Contenido scrollable */}
      <main className="h-[calc(100vh-4rem)] overflow-y-auto px-6 pb-8 pt-1 space-y-">
        {children}
      </main>
    </div>
  );
}

