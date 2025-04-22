import React, { useState } from 'react';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { db } from "../firebase/config";  // Importar Firestore
import { doc, getDoc } from "firebase/firestore"; // Para obtener los datos del usuario
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"; // Importa Link de react-router-dom
import '../styles/LoginPage.css'; // Asegúrate de que la ruta sea correcta

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(''); // Limpiar errores previos

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            const token = await user.getIdToken();

            // Obtener los datos del usuario desde Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists()) {
                console.error("Documento no encontrado para el usuario", user.uid);
                throw new Error("No se encontraron los datos del usuario.");
            }

            if (userDoc.exists()) {
                const userData = userDoc.data();
                const { role, empresa_id } = userData;
                if (!empresa_id) {
                    throw new Error("El usuario no tiene una empresa asignada.");
                }

                // Guardar los datos en localStorage
                localStorage.setItem('authToken', token);
                localStorage.setItem('userRole', role);
                localStorage.setItem('userEmpresaId', empresa_id);
                localStorage.setItem('userEmail', user.email); // Guardar el correo electrónico
            }

            navigate('/dashboard');
        } catch (error) {
            console.error('Error de login:', error.message);
            setError(error.message);
        }
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h2>Login</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleLogin}>
                    <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="Correo electrónico" 
                        required
                    />
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        placeholder="Contraseña" 
                        required
                    />
                    <button type="submit">Iniciar sesión</button>
                </form>

                <div className="register-link">
                    <p>¿No tienes cuenta? <Link to="/register">Regístrate aquí</Link></p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
