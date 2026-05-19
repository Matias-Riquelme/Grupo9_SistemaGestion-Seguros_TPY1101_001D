import api from '../config/api';

const deducibleService = {
    listar: async () => {
        const response = await api.get('/api/deducible/listar');
        return response.data;
    },
    obtenerPorId: async (id) => {
        const response = await api.get(`/api/deducible/obtener/${id}`);
        return response.data;
    },
    crearParaPoliza: async (idPoliza, deducible) => {
        const response = await api.post(`/api/deducible/poliza/${idPoliza}`, deducible);
        return response.data;
    },
    listarPorPoliza: async (idPoliza) => {
        const response = await api.get(`/api/deducible/poliza/${idPoliza}`);
        return response.data;
    },
    actualizar: async (id, deducible) => {
        const response = await api.put(`/api/deducible/actualizar/${id}`, deducible);
        return response.data;
    },
    eliminar: async (id) => {
        const response = await api.delete(`/api/deducible/eliminar/${id}`);
        return response.data;
    },
};

export default deducibleService;
