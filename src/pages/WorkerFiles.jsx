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
                limitMode='auto'
                textoBusqueda={textoBusqueda}
            />
        </PageLayout>
    );
}