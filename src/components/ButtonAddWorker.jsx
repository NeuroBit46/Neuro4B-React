import ButtonBase from './ButtonBase';
import { useNavigate } from 'react-router-dom';

export default function ButtonAddWorker() {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/añadir-trabajador/');
  };

  return (
    <ButtonBase onClick={handleClick} variant="neutral" size="sm" className="flex items-center gap-2">
      Añadir trabajador
    </ButtonBase>
  );
}
