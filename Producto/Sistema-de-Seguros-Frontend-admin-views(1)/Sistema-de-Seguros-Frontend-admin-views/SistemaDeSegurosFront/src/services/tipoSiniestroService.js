import api from "../config/api";

const tipoSiniestroService = {
    listar: async () => {
        const response = await api.get("/api/tipo-siniestro/listar");
        return response.data;
    },

    obtenerPorId: async (id) => {
        const response = await api.get(`/api/tipo-siniestro/obtener/${id}`);
        return response.data;
    },

    crear: async (tipoSiniestro) => {
        const response = await api.post("/api/tipo-siniestro/crear", tipoSiniestro);
        return response.data;
    },

    actualizar: async (id, tipoSiniestro) => {
        const response = await api.put(`/api/tipo-siniestro/actualizar/${id}`, tipoSiniestro);
        return response.data;
    },

    eliminar: async (id) => {
        const response = await api.delete(`/api/tipo-siniestro/eliminar/${id}`);
        return response.data;
    },    
};

export default tipoSiniestroService;