// src/components/Register.js
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { register } from '../redux/actions/authActions';

const Register = () => {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');  // Puedes definir otros roles como 'admin'

  const handleRegister = (e) => {
    e.preventDefault();
    dispatch(register(email, password, role));
  };

  return (
    <form onSubmit={handleRegister}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Contraseña"
        required
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="user">Usuario</option>
        <option value="admin">Administrador</option>
      </select>
      <button type="submit">Registrarse</button>
    </form>
  );
};

export default Register;
