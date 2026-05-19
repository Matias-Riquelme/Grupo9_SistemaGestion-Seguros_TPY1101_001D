import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import logo from '../assets/logo.png';
import AuthKeycloakServices from '../services/authKeycloakServices';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const data = await AuthKeycloakServices.login(username, password);
            if (data) {
                console.log('Login exitoso');

                // Verificar roles y redirigir
                if (AuthKeycloakServices.hasRole('admin_client_role')) {
                    navigate('/'); // Dashboard de Admin
                } else if (AuthKeycloakServices.hasRole('client_role') || AuthKeycloakServices.hasRole('user_client_role')) {
                    navigate('/formulario'); // Formulario de Cliente
                } else {
                    // Por defecto si no tiene roles específicos o es otro tipo de usuario
                    navigate('/');
                }
            } else {
                setError('Credenciales inválidas');
            }
        } catch (err) {
            console.error(err);
            setError('Error al iniciar sesión. Verifique sus credenciales.');
        }
    };

    return (
        <div className="login-page-wrapper">
            <div className="login-card-container">
                <div className="login-branding">

                    <h1>Sistemas de Gestión de Incidentes</h1>
                    <p>Centraliza, registra y da seguimiento a incidentes de forma rápida y segura.</p>

                    <ul className="branding-features">
                        <li>Registro y seguimiento de incidentes</li>
                        <li>Historial y trazabilidad completa</li>
                        <li>Acceso seguro por roles</li>
                    </ul>

                </div>

                <form onSubmit={handleLogin} className="login-form-static">
                    <img src={logo} alt="Logo" className="login-logo-img" />
                    <h2 className="form-title">Iniciar Sesión</h2>
                    <span className="form-subtitle">Ingresa tus credenciales para acceder</span>

                    {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Nombre de usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <a href="#" className="forgot-pass">¿Olvidaste tu contraseña?</a>
                    <button className="btn-primary">Ingresar</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
