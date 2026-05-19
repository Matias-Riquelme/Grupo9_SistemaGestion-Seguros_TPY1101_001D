import api from '../config/api';

/**
 * Servicio para el CRUD de Bases.
 *
 * BaseDTO del backend:
 *   id_base (int64), nombre (string)
 */
const baseService = {

    /** GET /api/bases — Listar todas */
    listar: async () => {
        const response = await api.get('/api/bases');
        return response.data;
    },

    /** GET /api/bases/{id} — Obtener por ID */
    obtenerPorId: async (id) => {
        const response = await api.get(`/api/bases/${id}`);
        return response.data;
    },

    /** POST /api/bases — Crear nueva */
    crear: async (base) => {
        const response = await api.post('/api/bases', base);
        return response.data;
    },

    /** POST /api/bases/actualizar/{id} — Actualizar existente */
    actualizar: async (id, base) => {
        const response = await api.post(`/api/bases/actualizar/${id}`, base);
        return response.data;
    },

    /** DELETE /api/bases/{id} — Eliminar */
    eliminar: async (id) => {
        const response = await api.delete(`/api/bases/${id}`);
        return response.data;
    },
};

export default baseService;
