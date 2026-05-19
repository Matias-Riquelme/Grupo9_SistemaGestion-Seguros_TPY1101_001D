import api from '../config/api';

/**
 * Servicio para el CRUD de Ubicaciones y manejo de geografía (País, Región, Comuna).
 * Basado en patrón de controladores: /api/{entidad}/{accion}
 */
const ubicacionService = {

    // --- Ubicaciones ---
    listar: async () => {
        const response = await api.get('/api/ubicacion-incidente/listar');
        return response.data;
    },

    crear: async (ubicacion) => {
        const response = await api.post('/api/ubicacion-incidente/crear', ubicacion);
        return response.data;
    },

    actualizar: async (id, ubicacion) => {
        const response = await api.put(`/api/ubicacion-incidente/actualizar/${id}`, ubicacion);
        return response.data;
    },

    eliminar: async (id) => {
        await api.delete(`/api/ubicacion-incidente/eliminar/${id}`);
    },

    // --- Geografía: PAISES ---
    listarPaises: async () => {
        const response = await api.get('/api/pais/listar');
        return response.data;
    },

    crearPais: async (pais) => {
        const response = await api.post('/api/pais/crear', pais);
        return response.data;
    },

    eliminarPais: async (id) => {
        const response = await api.delete(`/api/pais/eliminar/${id}`);
        return response.data;
    },

    // --- Geografía: REGIONES ---
    listarRegiones: async () => {
        const response = await api.get('/api/region/listar');
        return response.data;
    },

    crearRegion: async (region) => {
        const response = await api.post('/api/region/crear', region);
        return response.data;
    },

    eliminarRegion: async (id) => {
        const response = await api.delete(`/api/region/eliminar/${id}`);
        return response.data;
    },

    // --- Geografía: COMUNAS ---
    listarComunas: async () => {
        const response = await api.get('/api/comuna/listar');
        return response.data;
    },

    crearComuna: async (comuna) => {
        const response = await api.post('/api/comuna/crear', comuna);
        return response.data;
    },

    eliminarComuna: async (id) => {
        const response = await api.delete(`/api/comuna/eliminar/${id}`);
        return response.data;
    },
};

export default ubicacionService;
