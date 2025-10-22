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

    const url = `${API_BASE}/api/trabajadores/${workerId}/convertir-pdf/`;
    try {
      const resp = await fetch(url, { method: "POST" });
      if (!resp.ok) {
        const ct = resp.headers.get("content-type") || "";
        let detail = "";
        try {
          detail = ct.includes("application/json") ? JSON.stringify(await resp.json()) : await resp.text();
        } catch {
          /* ignore */
        }
        console.error("convertir-pdf fallo", { status: resp.status, detail, url });
        if (mountedRef.current) {
          setStatus(`Error al iniciar conversión (HTTP ${resp.status})`);
        }
      } else {
        if (mountedRef.current) setStatus("Conversión iniciada (procesando en servidor)...");
      }
    } catch (e) {
      console.error("Network/Fetch error convertir-pdf", e);
      if (mountedRef.current) setStatus("Error de red al iniciar conversión");
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

      // Mapear a nombres esperados por la API
      formData.append("nombre", data.name || "");
      formData.append("empresa", data.company || "");
      formData.append("cargo", data.position || "");

      if (data.pdfFile) formData.append("pdf_file", data.pdfFile);
      if (data.excelFile) formData.append("eeg_file", data.excelFile);


      const response = await fetch(`${API_BASE}/api/crear/`, { method: "POST", body: formData });
      const raw = await response.text();
      if (!response.ok) throw new Error(`Error al crear trabajador: ${response.status} ${raw}`);

      const result = JSON.parse(raw);

      if (data.pdfFile) await transformPDF(result.id);

      if (mountedRef.current && opRef.current === myOp && location.key === originKey) {
        navigate("/gestionar-trabajadores");
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
