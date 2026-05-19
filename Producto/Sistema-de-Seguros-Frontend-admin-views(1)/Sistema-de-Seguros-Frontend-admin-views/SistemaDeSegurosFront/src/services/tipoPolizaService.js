import api from '../config/api';

const tipoPolizaService = {
    listar: async () => {
        const response = await api.get('/api/tipo-poliza/listar');
        return response.data;
    },

    obtenerPorId: async (id) => {
        const response = await api.get(`/api/tipo-poliza/obtener/${id}`);
        return response.data;
    },

    crear: async (tipoPoliza) => {
        const response = await api.post('/api/tipo-poliza/crear', tipoPoliza);
        return response.data;
    },

    actualizar: async (id, tipoPoliza) => {
        const response = await api.put(`/api/tipo-poliza/actualizar/${id}`, tipoPoliza);
        return response.data;
    },

    eliminar: async (id) => {
        const response = await api.delete(`/api/tipo-poliza/eliminar/${id}`);
        return response.data;
    },
};

export default tipoPolizaService;
