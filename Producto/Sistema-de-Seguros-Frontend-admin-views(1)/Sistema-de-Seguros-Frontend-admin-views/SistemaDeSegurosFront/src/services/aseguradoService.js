import api from '../config/api';

const aseguradoService = {
    listar: async () => {
        const response = await api.get('/api/asegurado/listar');
        return response.data;
    },

    obtenerPorId: async (id) => {
        const response = await api.get(`/api/asegurado/obtener/${id}`);
        return response.data;
    },

    crear: async (asegurado) => {
        const response = await api.post('/api/asegurado/crear', asegurado);
        return response.data;
    },

    actualizar: async (id, asegurado) => {
        const response = await api.put(`/api/asegurado/actualizar/${id}`, asegurado);
        return response.data;
    },

    eliminar: async (id) => {
        const response = await api.delete(`/api/asegurado/eliminar/${id}`);
        return response.data;
    },
};

export default aseguradoService;
