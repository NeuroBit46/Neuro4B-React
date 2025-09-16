import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import WorkerForm from "@/components/WorkerForm";
import { useLoadingBar } from "@/components/LoadingBar";

export default function EditWorker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [workerData, setWorkerData] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE;

  const BAR_KEY = `ocr-worker-${id}`;
  const { start, done } = useLoadingBar(BAR_KEY);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/editar/${id}/`);
        if (!res.ok) throw new Error("No se pudo cargar trabajador");
        setWorkerData(await res.json());
      } catch (e) {
        console.error(e);
        alert("No se pudo cargar la información del trabajador");
      }
    })();
  }, [id, API_BASE]);

  const runOCR = async () => {
    start({ durationMs: 75_000, prefill: 1 });
    try {
      await fetch(`${API_BASE}/api/trabajadores/${id}/convertir-pdf/`, { method: "POST" });
    } finally {
      done();
    }
  };

  const handleUpdate = async ({ data, meta }) => {
    const formData = new FormData();
    formData.append("id", id);
    formData.append("nombre", data.name);
    formData.append("empresa", data.company);
    formData.append("cargo", data.position);
    if (data.pdfFile instanceof File) formData.append("ruta_PDF", data.pdfFile);
    if (data.excelFile instanceof File) formData.append("ruta_EEG", data.excelFile);

    try {
      const res = await fetch(`${API_BASE}/api/editar/${id}/`, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Error al actualizar trabajador");
      if (meta?.pdfChanged) await runOCR();
      navigate("/archivos-trabajadores");
    } catch (e) {
      console.error(e);
      alert("No se pudo actualizar el trabajador");
    }
  };

  return workerData ? (
    <WorkerForm mode="editar" initialData={workerData} onSubmit={handleUpdate} loadingBarKey={BAR_KEY} />
  ) : (
    <p className="text-center text-gray-500">Cargando datos del trabajador...</p>
  );
}
