import React, { useState, useEffect } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate, Link } from "react-router-dom";
import '../styles/LoginPage.css';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [fadeIn, setFadeIn] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setFadeIn(true);
    }, []);

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
      };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const token = await user.getIdToken();

            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists()) throw new Error("No se encontraron los datos del usuario.");

            const { role, empresa_id } = userDoc.data();
            if (!empresa_id) throw new Error("El usuario no tiene una empresa asignada.");

            localStorage.setItem('authToken', token);
            localStorage.setItem('userRole', role);
            localStorage.setItem('userEmpresaId', empresa_id);
            localStorage.setItem('userEmail', user.email);
            localStorage.setItem('lastActivity', Date.now().toString());

            navigate('/dashboard');
            window.location.reload();
        } catch (error) {
            console.error('Error de login:', error.message);
            setError(error.message);
        }
    };

    return (
        <div className="login-bg d-flex align-items-center justify-content-center">
            <div className={`login-card card shadow-lg ${fadeIn ? 'fade-slide' : ''}`}>
                <h2 className="text-center mb-4">Iniciar sesión</h2>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label">Correo electrónico</label>
                        <input 
                            type="email" 
                            className="form-control" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="tu@email.com" 
                            required 
                        />
                    </div>
                    <div className="mb-4 password-wrapper">
                        <label className="form-label">Contraseña</label>
                        <div className="password-input-group">
                            <input 
                            type={showPassword ? "text" : "password"}
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            required
                            />
                            <span className="toggle-password" onClick={togglePasswordVisibility}>
                            {showPassword ? "🙈" : "👁️"}
                            </span>
                        </div>
                    </div>

                    <button type="submit" className="btn glass-btn w-100 mb-3">Iniciar sesión</button>
                </form>
                <div className="text-center">
                    <p className="register-link-text">¿No tienes cuenta? <Link to="/register" className="link-primary">Regístrate aquí</Link></p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
