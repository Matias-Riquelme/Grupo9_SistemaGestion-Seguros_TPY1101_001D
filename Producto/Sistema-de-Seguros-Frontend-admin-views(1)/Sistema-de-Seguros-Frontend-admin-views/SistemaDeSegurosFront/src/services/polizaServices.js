import api from '../config/api';

class PolizaServices {

    // ====== Pólizas ======
    async getPolizas() {
        return await api.get('/api/poliza/listar');
    }

    async getPoliza(id) {
        return await api.get(`/api/poliza/obtener/${id}`);
    }

    async createPoliza(data) {
        return await api.post('/api/poliza/crear', data);
    }

    async updatePoliza(id, data) {
        return await api.put(`/api/poliza/actualizar/${id}`, data);
    }

    async deletePoliza(id) {
        return await api.delete(`/api/poliza/eliminar/${id}`);
    }

    async getPolizasConDetalle() {
        return await api.get('/api/poliza/listar-con-detalle');
    }

    async importar(formData) {
        const response = await api.post('/api/poliza/importar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    async exportar() {
        const response = await api.get('/api/poliza/exportar', {
            responseType: 'blob'
        });
        return response.data;
    }

    // ====== Tipo Póliza ======
    async getTiposPoliza() {
        return await api.get('/api/tipo-poliza/listar');
    }

    async getTipoPoliza(id) {
        return await api.get(`/api/tipo-poliza/obtener/${id}`);
    }

    async createTipoPoliza(data) {
        return await api.post('/api/tipo-poliza/crear', data);
    }

    async updateTipoPoliza(id, data) {
        return await api.put(`/api/tipo-poliza/actualizar/${id}`, data);
    }

    async deleteTipoPoliza(id) {
        return await api.delete(`/api/tipo-poliza/eliminar/${id}`);
    }

    // ====== Deducible ======
    async getDeducibles() {
        return await api.get('/api/deducible/listar');
    }

    async getDeducible(id) {
        return await api.get(`/api/deducible/obtener/${id}`);
    }

    async createDeducible(data) {
        return await api.post('/api/deducible/crear', data);
    }

    async updateDeducible(id, data) {
        return await api.put(`/api/deducible/actualizar/${id}`, data);
    }

    async deleteDeducible(id) {
        return await api.delete(`/api/deducible/eliminar/${id}`);
    }

    // ====== Tipo Deducible ======
    async getTiposDeducible() {
        return await api.get('/api/tipo-deducible/listar');
    }

    async getTipoDeducible(id) {
        return await api.get(`/api/tipo-deducible/obtener/${id}`);
    }

    async createTipoDeducible(data) {
        return await api.post('/api/tipo-deducible/crear', data);
    }

    async updateTipoDeducible(id, data) {
        return await api.put(`/api/tipo-deducible/actualizar/${id}`, data);
    }

    async deleteTipoDeducible(id) {
        return await api.delete(`/api/tipo-deducible/eliminar/${id}`);
    }

    // ====== Cobertura ======
    async getCoberturas() {
        return await api.get('/api/cobertura/listar');
    }

    async getCobertura(id) {
        return await api.get(`/api/cobertura/obtener/${id}`);
    }

    async createCobertura(data) {
        return await api.post('/api/cobertura/crear', data);
    }

    async updateCobertura(id, data) {
        return await api.put(`/api/cobertura/actualizar/${id}`, data);
    }

    async deleteCobertura(id) {
        return await api.delete(`/api/cobertura/eliminar/${id}`);
    }

    // ====== Tipo Cobertura ======
    async getTiposCobertura() {
        return await api.get('/api/tipo-cobertura/listar');
    }

    async getTipoCobertura(id) {
        return await api.get(`/api/tipo-cobertura/obtener/${id}`);
    }

    async createTipoCobertura(data) {
        return await api.post('/api/tipo-cobertura/crear', data);
    }

    async updateTipoCobertura(id, data) {
        return await api.put(`/api/tipo-cobertura/actualizar/${id}`, data);
    }

    async deleteTipoCobertura(id) {
        return await api.delete(`/api/tipo-cobertura/eliminar/${id}`);
    }

    // ====== Asegurado ======
    async getAsegurados() {
        return await api.get('/api/asegurado/listar');
    }

    async getAsegurado(id) {
        return await api.get(`/api/asegurado/obtener/${id}`);
    }

    async createAsegurado(data) {
        return await api.post('/api/asegurado/crear', data);
    }

    async updateAsegurado(id, data) {
        return await api.put(`/api/asegurado/actualizar/${id}`, data);
    }

    async deleteAsegurado(id) {
        return await api.delete(`/api/asegurado/eliminar/${id}`);
    }

    // ====== Contratante ======
    async getContratantes() {
        return await api.get('/api/contratante/listar');
    }

    async getContratante(id) {
        return await api.get(`/api/contratante/obtener/${id}`);
    }

    async createContratante(data) {
        return await api.post('/api/contratante/crear', data);
    }

    async updateContratante(id, data) {
        return await api.put(`/api/contratante/actualizar/${id}`, data);
    }

    async deleteContratante(id) {
        return await api.delete(`/api/contratante/eliminar/${id}`);
    }
}

export default new PolizaServices();
