import api from '../config/api';

const contratanteService = {
    listar: async () => {
        const response = await api.get('/api/contratante/listar');
        return response.data;
    },

    obtenerPorId: async (id) => {
        const response = await api.get(`/api/contratante/obtener/${id}`);
        return response.data;
    },

    crear: async (contratante) => {
        const response = await api.post('/api/contratante/crear', contratante);
        return response.data;
    },

    actualizar: async (id, contratante) => {
        const response = await api.put(`/api/contratante/actualizar/${id}`, contratante);
        return response.data;
    },

    eliminar: async (id) => {
        const response = await api.delete(`/api/contratante/eliminar/${id}`);
        return response.data;
    },
};

export default contratanteService;
