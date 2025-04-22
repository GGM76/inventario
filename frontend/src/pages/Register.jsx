import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { register } from '../redux/actions/authActions';
import { useNavigate } from 'react-router-dom';  
import '../styles/RegisterPage.css';  // Asegúrate de importar el CSS

const RegisterPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();  // Inicializamos el navigate

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('usuario');  // Definimos el rol con valor predeterminado 'usuario'
  const [empresa_id, setEmpresaId] = useState('empresa123');  // Cambié 'empresa' por 'empresa_id'
  const [validationError, setValidationError] = useState('');
  const [isLoading, setIsLoading] = useState(false);  // Estado para manejar carga

  // Validación de email
  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  // Validación de contraseña
  const validatePassword = (password) => {
    return password.length >= 6;  // Por ejemplo, contraseñas de al menos 6 caracteres
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  
    // Validar formulario
    if (!email || !password || !role || !empresa_id) {  // Cambié 'empresa' por 'empresa_id'
      setValidationError('Todos los campos son obligatorios.');
      return;
    }
  
    if (!validateEmail(email)) {
      setValidationError('Por favor ingresa un correo electrónico válido.');
      return;
    }
  
    if (!validatePassword(password)) {
      setValidationError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
  
    setValidationError('');
    setIsLoading(true);  // Iniciar el estado de carga
  
    // Asegúrate de enviar los parámetros correctamente
    dispatch(register(email, password, role, empresa_id))  // Cambié 'empresa' por 'empresa_id'
      .then(() => {
        // Si el registro es exitoso, redirigimos al Login
        navigate('/login');  // Redirigimos al login después de un registro exitoso
      })
      .catch((err) => {
        // Manejo de errores, si el registro falla
        console.error('Register error', err);
        setValidationError(err.response?.data?.message || 'Error al registrarse.');
      })
      .finally(() => {
        setIsLoading(false);  // Detener el estado de carga
      });
  };
  

  return (
    <div className="register-container">
      <div className="register-form">
        <h1>Registrarse</h1>
        {validationError && <p className="error-message">{validationError}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Ingresa tu email"
              aria-label="Correo electrónico"
            />
          </div>
          <div className="input-group">
            <label>Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Crea una contraseña"
              aria-label="Contraseña"
            />
          </div>
          <div className="input-group">
            <label>Rol:</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="usuario">Usuario</option>
              {/* Puedes agregar otros roles si es necesario */}
              {/* <option value="admin">Admin</option> */}
            </select>
          </div>
          <div className="input-group">
            <label>Empresa:</label>
            <select
              value={empresa_id}  // Cambié 'empresa' por 'empresa_id'
              onChange={(e) => setEmpresaId(e.target.value)}  // Cambié 'setEmpresa' por 'setEmpresaId'
            >
              <option value="empresa123">Empresa 123</option>
              <option value="empresa234">Empresa 234</option>
              <option value="empresa345">Empresa 345</option>
              <option value="empresa456">Empresa 456</option>
            </select>
          </div>
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Cargando...' : 'Registrarse'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
