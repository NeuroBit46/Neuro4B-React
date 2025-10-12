import React from "react";
import Papa from "papaparse";
import EEGTable from "@/components/EEGTable";
import { fetchTabularByUrl } from "@/lib/tabular";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function TabularLoader({
  title = "Registros EEG",
  fileUrl,
  file,
  workerId,
  token,
  withCredentials = false,
  height = 360,
  compact = false,
  preferBackend = false, // <--- nuevo flag
  onLoaded,              // <--- callback para cerrar overlays externos
}) {
  const [columns, setColumns] = React.useState([]);
  const [rows, setRows] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const ac = new AbortController();
    async function load() {
      try {
        setLoading(true);
        setError(null);

        // 1) File local
        if (file instanceof File) {
          const text = await file.text();
          const parsed = Papa.parse(text, { header: false });
          const all = parsed?.data || [];
          setColumns(all[0] || []);
          setRows(all.slice(1));
          return;
        }

        // 2) URL remota
        if (typeof fileUrl === "string" && fileUrl) {
          if (preferBackend) {
            try {
              const { columns, rows } = await fetchTabularByUrl(fileUrl, {
                token,
                withCredentials,
                signal: ac.signal
              });
              setColumns(columns || []);
              setRows(rows || []);
              return;
            } catch (_) {
              // Fallback CSV directo
            }
          }
          // CSV directo (sin golpear /api/tabular → sin 404 en Network)
          const resp = await fetch(fileUrl, { signal: ac.signal });
          if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
          const text = await resp.text();
          const parsed = Papa.parse(text, { header: false });
          const all = parsed?.data || [];
          setColumns(all[0] || []);
          setRows(all.slice(1));
          return;
        }

        // 3) workerId → endpoint específico
        if (workerId) {
          const { columns, rows } = await fetchEEGJson(workerId, {
            token,
            withCredentials,
            signal: ac.signal
          });
          setColumns(columns || []);
          setRows(rows || []);
          return;
        }

        setError("Sin origen de datos");
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message || "Error");
      } finally {
        setLoading(false);
        // Notifica siempre, haya éxito o error
        try { onLoaded && onLoaded(); } catch {}
      }
    }
    load();
    return () => ac.abort();
  }, [file, fileUrl, workerId, token, withCredentials, preferBackend, onLoaded]);

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">{title}</CardTitle>
          <CardDescription className="text-xs">Cargando…</CardDescription>
        </CardHeader>
        <CardContent>
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

  return (
    <EEGTable
      title={title}
      columns={columns}
      rows={rows}
      height={height}
      compact={compact}
    />
  );
}