import api from '../config/api';

/**
 * Servicio para el CRUD de Vehículos.
 *
 * VehiculoDTO del backend:
 *   id_vehiculo (int64), patente, marca, modelo, tipo,
 *   anio (int32), anioRegistro (int32), num_motor_veh (string), num_chasis_veh (string)
 */
const vehiculoService = {

    /** GET /api/vehiculos — Listar todos */
    listar: async () => {
        const response = await api.get('/api/vehiculos');
        return response.data;
    },

    /** GET /api/vehiculos/{id} — Obtener por ID */
    obtenerPorId: async (id) => {
        const response = await api.get(`/api/vehiculos/${id}`);
        return response.data;
    },

    /** POST /api/vehiculos — Crear nuevo */
    crear: async (vehiculo) => {
        const response = await api.post('/api/vehiculos', vehiculo);
        return response.data;
    },

    /** POST /api/vehiculos/actualizar/{id} — Actualizar existente */
    actualizar: async (id, vehiculo) => {
        const response = await api.post(`/api/vehiculos/actualizar/${id}`, vehiculo);
        return response.data;
    },

    /** DELETE /api/vehiculos/{id} — Eliminar */
    eliminar: async (id) => {
        const response = await api.delete(`/api/vehiculos/${id}`);
        return response.data;
    },

    /** POST /api/vehiculos/importar — Importar desde archivo */
    importar: async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/api/vehiculos/importar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    /** GET /api/vehiculos/exportar — Exportar a archivo */
    exportar: async () => {
        const response = await api.get('/api/vehiculos/exportar', {
            responseType: 'blob',
        });
        return response.data;
    },
};

export default vehiculoService;
