import api from '../config/api';

const cierreService = {
    listar: async () => {
        const response = await api.get('/api/cierre/listar');
        return response.data;
    },
    obtenerPorId: async (id) => {
        const response = await api.get(`/api/cierre/obtener/${id}`);
        return response.data;
    },
    crear: async (cierre) => {
        const response = await api.post('/api/cierre/crear', cierre);
        return response.data;
    },
    actualizar: async (id, cierre) => {
        const response = await api.put(`/api/cierre/actualizar/${id}`, cierre);
        return response.data;
    },
    eliminar: async (id) => {
        const response = await api.delete(`/api/cierre/eliminar/${id}`);
        return response.data;
    },
};

export default cierreService;
