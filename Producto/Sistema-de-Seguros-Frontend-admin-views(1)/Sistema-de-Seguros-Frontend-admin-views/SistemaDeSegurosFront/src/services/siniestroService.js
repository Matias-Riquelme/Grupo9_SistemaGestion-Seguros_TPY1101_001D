import api from '../config/api';

const siniestroService = {
    listar: async () => {
        const response = await api.get('/api/siniestro/listar');
        return response.data;
    },

    obtenerPorId: async (id) => {
        const response = await api.get(`/api/siniestro/obtener/${id}`);
        return response.data;
    },

    crear: async (siniestro) => {
        const response = await api.post('/api/siniestro/crear', siniestro);
        return response.data;
    },

    actualizar: async (id, siniestro) => {
        const response = await api.put(`/api/siniestro/actualizar/${id}`, siniestro);
        return response.data;
    },

    eliminar: async (id) => {
        const response = await api.delete(`/api/siniestro/eliminar/${id}`);
        return response.data;
    },

    updateObservacion: async (id, observacion) => {
        const response = await api.patch(`/api/siniestro/actualizar-observacion/${id}`, {
            observacion: observacion
        });
        return response.data;
    },

    importar: async (formData) => {
        const response = await api.post('/api/siniestro/importar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    exportar: async () => {
        const response = await api.get('/api/siniestro/exportar', {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'siniestros.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
    },
};

export default siniestroService;
