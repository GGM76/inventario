// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../redux/actions/authActions';

const LoginPage = () => {
  const dispatch = useDispatch();
  const { error } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validar formulario
    if (!email || !password) {
      setValidationError('Todos los campos son obligatorios.');
      return;
    }

    setValidationError('');
    dispatch(login(email, password));
  };

  return (
    <div>
      <h1>Iniciar sesión</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {validationError && <p style={{ color: 'red' }}>{validationError}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
};

export default LoginPage;
