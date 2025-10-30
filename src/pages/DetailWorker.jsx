import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import WorkerForm from '../components/WorkerForm';
import PageLayout from '../components/PageLayout';

// const API_BASE = import.meta.env.VITE_API_BASE;
const API_BASE = (import.meta.env.VITE_API_BASE ?? "/api").replace(/\/+$/, "");

export default function DetailWorker() {
  const { id } = useParams();
  const [workerData, setWorkerData] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/listar/`)
      .then(res => res.json())
      .then(data => {
        const found = data.find(w => w.id === parseInt(id));
        if (found) {
          const buildFile = (ruta, tipo) => {
            if (!ruta) return null;

            const cleanPath = ruta.startsWith('/') ? ruta : `/${ruta}`;
            const fullUrl = cleanPath.startsWith('/media/')
              ? `${API_BASE}${cleanPath}`
              : cleanPath;

            return {
              name: cleanPath.split('/').pop(),
              url: fullUrl,
              type: tipo,
              size: found.tamano || 0,
              lastModified: found.fecha_modificacion || Date.now()
            };
          };

          setWorkerData({
            name: found.nombre,
            company: found.empresa,
            position: found.cargo,
            pdfFile: buildFile(found.ruta_PDF, 'application/pdf'),
            excelFile: buildFile(found.ruta_EEG, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
          });
        }
      });
  }, [id]);

  return (
    <PageLayout title="Ver trabajador">
      {workerData ? (
        <WorkerForm
          mode="ver"
          initialData={workerData}
          emptyLabels={{
            name: "Nombre no registrado",
            company: "Empresa no indicada",
            position: "Cargo no indicado"
          }}
        />
      ) : (
        <div className="text-center text-neutral-500 py-6">Cargando datos del trabajador...</div>
      )}
    </PageLayout>
  );
}