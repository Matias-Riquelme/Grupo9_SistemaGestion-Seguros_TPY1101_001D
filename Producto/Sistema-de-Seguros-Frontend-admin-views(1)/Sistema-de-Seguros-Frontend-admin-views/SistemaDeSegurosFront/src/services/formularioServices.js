import api from '../config/api';

class FormularioServices {

    // ====== Tipos de Incidente ======
    async getTiposIncidente() {
        return await api.get('/api/tipo-incidente/listar');
    }

    async getTipoIncidente(id) {
        return await api.get(`/api/tipo-incidente/obtener/${id}`);
    }

    async createTipoIncidente(data) {
        return await api.post('/api/tipo-incidente/crear', data);
    }

    async updateTipoIncidente(id, data) {
        return await api.put(`/api/tipo-incidente/actualizar/${id}`, data);
    }

    async deleteTipoIncidente(id) {
        return await api.delete(`/api/tipo-incidente/eliminar/${id}`);
    }

    // ====== Formulario de Incidente ======
    async getFormularios() {
        return await api.get('/api/formulario-incidente/listar');
    }

    async getFormulario(id) {
        return await api.get(`/api/formulario-incidente/obtener/${id}`);
    }

    async createFormulario(formulario, recipients = null) {
        let url = '/api/formulario-incidente/crear';
        if (recipients) {
            url += `?recipients=${encodeURIComponent(recipients)}`;
        }
        return await api.post(url, formulario);
    }

    async updateFormulario(id, formulario) {
        return await api.put(`/api/formulario-incidente/actualizar/${id}`, formulario);
    }

    async deleteFormulario(id) {
        return await api.delete(`/api/formulario-incidente/eliminar/${id}`);
    }

    // ====== Terceros ======
    async getTerceros() {
        return await api.get('/api/tercero/listar');
    }

    async getTercero(id) {
        return await api.get(`/api/tercero/obtener/${id}`);
    }

    async createTercero(tercero) {
        return await api.post('/api/tercero/crear', tercero);
    }

    async updateTercero(id, tercero) {
        return await api.put(`/api/tercero/actualizar/${id}`, tercero);
    }

    async deleteTercero(id) {
        return await api.delete(`/api/tercero/eliminar/${id}`);
    }

    // ====== Conductores (External Service - Vehicle/Fuel) ======
    async getConductores() {
        return await api.get('/api/conductores');
    }

    async buscarConductorPorRut(rut) {
        const response = await api.get('/api/conductores');
        const conductores = response.data || [];
        const found = conductores.find(c => c.rut === rut);
        return found || null;
    }

    // ====== Vehículos (External Service - Vehicle/Fuel) ======
    async getVehiculos() {
        return await api.get('/api/vehiculos');
    }

    async buscarVehiculosPorPatente(patente) {
        const response = await api.get('/api/vehiculos');
        const vehiculos = response.data || [];
        if (!patente) return vehiculos;
        const query = patente.toUpperCase().replace(/[^A-Z0-9]/g, '');
        return vehiculos.filter(v => {
            const p = (v.patente || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
            return p.includes(query);
        });
    }

    // ====== Bases (External Service - Vehicle/Fuel) ======
    async getBases() {
        return await api.get('/api/bases');
    }

    // ====== Operaciones (External Service - Vehicle/Fuel) ======
    async getOperaciones() {
        return await api.get('/api/operaciones');
    }

    // ====== Tipos de Vehículo (External Service - Vehicle/Fuel) ======
    async getTiposVehiculo() {
        return await api.get('/api/tipo-vehiculo');
    }

    // ====== Import/Export ======
    async importar(formData) {
        const response = await api.post('/api/formulario-incidente/importar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }

    async exportar() {
        const response = await api.get('/api/formulario-incidente/exportar', {
            responseType: 'blob'
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'formularios_incidente.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
    }
}

export default new FormularioServices();
