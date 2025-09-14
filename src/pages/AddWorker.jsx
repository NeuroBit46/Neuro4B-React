import PageLayout from "../components/PageLayout";
import WorkerForm from "../components/WorkerForm";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function AddWorker() {
  const navigate = useNavigate();
  const [status, setStatus] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE;

  const transformPDF = async (workerId) => {
    setStatus("Iniciando transformación de PDF...");
    try {
      const res = await fetch(`${API_BASE}/api/trabajadores/${workerId}/convertir-pdf/`, {
        method: "POST",
      });

      if (res.ok) {
        setStatus("Transformación de PDF iniciada");
      } else {
        setStatus("Transformación fallida o pendiente");
      }
    } catch {
      setStatus("Error al transformar PDF");
    }
  };


  const handleCreate = async (newData) => {
    setStatus("Creando trabajador...");

    try {
      const formData = new FormData();
      formData.append("nombre", newData.name);
      formData.append("empresa", newData.company);
      formData.append("cargo", newData.position);

      if (newData.pdfFile) formData.append("pdf_file", newData.pdfFile);
      if (newData.excelFile) formData.append("eeg_file", newData.excelFile);

      const response = await fetch(`${API_BASE}/api/crear/`, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Trabajador creado:", result);
        setStatus("Trabajador creado correctamente");

        if (newData.pdfFile) {
          await transformPDF(result.id);
        }

        navigate("/archivos-trabajadores");
      } else {
        const errorData = await response.json();
        console.error("❌ Error al crear trabajador:", errorData);
        setStatus("Error al crear trabajador");
      }
    } catch (error) {
      console.error("❌ Error de conexión:", error);
      setStatus("Error de conexión con el servidor");
    }
  };

  return (
    <PageLayout
      title="Añadir trabajador"
    >
      <WorkerForm mode="crear" onSubmit={handleCreate} />
      {status && (
        <div className="mt-4 text-sm text-gray-600">
          <strong>Estado:</strong> {status}
        </div>
      )}
    </PageLayout>
  );
}
