import { useState } from "react";
import ArchivoPreviewModal from "../components/ArchivoPreviewModal";
import useWorkers from "./UseWorkers";
import WorkersTable from "./WorkersTable";

export default function WorkersList({
  selectedWorkers,
  setSelectedWorkers,
  actionsMode,
  limitMode,
  textoBusqueda,
  pagination,
  pageSize,
  stickyHeader,
  bodyMaxHeightClass,
  footerPinned,
  pageMinHeightClass,
  hideInformeColumn,
  hideEEGColumn,
}) {
  const { workers: rawWorkers, setWorkers, loading } = useWorkers();
  const [archivoVisible, setArchivoVisible] = useState(null);

  const handleDeleteSuccess = (deletedId) => {
    setWorkers(prev => prev.filter(w => w.id !== deletedId));
    setSelectedWorkers(prev => prev.filter(id => id !== deletedId));
  };

  return (
    <div>
      {loading ? (
        <div className="text-center text-sm text-neutral-500 py-4">Cargando trabajadores...</div>
      ) : (
        <WorkersTable
          workers={rawWorkers}
          textoBusqueda={textoBusqueda}
          actionsMode={actionsMode}
          selectedWorkers={selectedWorkers}
          setSelectedWorkers={setSelectedWorkers}
          onArchivoClick={setArchivoVisible}
          onDeleteSuccess={handleDeleteSuccess}
          pagination={pagination}
          pageSize={pageSize}
          stickyHeader={stickyHeader}
          bodyMaxHeightClass={bodyMaxHeightClass}
          footerPinned={footerPinned}
          pageMinHeightClass={pageMinHeightClass}
          hideInformeColumn={hideInformeColumn}
          hideEEGColumn={hideEEGColumn}
        />
      )}

      {archivoVisible && (
        <ArchivoPreviewModal file={archivoVisible} onClose={() => setArchivoVisible(null)} />
      )}
    </div>
  );
}
