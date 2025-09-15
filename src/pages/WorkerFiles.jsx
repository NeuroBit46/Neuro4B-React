import { useState } from 'react';
import WorkersList from '../components/WorkersList';
import PageLayout from "../components/PageLayout";
import SearchBar from '../components/SearchBar';
import ButtonAddWorker from '../components/ButtonAddWorker';

export default function WorkerFiles(){
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState('');
  const showAddButton = true;

  return (
    <PageLayout
      title="Archivos trabajadores"
      headerAction={{
        center: <SearchBar onBuscar={setTextoBusqueda} />,
        right: showAddButton ? <ButtonAddWorker /> : null
      }}
    >
      <WorkersList
        selectedWorkers={selectedWorkers}
        setSelectedWorkers={setSelectedWorkers}
        actionsMode={true}
        textoBusqueda={textoBusqueda}
        pagination={true}
        pageSize={9}
        stickyHeader={false}
        bodyMaxHeightClass={undefined}
        footerPinned={true}
        pageMinHeightClass="flex-1 min-h-0"   // <- reemplaza 80vh por layout relativo
      />
    </PageLayout>
  );
}