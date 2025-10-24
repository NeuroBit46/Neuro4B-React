import ButtonWithProgress from "./ButtonWithProgress";
import useWorkers from "./UseWorkers";

export default function ButtonTransformData({
  buttonLabel = "Exportar datos",
  selectedWorkers = [],
  API_BASE = import.meta.env.VITE_API_BASE,
}) {
  const { workers } = useWorkers();
  const canTransform = selectedWorkers.length > 0;

  const onAction = async () => {
    const workerId = selectedWorkers[0];
    const workerObj = workers.find((w) => w.id === workerId);
    const name = workerObj?.nombre?.trim() || `Trabajador ${workerId}`;
    const date = workerObj?.fecha?.trim() || "";
    const fileName = `Nesplora ${name} ${date}.xlsx`;

    let res = await fetch(`${API_BASE}/api/trabajador/${workerId}/descargar-excel`);
    if (!res.ok) {
      res = await fetch(`${API_BASE}/api/trabajadores/${workerId}/convertir-pdf/`, { method: "POST" });
    }
    if (!res.ok) throw new Error("No se pudieron exportar los datos.");
    const blob = await res.blob();
    return { blob, fileName };
  };

  return (
    <ButtonWithProgress
      buttonLabel={buttonLabel}
      onAction={onAction}
      disabled={!canTransform}
      progressText="Exportando datos…"
      readyText="LISTO"
      errorText="No se pudieron exportar los datos. Intenta de nuevo."
      downloadLabel="Descargar"
      variant="neutral"
      size="md"
    />
  );
}
