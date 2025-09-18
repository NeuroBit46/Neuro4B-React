import PageLayout from "../components/PageLayout";
import WorkerForm from "../components/WorkerForm";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useLoadingBar } from "@/components/LoadingBar";

export default function AddWorker() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE;

  const mountedRef = useRef(true);
  const opRef = useRef(0);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const BAR_KEY = "create-worker";
  const { start, done } = useLoadingBar(BAR_KEY);

  const transformPDF = async (workerId) => {
    if (mountedRef.current) setStatus("Iniciando OCR/transformación de PDF...");
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
    const myOp = ++opRef.current;
    const originKey = location.key;

    if (mountedRef.current) setStatus("Creando trabajador...");
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

      if (data.pdfFile) {
        await transformPDF(result.id);
      }

      if (mountedRef.current && opRef.current === myOp && location.key === originKey) {
        navigate("/archivos-trabajadores");
      }
    } catch (err) {
      console.error(err);
      if (mountedRef.current) setStatus("Error al crear trabajador");
    }
  };

  return (
    <PageLayout title="Añadir trabajador">
      <WorkerForm mode="crear" onSubmit={handleCreate} loadingBarKey={BAR_KEY} />
    </PageLayout>
  );
}
