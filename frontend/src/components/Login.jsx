// src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Realizamos la solicitud POST al backend
      const response = await axios.post('http://localhost:5000/roomies/users/login', { username, password });

      // Si la autenticación es exitosa
      localStorage.setItem('isAuthenticated', true); // Guardamos el estado de autenticación
      localStorage.setItem('token', response.data.token); // Guardamos el token (si es necesario)
      navigate('/dashboard'); // Redirigimos al dashboard
    } catch (error) {
      // Si ocurre un error (credenciales incorrectas)
      setError(error.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div>
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Usuario</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Iniciar sesión</button>
      </form>
    </div>
  );
};

export default Login;
