import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { register } from '../redux/actions/authActions';
import { useNavigate } from 'react-router-dom';  
import { toast } from 'react-toastify';
import '../styles/RegisterPage.css';

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('usuario');
  const [empresa_id, setEmpresaId] = useState('Seedgroup');
  const [isLoading, setIsLoading] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => password.length >= 6;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password || !role || !empresa_id) {
      toast.error('Todos los campos son obligatorios.');
      return;
    }

    if (!validateEmail(email)) {
      toast.warning('Por favor ingresa un correo electrónico válido.');
      return;
    }

    if (!validatePassword(password)) {
      toast.warning('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    dispatch(register(email, password, role, empresa_id))
      .then(() => {
        toast.success('¡Registro exitoso!');
        navigate('/login');
      })
      .catch((err) => {
        console.error('Register error', err);
        toast.error(err.response?.data?.message || 'Error al registrarse.');
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="register-bg d-flex align-items-center justify-content-center">
      <div className={`register-wrapper card shadow-lg ${fadeIn ? 'fade-slide' : ''}`}>
        <h2 className="text-center mb-4">Crea tu cuenta</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@email.com"
              required
            />
          </div>
          <div className="mb-3 password-wrapper">
            <label className="form-label">Contraseña</label>
            <div className="password-input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                required
              />
              <span className="toggle-password" onClick={togglePasswordVisibility}>
                {showPassword ? "🙈" : "👁️"}
              </span>
            </div>
          </div>
          <div className="mb-3">
            <label className="form-label">Rol</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="usuario">Usuario</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="form-label">Empresa</label>
            <select
              className="form-select"
              value={empresa_id}
              onChange={(e) => setEmpresaId(e.target.value)}
            >
              <option value="Seedgroup">Seedgroup</option>
              <option value="Pico">Pico</option>
              <option value="Mutis">Mutis</option>
              <option value="Incedo">Incedo</option>
            </select>
          </div>
          <button type="submit" className="btn glass-btn w-100 mb-2" disabled={isLoading}>
            {isLoading ? 'Registrando...' : 'Registrarse'}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary w-100"
            onClick={() => navigate('/login')}
          >
            Cancelar
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
