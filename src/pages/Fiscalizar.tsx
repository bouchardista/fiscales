import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Fiscalizar = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir a la página principal con query parameter para scroll automático
    navigate('/?scroll=form', { replace: true });
  }, [navigate]);

  return null; // No renderiza nada ya que redirige inmediatamente
};

export default Fiscalizar;
