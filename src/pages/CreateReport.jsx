import PageLayout from '../components/PageLayout';
import WorkersList from '../components/WorkersList';
import TemplateSelector from '../components/TemplateSelector';
import ButtonCreateReport from '../components/ButtonCreateReport';
import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"; // <-- import Card

export default function CreateReport() {
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [selectedTpl, setSelectedTpl] = useState(null);
  const [textoBusqueda, setTextoBusqueda] = useState('');

  return (
    <PageLayout
      title="Generar informe"
      headerAction={{ center: <SearchBar onBuscar={setTextoBusqueda} /> }}
    >
      {/* Card de trabajadores */}
      <Card className="border-border/70 shadow-xs p-2 pt-3 gap-1">
        <CardHeader className="px-3 pt-0 pb-0 space-y-0">
          {/* <CardTitle className="text-sm font-semibold text-primary-text">
            Trabajadores
          </CardTitle> */}
          <CardDescription className="text-sm text-secondary-text leading-snug">
            Seleccione el trabajador para generar el informe
          </CardDescription>
        </CardHeader>
        <CardContent className="px-3 pt-0 pb-3">
          <WorkersList
            selectedWorkers={selectedWorkers}
            setSelectedWorkers={setSelectedWorkers}
            actionsMode={false}
            textoBusqueda={textoBusqueda}
            pagination={false}
            stickyHeader={true}
            bodyMaxHeightClass="max-h-[35vh]"
            hideInformeColumn={true}
          />
        </CardContent>
      </Card>

      <TemplateSelector
        value={selectedTpl}
        onChange={setSelectedTpl}
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
