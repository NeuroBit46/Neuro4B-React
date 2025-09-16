import PageLayout from "../components/PageLayout";
import WorkerForm from "../components/WorkerForm";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useLoadingBar } from "@/components/LoadingBar";

export default function AddWorker() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE;

  const BAR_KEY = "create-worker";
  const { start, done } = useLoadingBar(BAR_KEY);

  const transformPDF = async (workerId) => {
    setStatus("Iniciando OCR/transformación de PDF...");
    // Simula ~75s lineales; al aumentar concurrencia, se ralentiza automáticamente
    start({ durationMs: 75_000, prefill: 1 });
    try {
      await fetch(`${API_BASE}/api/trabajadores/${workerId}/convertir-pdf/`, { method: "POST" });
    } catch (e) {
      console.warn("Error al iniciar OCR", e);
    } finally {
      done();
    }
  };

  const handleCreate = async ({ data }) => {
    setStatus("Creando trabajador...");
    try {
      const formData = new FormData();
      formData.append("nombre", data.name);
      formData.append("empresa", data.company);
      formData.append("cargo", data.position);
      if (data.pdfFile) formData.append("pdf_file", data.pdfFile);
      if (data.excelFile) formData.append("eeg_file", data.excelFile);

      const response = await fetch(`${API_BASE}/api/crear/`, { method: "POST", body: formData });
      if (!response.ok) throw new Error("Error al crear trabajador");
      const result = await response.json();

      // Siempre corre OCR si hay PDF
      if (data.pdfFile) {
        await transformPDF(result.id);
      }

      navigate("/archivos-trabajadores");
    } catch (err) {
      console.error(err);
      setStatus("Error al crear trabajador");
    }
  };

  return (
    <PageLayout title="Añadir trabajador">
      <WorkerForm mode="crear" onSubmit={handleCreate} loadingBarKey={BAR_KEY} />
    </PageLayout>
  );
}
