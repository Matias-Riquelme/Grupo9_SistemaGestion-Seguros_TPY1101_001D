import api from '../config/api';

/**
 * Servicio para el CRUD de Conductores.
 *
 * ConductorDTO del backend:
 *   id_conductor (int64), primerNombre, segundoNombre,
 *   apellidoPaterno, apellidoMaterno, rut, telefono, direccion
 */
const conductorService = {

    /** GET /api/conductores — Listar todos */
    listar: async () => {
        const response = await api.get('/api/conductores');
        return response.data;
    },

    /** GET /api/conductores/{id} — Obtener por ID */
    obtenerPorId: async (id) => {
        const response = await api.get(`/api/conductores/${id}`);
        return response.data;
    },

    /** POST /api/conductores — Crear nuevo */
    crear: async (conductor) => {
        const response = await api.post('/api/conductores', conductor);
        return response.data;
    },

    /** POST /api/conductores/actualizar/{id} — Actualizar existente */
    actualizar: async (id, conductor) => {
        const response = await api.post(`/api/conductores/actualizar/${id}`, conductor);
        return response.data;
    },

    /** DELETE /api/conductores/{id} — Eliminar */
    eliminar: async (id) => {
        const response = await api.delete(`/api/conductores/${id}`);
        return response.data;
    },

    /** POST /api/conductores/importar — Importar desde archivo */
    importar: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/api/conductores/importar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    /** GET /api/conductores/exportar — Exportar a archivo */
    exportar: async () => {
        const response = await api.get('/api/conductores/exportar', {
            responseType: 'blob',
        });
        return response.data;
    },
};

export default conductorService;
