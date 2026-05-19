import api from '../config/api';

class UbicacionServices {

    // ====== Comunas ======
    async getComunas() {
        return await api.get('/api/comuna/listar');
    }

    async getComuna(id) {
        return await api.get(`/api/comuna/obtener/${id}`);
    }

    async createComuna(data) {
        return await api.post('/api/comuna/crear', data);
    }

    async updateComuna(id, data) {
        return await api.put(`/api/comuna/actualizar/${id}`, data);
    }

    async deleteComuna(id) {
        return await api.delete(`/api/comuna/eliminar/${id}`);
    }

    // ====== Regiones ======
    async getRegiones() {
        return await api.get('/api/region/listar');
    }

    async getRegion(id) {
        return await api.get(`/api/region/obtener/${id}`);
    }

    async createRegion(data) {
        return await api.post('/api/region/crear', data);
    }

    async updateRegion(id, data) {
        return await api.put(`/api/region/actualizar/${id}`, data);
    }

    async deleteRegion(id) {
        return await api.delete(`/api/region/eliminar/${id}`);
    }

    // ====== Países ======
    async getPaises() {
        return await api.get('/api/pais/listar');
    }

    async getPais(id) {
        return await api.get(`/api/pais/obtener/${id}`);
    }

    async createPais(data) {
        return await api.post('/api/pais/crear', data);
    }

    async updatePais(id, data) {
        return await api.put(`/api/pais/actualizar/${id}`, data);
    }

    async deletePais(id) {
        return await api.delete(`/api/pais/eliminar/${id}`);
    }

    // ====== Ubicación Incidente ======
    async getUbicacionesIncidente() {
        return await api.get('/api/ubicacion-incidente/listar');
    }

    async getUbicacionIncidente(id) {
        return await api.get(`/api/ubicacion-incidente/obtener/${id}`);
    }

    async createUbicacionIncidente(data) {
        return await api.post('/api/ubicacion-incidente/crear', data);
    }

    async updateUbicacionIncidente(id, data) {
        return await api.put(`/api/ubicacion-incidente/actualizar/${id}`, data);
    }

    async deleteUbicacionIncidente(id) {
        return await api.delete(`/api/ubicacion-incidente/eliminar/${id}`);
    }
}

export default new UbicacionServices();
