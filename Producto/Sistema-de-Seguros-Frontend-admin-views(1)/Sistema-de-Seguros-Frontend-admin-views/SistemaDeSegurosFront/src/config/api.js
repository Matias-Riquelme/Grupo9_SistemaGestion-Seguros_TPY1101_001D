import axios from 'axios';
import AuthKeycloakServices from '../services/authKeycloakServices';

// URL base: se puede configurar vía variables de entorno
// Si estamos en entorno de desarrollo con Vite proxy, no necesitamos la URL absoluta local
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Flag para evitar múltiples refresh simultáneos
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Interceptor para agregar el token de autenticación a todas las peticiones
api.interceptors.request.use(
    async (config) => {
        let token = localStorage.getItem('token');

        // Si hay token y está expirado, intentar refrescarlo antes de la petición
        if (token && AuthKeycloakServices.isTokenExpired()) {
            console.log("[API] Token expirado, intentando refrescar...");
            try {
                token = await AuthKeycloakServices.refreshAccessToken();
                console.log("[API] Token refrescado exitosamente");
            } catch (error) {
                console.warn("[API] No se pudo refrescar el token:", error.message);
                return Promise.reject(error);
            }
        }

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de respuesta: si recibe 401, intentar refresh y reintentar
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                // Si ya se está refrescando, encolar la petición
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const newToken = await AuthKeycloakServices.refreshAccessToken();
                processQueue(null, newToken);
                originalRequest.headers.Authorization = `Bearer ${newToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Si falla el refresh, redirigir a login
                if (window.location.pathname !== '/login') {
                    localStorage.removeItem('token');
                    localStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        // Manejo de otros errores comunes
        if (error.response) {
            switch (error.response.status) {
                case 403:
                    console.error('No tienes permisos para realizar esta acción');
                    break;
                case 404:
                    console.error('Recurso no encontrado');
                    break;
                case 500:
                    console.error('Error interno del servidor');
                    break;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
export { API_BASE_URL };
