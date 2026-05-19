import api from '../config/api';

/**
 * Servicio para el CRUD de Tipo de Vehículo.
 *
 * TipovehiculoDTO del backend:
 *   id_tipo_vehiculo (int64), tipo_vehiculo (string)
 */
const tipoVehiculoService = {

    /** GET /api/tipo-vehiculo — Listar todos */
    listar: async () => {
        const response = await api.get('/api/tipo-vehiculo');
        return response.data;
    },

    /** GET /api/tipo-vehiculo/{id} — Obtener por ID */
    obtenerPorId: async (id) => {
        const response = await api.get(`/api/tipo-vehiculo/${id}`);
        return response.data;
    },

    /** POST /api/tipo-vehiculo — Crear nuevo */
    crear: async (tipoVehiculo) => {
        const response = await api.post('/api/tipo-vehiculo', tipoVehiculo);
        return response.data;
    },

    /** POST /api/tipo-vehiculo/actualizar/{id} — Actualizar existente */
    actualizar: async (id, tipoVehiculo) => {
        const response = await api.post(`/api/tipo-vehiculo/actualizar/${id}`, tipoVehiculo);
        return response.data;
    },

    /** DELETE /api/tipo-vehiculo/{id} — Eliminar */
    eliminar: async (id) => {
        const response = await api.delete(`/api/tipo-vehiculo/${id}`);
        return response.data;
    },
};

export default tipoVehiculoService;
