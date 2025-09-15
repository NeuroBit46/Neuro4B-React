import { useState } from "react";
import ButtonTransformData from "../components/ButtonTransformData";
import WorkersList from "../components/WorkersList";
import PageLayout from "../components/PageLayout";
import SearchBar from "../components/SearchBar";

export default function TransformData(){
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState('');

  return (
    <PageLayout
      title="Transformar datos"
      headerAction={{ center: <SearchBar onBuscar={setTextoBusqueda} /> }}
    >
      <WorkersList
        selectedWorkers={selectedWorkers}
        setSelectedWorkers={setSelectedWorkers}
        actionsMode={false}
        textoBusqueda={textoBusqueda}
        // Config: sin paginación, scroll vertical con header sticky
        pagination={false}
        stickyHeader={true}
        bodyMaxHeightClass="max-h-[35vh]"
      />
      <ButtonTransformData buttonLabel="Transformar datos" selectedWorkers={selectedWorkers} />
    </PageLayout>
  );
}