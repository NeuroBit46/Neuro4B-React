import PageLayout from '../components/PageLayout';
import WorkersList from '../components/WorkersList';
import TemplateCardList from '../components/TemplateCard';
import ButtonCreateReport from '../components/ButtonCreateReport';
import { useState } from 'react';
import SearchBar from '../components/SearchBar';

export default function CreateReport() {
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [selectedTpl, setSelectedTpl] = useState(null);
  const [textoBusqueda, setTextoBusqueda] = useState('');

  return (
    <PageLayout
      title="Generar informe"
      tooltip="Para generar un informe, seleccione al menos un trabajador y una plantilla."
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

      <TemplateCardList
        selectedTpl={selectedTpl}
        setSelectedTpl={setSelectedTpl}
      />

      <ButtonCreateReport
        buttonLabel="Generar informe"
        requireTemplate={true}
        selectedWorkers={selectedWorkers}
        selectedTpl={selectedTpl}
      />
    </PageLayout>
  );
}
