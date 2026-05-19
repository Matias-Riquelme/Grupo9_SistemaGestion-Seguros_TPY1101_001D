import api from '../config/api';

/**
 * Servicio para el CRUD de Operaciones.
 *
 * OperacionesDTO del backend:
 *   id_operacion (int64), nombre (string), id_base (int64)
 */
const operacionesService = {

    /** GET /api/operaciones — Listar todas */
    listar: async () => {
        const response = await api.get('/api/operaciones');
        return response.data;
    },

    /** GET /api/operaciones/{id} — Obtener por ID */
    obtenerPorId: async (id) => {
        const response = await api.get(`/api/operaciones/${id}`);
        return response.data;
    },

    /** POST /api/operaciones — Crear nueva */
    crear: async (operacion) => {
        const response = await api.post('/api/operaciones', operacion);
        return response.data;
    },

    /** POST /api/operaciones/actualizar/{id} — Actualizar existente */
    actualizar: async (id, operacion) => {
        const response = await api.post(`/api/operaciones/actualizar/${id}`, operacion);
        return response.data;
    },

    /** DELETE /api/operaciones/{id} — Eliminar */
    eliminar: async (id) => {
        const response = await api.delete(`/api/operaciones/${id}`);
        return response.data;
    },
};

export default operacionesService;
