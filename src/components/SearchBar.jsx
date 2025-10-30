import { useState, useRef, useLayoutEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Icons } from "../constants/Icons";

export default function SearchBar({
  useCombobox = false,
  workers = [],
  onSeleccionar,
  onBuscar,
  filterByCompany = true
}) {
  const [texto, setTexto] = useState("");
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null); // ancla para posicionar el dropdown
  const [dropdownStyle, setDropdownStyle] = useState(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setTexto(value);
    if (!useCombobox && onBuscar) onBuscar(value);
  };

  // Normaliza texto
  const limpiar = (txt) =>
    (txt || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // Helper: asegura id numérico
  const getIdNum = (w) => {
    const n = Number(w?.id);
    return Number.isFinite(n) ? n : 0;
  };

  const workersArr = Array.isArray(workers) ? workers : [];
  const workersSorted = useMemo(() => {
    return [...workersArr].sort((a, b) => getIdNum(b) - getIdNum(a));
  }, [workersArr]);

  // Aplica el filtro sobre la lista ordenada
  const filtrados = workersSorted.filter((w) =>
    limpiar(w?.nombre).includes(limpiar(texto)) ||
    (filterByCompany && limpiar(w?.company).includes(limpiar(texto)))
  );

  function updateDropdownPosition() {
    const el = anchorRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      left: r.left,
      top: r.bottom + 8, // separación de 8px
      width: r.width,
      zIndex: 9999
    });
  }

  useLayoutEffect(() => {
    if (!open) return;
    updateDropdownPosition();
    const handler = () => updateDropdownPosition();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [open]);

  // Placeholder: en combobox siempre "Buscar por trabajador"
  const placeholderText = useCombobox
    ? "Buscar por trabajador"
    : (filterByCompany ? "Buscar trabajador o empresa" : "Buscar trabajador");

  return (
    <div
      ref={anchorRef}
      className="relative w-full max-w-xs ml-10 text-primary-text glass-neutral-bg rounded-lg"
    >
      <div className="flex">
        {Icons.search}
        <input
          type="text"
          value={texto}
          onChange={handleChange}
          onFocus={() => useCombobox && setOpen(true)}
          onBlur={() => useCombobox && setTimeout(() => setOpen(false), 150)}
          placeholder={placeholderText}
          className="w-full px-4 py-1.5 pl-13 text-sm rounded-full focus:outline-none"
        />
      </div>

      {useCombobox && open && dropdownStyle &&
        createPortal(
          <ul
            className="max-h-52 overflow-y-auto bg-primary-bg rounded-sm shadow-lg text-xs ring-1 ring-black/5"
            style={dropdownStyle}
          >
            {filtrados.map((w) => (
              <li
                key={w.id}
                onMouseDown={() => onSeleccionar?.(w)}
                className="px-4 py-2 cursor-pointer hover:bg-secondary-bg grid grid-cols-2 gap-8"
              >
                <strong>{w.nombre}</strong>
                <span>{w.fecha}</span>
              </li>
            ))}
            {filtrados.length === 0 && (
              <li className="px-4 py-2 italic text-secondary-text">Sin resultados</li>
            )}
          </ul>,
          document.body
        )
      }
    </div>
  );
}
