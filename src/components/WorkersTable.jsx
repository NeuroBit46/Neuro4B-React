import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
// import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox"; // <-- importar checkbox shadcn
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import ConfirmModal from "./ConfirmModal";
import { Icons } from "../constants/Icons";

const API_BASE = import.meta.env.VITE_API_BASE;

// Helpers
const limpiar = (txt) => (txt || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const normalizeRuta = (ruta) => (ruta?.startsWith("archivos/") ? `/media/${ruta}` : ruta);
const formatFecha = (raw) => {
  if (!raw) return "—";
  const dateOnly = typeof raw === "string" && raw.length > 10 ? raw.substring(0, 10) : raw;
  const fecha = new Date(`${dateOnly}T00:00:00`);
  return fecha.toLocaleDateString("es-CL", { day: "2-digit", month: "short", year: "numeric" });
};

export default function WorkersTable({
  workers = [],
  textoBusqueda = "",
  actionsMode = false,
  selectedWorkers = [],
  setSelectedWorkers,
  onArchivoClick,
  onDeleteSuccess,

  // NUEVAS PROPS
  pagination = false,
  pageSize = 10,
  stickyHeader = false,
  bodyMaxHeightClass,
  footerPinned = false,
  pageMinHeightClass,
}) {
  const navigate = useNavigate();
  const [confirmRow, setConfirmRow] = useState(null);

  // Pre-filtrado por texto (nombre/empresa)
  const data = useMemo(() => {
    const f = limpiar(textoBusqueda);
    // Antes: se ordenaba acá y luego la tabla volvía a ordenar => resultados inesperados
    // const sorted = [...workers].sort((a, b) => { ... });
    // return sorted.filter(...);

    return workers.filter(
      (w) => limpiar(w.nombre).includes(f) || limpiar(w.empresa).includes(f)
    );
  }, [workers, textoBusqueda]);

  const col = createColumnHelper();

  const columns = useMemo(() => {
    const cols = [
      col.accessor("nombre", {
        header: () => "Nombre",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span className="text-primary">{Icons.workers("text-lg", "text-primary")}</span>
            <span className="font-medium text-sm text-primary-text">{row.original.nombre}</span>
          </div>
        ),
      }),
      // Empresa: Badge "fit" (no w-full), truncado dentro del badge si es largo
      col.accessor("empresa", {
        header: () => "Empresa",
        cell: ({ getValue }) => (
          <div className="overflow-hidden">
            <Badge variant="default" className="max-w-full overflow-hidden">
              <span className="block max-w-full truncate">{getValue()}</span>
            </Badge>
          </div>
        ),
      }),
      // NUEVA columna: Cargo (también como Badge "fit")
      col.accessor("cargo", {
        header: () => "Cargo",
        cell: ({ getValue }) => (
          <div className="overflow-hidden">
            <Badge variant="outline" className="max-w-full overflow-hidden">
              <span className="block max-w-full truncate">{getValue() || "—"}</span>
            </Badge>
          </div>
        ),
      }),
      col.accessor((row) => row.fecha, {
        id: "fecha",
        header: () => "Fecha",
        sortDescFirst: true, // primer clic en "Fecha" va a desc
        sortingFn: (a, b) => {
          const idA = Number(a.original?.id) || 0;
          const idB = Number(b.original?.id) || 0;
          // comparator ascendente por id (React Table invierte cuando desc=true)
          return idA - idB;
        },
        cell: ({ row }) => <span className="text-primary-text">{formatFecha(row.original.fecha)}</span>,
      }),
      col.display({
        id: "pdf",
        header: () => "Nesplora",
        cell: ({ row }) => {
          const ruta = normalizeRuta(row.original.ruta_PDF);
          const enabled = !!ruta;
          return (
            <button
              className={`inline-flex w-full justify-center ${enabled ? "text-primary" : "text-secondary-text"}`}
              title={enabled ? "Ver PDF" : "No disponible"}
              onClick={() => enabled && onArchivoClick?.({ name: `PDF de ${row.original.nombre}`, url: ruta, type: "pdf" })}
            >
              {Icons.pdf(enabled)}
            </button>
          );
        },
      }),
      col.display({
        id: "excel",
        header: () => "EEG",
        cell: ({ row }) => {
          const ruta = normalizeRuta(row.original.ruta_EEG);
          const enabled = !!ruta;
          return (
            <button
              className={`inline-flex w-full justify-center ${enabled ? "text-primary" : "text-secondary-text"}`}
              title={enabled ? "Ver EEG" : "No disponible"}
              onClick={() => enabled && onArchivoClick?.({ name: `${row.original.nombre}-EEG.xlsx`, url: ruta, type: "excel" })}
            >
              {Icons.excel(enabled)}
            </button>
          );
        },
      }),
      col.display({
        id: "informe",
        header: () => "Informe",
        cell: ({ row }) => {
          const ruta = normalizeRuta(row.original.ruta_informe);
          const enabled = !!ruta;
          return (
            <button
              className={`inline-flex w-full justify-center ${enabled ? "text-primary" : "text-secondary-text"}`}
              title={enabled ? "Ver Informe" : "No disponible"}
              onClick={() => enabled && onArchivoClick?.({ name: `Informe de ${row.original.nombre}`, url: ruta, type: "pdf" })}
            >
              {Icons.word(enabled)}
            </button>
          );
        },
      }),
    ];

    // Insertar columna de selección AL INICIO en modo seleccionar
    if (!actionsMode) {
      cols.unshift(
        col.display({
          id: "seleccionar",
          header: () => null,            // sin título
          enableSorting: false,
          cell: ({ row }) => (
            <div className="flex items-center justify-center">
              <Checkbox
                checked={selectedWorkers?.[0] === row.original.id}
                onCheckedChange={(checked) =>
                  setSelectedWorkers?.((prev) =>
                    checked ? [row.original.id] : prev?.[0] === row.original.id ? [] : prev
                  )
                }
                aria-label={`Seleccionar ${row.original.nombre}`}
              />
            </div>
          ),
        })
      );
    } else {
      // Acciones al final en modo acciones
      cols.push(
        col.display({
          id: "acciones",
          header: () => "Acciones",
          cell: ({ row }) =>
            actionsMode ? (
              <div className="flex items-center justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0" aria-label="Acciones">
                      <span className="scale-125">{Icons.options}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-28">
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => navigate(`/detalles-trabajador/${row.original.id}`)}
                    >
                      Ver
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onClick={() => navigate(`/editar-trabajador/${row.original.id}`)}
                    >
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive cursor-pointer"
                      onClick={() => setConfirmRow(row.original)}
                    >
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : null,
        })
      );
    }

    return cols;
  }, [actionsMode, navigate, onArchivoClick, selectedWorkers, setSelectedWorkers]);

  // Tabla con/ sin paginación
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSortingRemoval: false, // solo asc/desc
    ...(pagination
      ? {
          getPaginationRowModel: getPaginationRowModel(),
          initialState: {
            sorting: [{ id: "fecha", desc: true }], // más nuevos primero (id desc)
            pagination: { pageSize },
          },
        }
      : {
          initialState: {
            sorting: [{ id: "fecha", desc: true }],
          },
        }),
  });

  // Eliminar trabajador
  const handleEliminar = async (row) => {
    try {
      const res = await fetch(`${API_BASE}/api/eliminar/${row.id}/`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo eliminar");
      onDeleteSuccess?.(row.id);

      // Ajustar página si la actual queda sin filas tras la actualización
      if (pagination) {
        // Espera al siguiente tick para que llegue la nueva lista filtrada
        setTimeout(() => {
          const page = table.getState().pagination.pageIndex;
          const pc = table.getPageCount();
            if (page >= pc && pc > 0) {
              table.setPageIndex(pc - 1);
            }
        }, 0);
      }
    } catch (e) {
      console.error("Error eliminando trabajador:", e);
    } finally {
      setConfirmRow(null);
    }
  };

  // Anchos por columna (por id), robusto aunque cambie el orden
  const widthById = {
    seleccionar: "2%",
    nombre: "25%",
    empresa: "30%",
    cargo: "4%",
    fecha: "8%",
    pdf: "6%",
    excel: "6%",
    informe: "6%",
    acciones: "6%",
  };

  const colWidths = useMemo(() => {
    const fallback = `${Math.floor(100 / columns.length)}%`;
    return columns.map((c) => widthById[c.id] ?? fallback);
  }, [columns]);

  // Headers centrados solo para: Nesplora (pdf), EEG (excel), Informe (informe) y Acciones (acciones)
  const centerHeaderIds = new Set(["pdf", "excel", "informe", "acciones", "seleccionar"]);

  // Mostrar indicador de orden solo en estas columnas
  const sortIndicatorIds = new Set(["nombre", "empresa", "cargo", "fecha"]);

  // Datos de paginación para el footer
  const totalRows = data.length;
  const pageIndex = pagination ? table.getState().pagination.pageIndex : 0; // 0-based
  const pageCount = pagination ? table.getPageCount() : 0;
  const displayPage = pagination ? (totalRows ? pageIndex + 1 : 0) : 0;

  return (
    <div
      className={
        pagination && footerPinned
          ? `flex h-full min-h-0 flex-col ${pageMinHeightClass ?? ""}`
          : undefined
      }
    >
      {/* Card wrapper: añade overflow-hidden para que se respeten los bordes redondeados */}
      <div className="rounded-sm border border-border bg-card overflow-hidden">
        {/* Header sin scroll */}
        <table className="w-full table-fixed border-collapse text-sm rounded-t-sm">
          <colgroup>
            {colWidths.map((w, i) => (
              <col key={i} style={{ width: w }} />
            ))}
          </colgroup>
          <thead className="[&_tr]:border-b border-border bg-card">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((header) => {
                  const colId = header.column.id;
                  const align = centerHeaderIds.has(colId) ? "text-center" : "text-left";
                  return (
                    <th
                      key={header.id}
                      className={`h-10 px-4 py-2 md:h-11 md:py-3 ${align} align-middle font-medium text-secondary-text`}
                      onClick={
                        header.column.getCanSort()
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {sortIndicatorIds.has(colId) && (
                        <span
                          className="ml-1 inline-flex items-center leading-none align-middle pointer-events-none select-none opacity-70"
                          aria-hidden="true"
                        >
                          <span className="inline-block scale-90">
                            {Icons.arrowsOrder}
                          </span>
                        </span>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
        </table>

        {/* Cuerpo (scroll solo si bodyMaxHeightClass) */}
        <div className={bodyMaxHeightClass ? `${bodyMaxHeightClass} overflow-y-auto` : undefined}>
          <table className="w-full table-fixed border-collapse text-sm">
            <colgroup>
              {colWidths.map((w, i) => (
                <col key={i} style={{ width: w }} />
              ))}
            </colgroup>
            <tbody className="[&_tr:last-child]:border-0">
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-border transition-colors hover:bg-muted/20 data-[state=selected]:bg-muted"
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-1.5 md:px-4 md:py-2 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                    No se encontraron trabajadores.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && (
        <div className={`mt-3 flex items-center justify-between gap-2 ${footerPinned ? "mt-2" : ""}`}>
          <div className="text-xs text-muted-foreground">
            Total de trabajadores {totalRows}
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground">
              Página {displayPage} de {pageCount}
            </div>
            <Button size="sm" variant="outline" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              Anterior
            </Button>
            <Button size="sm" variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Siguiente
            </Button>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!confirmRow}
        title="Eliminar trabajador"
        message={confirmRow ? `¿Seguro que desea eliminar a ${confirmRow.nombre}? Esta acción no se puede deshacer.` : ""}
        onConfirm={() => confirmRow && handleEliminar(confirmRow)}
        onCancel={() => setConfirmRow(null)}
      />
    </div>
  );
}