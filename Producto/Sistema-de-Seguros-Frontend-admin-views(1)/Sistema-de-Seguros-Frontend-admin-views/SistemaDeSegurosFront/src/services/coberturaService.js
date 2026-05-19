import api from '../config/api';

const coberturaService = {
    listar: async () => {
        const response = await api.get('/api/cobertura/listar');
        return response.data;
    },
    obtenerPorId: async (id) => {
        const response = await api.get(`/api/cobertura/obtener/${id}`);
        return response.data;
    },
    crearParaPoliza: async (idPoliza, cobertura) => {
        const response = await api.post(`/api/cobertura/poliza/${idPoliza}`, cobertura);
        return response.data;
    },
    listarPorPoliza: async (idPoliza) => {
        const response = await api.get(`/api/cobertura/poliza/${idPoliza}`);
        return response.data;
    },
    actualizar: async (id, cobertura) => {
        const response = await api.put(`/api/cobertura/actualizar/${id}`, cobertura);
        return response.data;
    },
    eliminar: async (id) => {
        const response = await api.delete(`/api/cobertura/eliminar/${id}`);
        return response.data;
    },
};

export default coberturaService;
