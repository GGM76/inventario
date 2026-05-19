import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hora en milisegundos

const useAutoLogout = (inactivityTimeout = DEFAULT_INACTIVITY_TIMEOUT) => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return;
    }

    const logout = () => {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmpresaId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('lastActivity');
      navigate('/login');
    };

    const isTokenExpired = () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return true;

        const decodedToken = JSON.parse(atob(token.split('.')[1]));
        const expirationTime = decodedToken.exp * 1000;
        return expirationTime < Date.now();
      } catch (error) {
        return true; // Si hay error decodificando, considerar expirado
      }
    };

    const updateLastActivity = () => {
      localStorage.setItem('lastActivity', Date.now().toString());
    };

    const checkInactivity = () => {
      const lastActivity = localStorage.getItem('lastActivity');
      if (!lastActivity) {
        logout();
        return;
      }

      const inactivityDuration = Date.now() - Number(lastActivity);
      if (inactivityDuration >= inactivityTimeout || isTokenExpired()) {
        logout();
      }
    };

    const handleActivity = () => {
      if (isTokenExpired()) {
        logout();
        return;
      }
      updateLastActivity();
    };

    const activityEvents = ['click', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    activityEvents.forEach((event) => window.addEventListener(event, handleActivity));

    updateLastActivity();
    const inactivityTimer = window.setInterval(checkInactivity, 60 * 1000);

    return () => {
      activityEvents.forEach((event) => window.removeEventListener(event, handleActivity));
      window.clearInterval(inactivityTimer);
    };
  }, [inactivityTimeout, navigate]);
};

export default useAutoLogout;
