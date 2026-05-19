import api from '../config/api';

const tipoIncidenteService = {
    listar: async () => {
        const response = await api.get('/api/tipo-incidente/listar');
        return response.data;
    },
    obtenerPorId: async (id) => {
        const response = await api.get(`/api/tipo-incidente/obtener/${id}`);
        return response.data;
    },
    crear: async (tipoIncidente) => {
        const response = await api.post('/api/tipo-incidente/crear', tipoIncidente);
        return response.data;
    },
    actualizar: async (id, tipoIncidente) => {
        const response = await api.put(`/api/tipo-incidente/actualizar/${id}`, tipoIncidente);
        return response.data;
    },
    eliminar: async (id) => {
        const response = await api.delete(`/api/tipo-incidente/eliminar/${id}`);
        return response.data;
    },
};

export default tipoIncidenteService;
