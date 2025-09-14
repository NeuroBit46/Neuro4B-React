import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PageLayout from "../components/PageLayout";
import WorkerForm from "../components/WorkerForm";

export default function EditWorker() {
  const { id } = useParams(); // ← ID del trabajador
  const navigate = useNavigate();
  const [workerData, setWorkerData] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE;

  // 1️⃣ Cargar datos del trabajador (GET que devuelve JSON)
  useEffect(() => {
    const fetchWorker = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/editar/${id}/`, { method: "GET" });
        if (!response.ok) throw new Error("No se pudo cargar trabajador");
        const data = await response.json();
        setWorkerData(data);
      } catch (error) {
        console.error("Error al cargar trabajador:", error);
        alert("No se pudo cargar la información del trabajador");
      }
    };
    fetchWorker();
  }, [id, API_BASE]);

  const handleUpdate = async (updatedData) => {
    const formData = new FormData();
    formData.append("id", id);
    formData.append("nombre", updatedData.name);
    formData.append("empresa", updatedData.company);
    formData.append("cargo", updatedData.position);

    // Campo no editable que quieres preservar
    if (updatedData.fecha) {
      formData.append("fecha", updatedData.fecha);
    }

    if (updatedData.pdfFile instanceof File) {
      formData.append("ruta_PDF", updatedData.pdfFile);
    }
    if (updatedData.excelFile instanceof File) {
      formData.append("ruta_EEG", updatedData.excelFile);
    }
    if (updatedData.informe instanceof File) {
      formData.append("ruta_PDFConvertido", updatedData.informe);
    }

    try {
      const res = await fetch(`${API_BASE}/api/editar/${id}/`, { 
        method: "POST", 
        body: formData 
      });

      if (!res.ok) throw new Error("Error al actualizar trabajador");

      // ✅ Igual que crear trabajador: volver al listado
      navigate("/archivos-trabajadores");
      
    } catch (error) {
      console.error("Error al actualizar trabajador:", error);
      alert("No se pudo actualizar el trabajador");
    }
  };

  // 3️⃣ Render
  return (
    <PageLayout title="Editar trabajador">
      {workerData ? (
        <WorkerForm
          mode="editar"
          initialData={workerData}
          onSubmit={handleUpdate}
        />
      ) : (
        <p className="text-center text-gray-500">
          Cargando datos del trabajador...
        </p>
      )}
    </PageLayout>
  );
}
