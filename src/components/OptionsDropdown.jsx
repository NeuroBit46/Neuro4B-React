import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../constants/Icons';

export default function OptionsDropdown({ onVer, onEditar, onEliminar }) {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const buttonRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        visible &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target) &&
        !document.getElementById('dropdown-menu')?.contains(e.target)
      ) {
        setVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [visible]);

  // Recalcular posición en resize/scroll
  useEffect(() => {
    const updateCoords = () => {
      if (visible && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const menuWidth = 160;
        const maxLeft = window.innerWidth - menuWidth - 16;
        const maxTop = window.innerHeight - 100;

        setCoords({
          top: Math.min(rect.bottom + window.scrollY + 6, maxTop),
          left: Math.min(rect.left + window.scrollX, maxLeft),
        });
        setReady(true);
      }
    };

    updateCoords();
    window.addEventListener('resize', updateCoords);
    window.addEventListener('scroll', updateCoords);
    return () => {
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords);
    };
  }, [visible]);

  const handleAction = (fn) => {
    fn?.();
    setVisible(false);
  };

  const menu = (
    <div
      id="dropdown-menu"
      className="fixed w-[160px] bg-secondary-bg rounded-sm shadow-sm z-50 transition-opacity duration-150 text-primary-text"
      style={{ top: coords.top, left: coords.left }}
    >
      <button
        onClick={() => handleAction(onVer)}
        className="flex items-center w-full text-left px-4 py-2 hover:bg-primary-disabled/75 rounded-md text-xs"
      >
        <span className="mr-3">{Icons.read}</span>
        <span>Ver</span>
      </button>
      <button
        onClick={() => handleAction(onEditar)}
        className="flex items-center w-full text-left px-4 py-2 hover:bg-primary-disabled/75 rounded-md text-xs"
      >
        <span className="mr-3">{Icons.edit}</span>
        <span>Editar</span>
      </button>
      <button
        onClick={() => handleAction(onEliminar)}
        className="flex items-center w-full text-left px-4 py-2 hover:bg-secondary-disabled/75 text-xs rounded-md"
      >
        <span className="mr-3">{Icons.delete}</span>
        <span>Eliminar</span>
      </button>
    </div>
  );

  return (
    <div className="inline-block">
      <button
        ref={buttonRef}
        onClick={() => {
          setReady(false);
          setVisible(!visible);
        }}
        className="text-secondary-text hover:text-secondary transition-colors"
        title="Opciones"
      >
        {Icons.options}
      </button>
      {visible && ready && createPortal(menu, document.getElementById('portal-root'))}
    </div>
  );
}
