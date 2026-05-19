import api from '../config/api';

class SiniestroServices {

    // ====== Siniestros ======
    async getSiniestros() {
        return await api.get('/api/siniestro/listar');
    }

    async getSiniestro(id) {
        return await api.get(`/api/siniestro/obtener/${id}`);
    }

    async createSiniestro(data) {
        return await api.post('/api/siniestro/crear', data);
    }

    async updateSiniestro(id, data) {
        return await api.put(`/api/siniestro/actualizar/${id}`, data);
    }

    async deleteSiniestro(id) {
        return await api.delete(`/api/siniestro/eliminar/${id}`);
    }

    async importar(formData) {
        const response = await api.post('/api/siniestro/importar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    async exportar() {
        const response = await api.get('/api/siniestro/exportar', {
            responseType: 'blob'
        });
        return response.data;
    }

    async updateObservacion(id, observacion) {
        return await api.patch(`/api/siniestro/actualizar-observacion/${id}`, observacion, {
            headers: {
                'Content-Type': 'text/plain'
            }
        });
    }

    // Estadísticas
    async contarSiniestrosMesAno(mes, ano) {
        return await api.get('/api/siniestro/contar-mes-ano', { params: { mes, ano } });
    }

    async contarSiniestrosAno(ano) {
        return await api.get(`/api/siniestro/contar-ano/${ano}`);
    }

    // ====== Estado Siniestro ======
    async getEstadosSiniestro() {
        return await api.get('/api/estado-siniestro/listar');
    }

    async getEstadoSiniestro(id) {
        return await api.get(`/api/estado-siniestro/obtener/${id}`);
    }

    async createEstadoSiniestro(data) {
        return await api.post('/api/estado-siniestro/crear', data);
    }

    async updateEstadoSiniestro(id, data) {
        return await api.put(`/api/estado-siniestro/actualizar/${id}`, data);
    }

    async deleteEstadoSiniestro(id) {
        return await api.delete(`/api/estado-siniestro/eliminar/${id}`);
    }

    // ====== Tipo Siniestro ======
    async getTiposSiniestro() {
        return await api.get('/api/tipo-siniestro/listar');
    }

    async getTipoSiniestro(id) {
        return await api.get(`/api/tipo-siniestro/obtener/${id}`);
    }

    async createTipoSiniestro(data) {
        return await api.post('/api/tipo-siniestro/crear', data);
    }

    async updateTipoSiniestro(id, data) {
        return await api.put(`/api/tipo-siniestro/actualizar/${id}`, data);
    }

    async deleteTipoSiniestro(id) {
        return await api.delete(`/api/tipo-siniestro/eliminar/${id}`);
    }

    // ====== Cierre ======
    async getCierres() {
        return await api.get('/api/cierre/listar');
    }

    async getCierre(id) {
        return await api.get(`/api/cierre/obtener/${id}`);
    }

    async createCierre(data) {
        return await api.post('/api/cierre/crear', data);
    }

    async updateCierre(id, data) {
        return await api.put(`/api/cierre/actualizar/${id}`, data);
    }

    async deleteCierre(id) {
        return await api.delete(`/api/cierre/eliminar/${id}`);
    }
}

export default new SiniestroServices();
