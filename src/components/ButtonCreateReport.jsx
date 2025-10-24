import ButtonWithProgress from "./ButtonWithProgress";
import useWorkers from "./UseWorkers";
import { normalizeRuta } from "../lib/utils";

export default function ButtonCreateReport(props) {
  const { workers } = useWorkers();
  const {
    requireTemplate = false,
    selectedWorkers = [],
    selectedTpl = null,
    autoDownload = false,
    API_BASE = import.meta.env.VITE_API_BASE,
    buttonLabel = "Generar informe",
  } = props;

  const canGenerate = requireTemplate
    ? selectedWorkers.length > 0 && selectedTpl !== null
    : selectedWorkers.length > 0;

  const onAction = async () => {
    const pk = selectedWorkers[0];
    const workerObj = workers.find((w) => w.id === pk);
    const name = workerObj?.nombre?.trim() || `Trabajador ${pk}`;
    const tplLabel =
      selectedTpl?.label ||
      selectedTpl?.name ||
      "Informe";
    const fileName = `${tplLabel} ${name} - Neuro4B.docx`;

    // Lógica para saber si ya tiene informe
    const informeRuta = normalizeRuta(workerObj?.ruta_Informe);
    if (informeRuta) {
      // Ya existe el informe, descárgalo directamente y muestra "LISTO" instantáneo tras 1s
      const response = await fetch(informeRuta, { method: "GET", credentials: "include" });
      if (!response.ok) throw new Error("No se pudo obtener el informe existente.");
      const blob = await response.blob();
      await new Promise((r) => setTimeout(r, 1000)); // Espera 1 segundo
      return { blob, fileName, instant: true };
    }

    // Si no existe, genera el informe normalmente
    const base = (API_BASE ?? "").toString().trim() || window.location.origin;
    const apiBase = base.replace(/\/+$/, "");
    const response = await fetch(`${apiBase}/api/descargar-informe/${pk}/`, {
      method: "GET",
      credentials: "include",
    });
    if (!response.ok) throw new Error("No se pudo generar el informe.");
    const blob = await response.blob();
    return { blob, fileName };
  };

  return (
    <ButtonWithProgress
      buttonLabel={buttonLabel}
      onAction={onAction}
      disabled={!canGenerate}
      autoDownload={autoDownload}
      progressText="Generando…"
      readyText="LISTO"
      errorText="No se pudo generar el informe. Intente nuevamente."
      downloadLabel="Descargar"
      variant="neutral"
      size="md"
    />
  );
}