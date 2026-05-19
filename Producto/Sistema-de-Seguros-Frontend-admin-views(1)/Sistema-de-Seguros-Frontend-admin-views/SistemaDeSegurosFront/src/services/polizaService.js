import api from '../config/api';

const polizaService = {
    listar: async () => {
        const response = await api.get('/api/poliza/listar');
        return response.data;
    },

    listarConDetalle: async () => {
        const response = await api.get('/api/poliza/listar-con-detalle');
        return response.data;
    },

    obtenerPorId: async (id) => {
        const response = await api.get(`/api/poliza/obtener/${id}`);
        return response.data;
    },

    crear: async (poliza) => {
        const response = await api.post('/api/poliza/crear', poliza);
        return response.data;
    },

    actualizar: async (id, poliza) => {
        const response = await api.put(`/api/poliza/actualizar/${id}`, poliza);
        return response.data;
    },

    eliminar: async (id) => {
        const response = await api.delete(`/api/poliza/eliminar/${id}`);
        return response.data;
    },

    importar: async (formData) => {
        const response = await api.post('/api/poliza/importar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    exportar: async () => {
        const response = await api.get('/api/poliza/exportar', {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'polizas.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
    },
};

export default polizaService;
