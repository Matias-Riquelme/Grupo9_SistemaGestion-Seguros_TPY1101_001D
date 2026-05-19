import api from '../config/api';
import axios from 'axios';

// Toma la IP actual en la que estás navegando y le agrega el puerto de Keycloak
const KEYCLOAK_URL = import.meta.env.VITE_KEYCLOAK_URL || `http://${window.location.hostname}:9090`;
const REALM = "spring-boot-realm-dev";
//local camilo
//const CLIENT_ID = "spring-boot-api-rest";
//const CLIENT_SECRET = "dCnOQ01y9fACHPfrllGSD1RwgBHbUlM9"; // Nota: Usar solo en dev/test. Frontend no debe tener secretos en prod.

//local mati
const CLIENT_ID = "spring-boot-client-dev";
const CLIENT_SECRET = "HrIdrnJjg91jEkLdFVMFS7Y6stLHk2qG"; // Nota: Usar solo en dev/test. Frontend no debe tener secretos en prod.

class AuthKeycloakServices {
    // Eliminar rol de usuario
    async removeRoleFromUser(userId, role) {
        try {
            const response = await api.post(`/api/keycloak/user/remove-role/${userId}`, { role });
            return response.data;
        } catch (error) {
            console.error(`Error al eliminar rol ${role} del usuario ${userId}:`, error);
            throw error;
        }
    }
    // Asignar rol a usuario
    async assignRoleToUser(userId, role) {
        try {
            const response = await api.post(`/api/keycloak/user/assign-role/${userId}`, { role });
            return response.data;
        } catch (error) {
            console.error(`Error al asignar rol a usuario ${userId}:`, error);
            throw error;
        }
    }

    // Autenticación (Obtener Token)
    async login(username, password) {
        try {
            const params = new URLSearchParams();
            params.append('grant_type', 'password');
            params.append('client_id', CLIENT_ID);
            params.append('client_secret', CLIENT_SECRET);
            params.append('username', username);
            params.append('password', password);

            const response = await axios.post(
                `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
                params,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            if (response.data.access_token) {
                localStorage.setItem('token', response.data.access_token);
                localStorage.setItem('refreshToken', response.data.refresh_token);
                return response.data;
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error en login:", error);
            throw error;
        }
    }

    // Cerrar sesión
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
    }

    // Verificar si está autenticado
    isAuthenticated() {
        return !!localStorage.getItem('token');
    }

    // Verificar si el token actual está expirado
    isTokenExpired() {
        const token = localStorage.getItem('token');
        if (!token) return true;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            const decoded = JSON.parse(jsonPayload);
            // Considerar expirado si faltan menos de 30 segundos
            return decoded.exp * 1000 < Date.now() + 30000;
        } catch {
            return true;
        }
    }

    // Refrescar el access token usando el refresh token
    async refreshAccessToken() {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }
        try {
            const params = new URLSearchParams();
            params.append('grant_type', 'refresh_token');
            params.append('client_id', CLIENT_ID);
            params.append('client_secret', CLIENT_SECRET);
            params.append('refresh_token', refreshToken);

            const response = await axios.post(
                `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
                params,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            if (response.data.access_token) {
                localStorage.setItem('token', response.data.access_token);
                localStorage.setItem('refreshToken', response.data.refresh_token);
                return response.data.access_token;
            }
            throw new Error('No access token in refresh response');
        } catch (error) {
            console.error('Error al refrescar token:', error);
            // Si el refresh token también expiró, limpiar y redirigir a login
            this.logout();
            throw error;
        }
    }

    // Decodificar token para obtener roles
    getUserRoles() {
        const token = localStorage.getItem('token');
        if (!token) return [];
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const decoded = JSON.parse(jsonPayload);

            // Buscar roles en resource_access (específico del cliente) o realm_access (global)
            let roles = [];

            // Opción 1: Roles del cliente (lo más común en Keycloak para apps)
            if (decoded.resource_access && decoded.resource_access[CLIENT_ID] && decoded.resource_access[CLIENT_ID].roles) {
                roles = [...roles, ...decoded.resource_access[CLIENT_ID].roles];
            }

            // Opción 2: Roles del Realm
            if (decoded.realm_access && decoded.realm_access.roles) {
                roles = [...roles, ...decoded.realm_access.roles];
            }

            return roles;
        } catch (error) {
            console.error("Error al decodificar token:", error);
            return [];
        }
    }

    // Verificar si tiene un rol específico
    hasRole(roleName) {
        const roles = this.getUserRoles();
        return roles.includes(roleName);
    }

    // Obtener ID del usuario (sub claim del token)
    getUserId() {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const decoded = JSON.parse(jsonPayload);
            return decoded.sub;
        } catch (error) {
            console.error("Error al obtener User ID del token:", error);
            return null;
        }
    }

    // Listar todos los usuarios
    async getAllUsers() {
        try {
            const response = await api.get('/api/keycloak/user/search');
            return response.data;
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
            throw error;
        }
    }

    // Listar todos los usuarios con roles
    async getAllUsersWithRoles() {
        try {
            const response = await api.get('/api/keycloak/user/search-roles');
            return response.data;
        } catch (error) {
            console.error("Error al obtener usuarios con roles:", error);
            throw error;
        }
    }

    // Listar usuarios almacenados en la base de datos local
    async getAllUsersDB() {
        try {
            const response = await api.get('/api/keycloak/user/db-list');
            return response.data;
        } catch (error) {
            console.error("Error al obtener usuarios de la DB:", error);
            throw error;
        }
    }

    // Buscar un usuario por username
    async findUserByUsername(username) {
        try {
            const response = await api.get(`/api/keycloak/user/search/${username}`);
            return response.data;
        } catch (error) {
            console.error(`Error al buscar usuario ${username}:`, error);
            throw error;
        }
    }

    // Crear un usuario
    // userDTO debe tener la estructura: { username, email, firstName, lastName, password, roles: [] }
    async createUser(userDTO) {
        try {
            const response = await api.post('/api/keycloak/user/create', userDTO);
            return response.data;
        } catch (error) {
            console.error("Error al crear usuario:", error);
            throw error;
        }
    }

    // Actualizar un usuario
    // userDTO puede contener campos a actualizar
    async updateUser(userId, userDTO) {
        try {
            const response = await api.put(`/api/keycloak/user/update/${userId}`, userDTO);
            return response.data;
        } catch (error) {
            console.error(`Error al actualizar usuario ${userId}:`, error);
            throw error;
        }
    }

    // Eliminar un usuario
    async deleteUser(userId) {
        try {
            const response = await api.delete(`/api/keycloak/user/delete/${userId}`);
            return response.data;
        } catch (error) {
            console.error(`Error al eliminar usuario ${userId}:`, error);
            throw error;
        }
    }
}

export default new AuthKeycloakServices();
