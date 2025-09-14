import { useLocation } from 'react-router-dom';
import InfoTooltip from './InfoTooltip';

export default function PageLayout({ title, tooltip, headerAction, children }) {
  return (
    <div className="absolute inset-0 mb-2 mt-1 mx-3 bg-primary-bg rounded-sm">
      
      {/* Sticky header con slot adicional */}
      <div className="sticky top-0 z-1 isolate grid grid-cols-3 items-center px-6 my-2 bg-primary-bg">
        {/* Izquierda: h1 + tooltip */}
        <div className="flex items-center gap-4">
          <h1 className="text-md font-semibold text-primary-text pl-2">{title}</h1>
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

