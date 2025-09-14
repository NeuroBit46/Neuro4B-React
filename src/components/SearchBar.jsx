import { useState } from "react";
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

  const handleChange = (e) => {
    const value = e.target.value;
    setTexto(value);
    if (!useCombobox && onBuscar) {
      onBuscar(value);
    }
  };

  const limpiar = (txt) =>
    (txt || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const filtrados = workers.filter((w) =>
    limpiar(w?.name).includes(limpiar(texto)) ||
    (filterByCompany && limpiar(w?.company).includes(limpiar(texto)))
  );

  return (
    <div className="relative z-99 w-full max-w-xs ml-10 text-primary-text glass-secondary-bg rounded-lg">
      <div className="flex">
        {Icons.search}
        <input
          type="text"
          value={texto}
          onChange={handleChange}
          onFocus={() => useCombobox && setOpen(true)}
          onBlur={() => useCombobox && setTimeout(() => setOpen(false), 150)}
          placeholder={filterByCompany ? "Buscar por trabajador o empresa" : "Buscar por trabajador"}
          className={`w-full px-4 py-1.5 pl-13 text-xs rounded-full focus:outline-none
            ${useCombobox ? '' : ''}`}
        />
      </div>

      {useCombobox && open && (
        <ul className="absolute z-99 mt-2 w-full max-h-52 overflow-y-auto bg-primary-bg rounded-sm shadow-sm text-xs">
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
        </ul>
      )}
    </div>
  );
}
