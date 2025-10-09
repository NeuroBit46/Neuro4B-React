import { useState } from "react";
import ButtonTransformData from "../components/ButtonTransformData";
import WorkersList from "../components/WorkersList";
import PageLayout from "../components/PageLayout";
import SearchBar from "../components/SearchBar";
import {
  Card,
  CardHeader,
  CardDescription,
  CardContent,
} from "@/components/ui/card"; // añadido

export default function TransformData(){
  const [selectedWorkers, setSelectedWorkers] = useState([]);
  const [textoBusqueda, setTextoBusqueda] = useState('');

  return (
    <PageLayout
      title="Transformar datos"
      headerAction={{ center: <SearchBar onBuscar={setTextoBusqueda} /> }}
    >
      <Card className="border-border/70 shadow-xs p-2 pt-3 gap-1">
        <CardHeader className="px-3 pt-0 pb-0 space-y-0">
          <CardDescription className="text-xs text-secondary-text leading-snug">
            Seleccione el trabajador para transformar sus datos
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
          />
        </CardContent>
      </Card>

      <ButtonTransformData
        buttonLabel="Transformar datos"
        selectedWorkers={selectedWorkers}
      />
    </PageLayout>
  );
}