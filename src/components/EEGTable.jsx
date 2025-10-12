import React from "react";
import Papa from "papaparse";
import { fetchTabularByUrl } from "@/lib/tabular";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function EEGTable({
  fileUrl,
  file,
  token,
  withCredentials = false,
  height = 360,
  compact = false,
  title = "Registros EEG",
  preferBackend = false,
  onLoaded,
  showHeader = false,
  onMetaChange,
}) {
  const [columns, setColumns] = React.useState([]);
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  // clave estable para deduplicar cargas (evita doble fetch en StrictMode)
  const loadKey = React.useMemo(() => {
    return file instanceof File
      ? `file:${file.name}|${file.size}|${file.lastModified}`
      : typeof fileUrl === "string" && fileUrl
      ? `url:${fileUrl}`
      : "none";
  }, [file, fileUrl]);

  const lastLoadKeyRef = React.useRef("");

  React.useEffect(() => {
    const ac = new AbortController();

    async function load() {
      // si ya cargamos exactamente este origen, no recargar
      if (lastLoadKeyRef.current === loadKey && columns.length && rows.length) {
        setLoading(false);
        try { onLoaded && onLoaded(); } catch {}
        return;
      }
      lastLoadKeyRef.current = loadKey;

      try {
        setLoading(true);
        setError(null);

        if (file instanceof File) {
          const text = await file.text();
          const parsed = Papa.parse(text, { header: false });
          const all = parsed?.data || [];
          setColumns(all[0] || []);
          setRows(all.slice(1));
          return;
        }

        if (typeof fileUrl === "string" && fileUrl) {
          if (preferBackend) {
            try {
              const { columns, rows } = await fetchTabularByUrl(fileUrl, {
                token,
                withCredentials,
                signal: ac.signal,
              });
              setColumns(columns || []);
              setRows(rows || []);
              return;
            } catch (_) {
              // fallback CSV directo
            }
          }
          const resp = await fetch(fileUrl, { signal: ac.signal, headers: { Accept: "text/csv,*/*" } });
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const text = await resp.text();
          const parsed = Papa.parse(text, { header: false });
          const all = parsed?.data || [];
          setColumns(all[0] || []);
          setRows(all.slice(1));
          return;
        }

        setError("Sin origen de datos");
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message || "Error");
      } finally {
        setLoading(false);
        try { onLoaded && onLoaded(); } catch {}
      }
    }

    load();
    return () => ac.abort();
  }, [loadKey, token, withCredentials, preferBackend, onLoaded]); // no incluir columns/rows

  // Metadatos al padre
  const lastMetaKeyRef = React.useRef("");
  React.useEffect(() => {
    const key = `${columns.length}|${rows.length}|${title}`;
    if (key !== lastMetaKeyRef.current) {
      lastMetaKeyRef.current = key;
      onMetaChange?.({ columnsCount: columns.length, rowsCount: rows.length, title });
    }
  }, [columns.length, rows.length, title]);

  const pad = compact ? "px-2 py-1.5" : "px-3 py-2";

  // Altura resuelta para el wrapper (px o vh). Evita "100%".
  const resolvedHeight = React.useMemo(() => {
    if (typeof height === "number") return `${height}px`;
    const h = (height || "").toString().trim();
    if (!h || h === "100%") return "55vh";
    return h; // "60vh", "480px", etc.
  }, [height]);

  if (loading) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader className="p-2">
          <CardTitle className="text-sm">{title}</CardTitle>
          <CardDescription className="text-xs">Cargando…</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 min-h-0">
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-11/12" />
            <Skeleton className="h-6 w-10/12" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!columns.length) {
    return (
      <Card className="h-full flex flex-col">
        {showHeader && (
          <CardHeader className="p-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm">{title}</CardTitle>
              <Badge variant="secondary" className="text-xs">0 filas</Badge>
            </div>
            <CardDescription className="text-xs">Sin datos</CardDescription>
          </CardHeader>
        )}
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      {showHeader && (
        <CardHeader className="pt-2 px-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm">{title}</CardTitle>
            <div className="flex flex-row items-center gap-4">
              <CardDescription className="text-xs">{columns.length} columnas</CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">{rows.length} filas</Badge>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        {/* Altura explícita para el viewport de Radix */}
        <div className="relative w-full min-h-0" style={{ height: resolvedHeight }}>
          <ScrollArea
            type="auto"
            className="h-full w-full [--scrollbar-size:12px]"
          >
            {/* Importante: padding interno para no cortar la barra horizontal/vertical */}
            <div className="w-max min-w-full pr-3 pb-3">
              <Table className="text-xs table-auto">
                <TableHeader>
                  <TableRow>
                    {columns.map((c, i) => (
                      <TableHead key={i} className={`whitespace-nowrap ${pad} bg-background border-b`}>
                        {c}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r, i) => (
                    <TableRow key={i} className={i % 2 ? "bg-muted/20" : ""}>
                      {columns.map((_, j) => (
                        <TableCell key={j} className={`whitespace-nowrap ${pad}`}>
                          {r?.[j] ?? ""}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation="vertical" forceMount className="z-30 w-3" />
            <ScrollBar orientation="horizontal" forceMount className="z-30 h-3" />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}