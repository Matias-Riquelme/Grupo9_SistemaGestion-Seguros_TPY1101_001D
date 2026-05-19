import api from '../config/api';

const estadoSiniestroService = {
    listar: async () => {
        const response = await api.get('/api/estado-siniestro/listar');
        return response.data;
    },
    obtenerPorId: async (id) => {
        const response = await api.get(`/api/estado-siniestro/obtener/${id}`);
        return response.data;
    },
    crear: async (estado) => {
        const response = await api.post('/api/estado-siniestro/crear', estado);
        return response.data;
    },
    actualizar: async (id, estado) => {
        const response = await api.put(`/api/estado-siniestro/actualizar/${id}`, estado);
        return response.data;
    },
    eliminar: async (id) => {
        const response = await api.delete(`/api/estado-siniestro/eliminar/${id}`);
        return response.data;
    },
};

export default estadoSiniestroService;
