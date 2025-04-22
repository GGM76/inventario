import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useAutoLogout = (inactivityTimeout = 15 * 60 * 1000) => {  // Tiempo en milisegundos (15 minutos por defecto)
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      return; // No hacemos nada si no hay token, lo que evitará redirecciones innecesarias
    }

    // Función para verificar la expiración del token
    const checkTokenExpiration = () => {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));  // Decodificamos el JWT
      const expirationTime = decodedToken.exp * 1000;  // Convertir el tiempo de expiración a milisegundos

      if (expirationTime < Date.now()) {
        // Si el token ha expirado, redirigir al login
        localStorage.removeItem('authToken');
        navigate('/login');
      }
    };

    // Función para manejar la inactividad
    const handleInactivity = () => {
      const timer = setTimeout(() => {
        checkTokenExpiration();
      }, inactivityTimeout);

      // Limpiar el timer cuando haya actividad del usuario
      const resetTimer = () => {
        clearTimeout(timer);
        handleInactivity();  // Reiniciar el temporizador
      };

      // Detectamos eventos de actividad (click, teclado, etc.)
      const events = ['click', 'mousemove', 'keydown', 'scroll'];
      events.forEach(event => window.addEventListener(event, resetTimer));

      return () => {
        events.forEach(event => window.removeEventListener(event, resetTimer));
        clearTimeout(timer);
      };
    };

    handleInactivity();
  }, [inactivityTimeout, navigate]);
};

export default useAutoLogout;
