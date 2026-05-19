import api from '../config/api';

class DocumentoServices {

    // Listar todos los documentos
    async getDocuments() {
        return await api.get('/api/documentos/');
    }

    // Subir un documento (FormData)
    async uploadDocument(formData) {
        try {
            return await api.post('/api/documentos/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        } catch (err) {
            console.error('[DocumentoServices] uploadDocument error:', err.response?.status, err.response?.data || err.message);
            throw err;
        }
    }
    
//Buscar por id Incindente
    async getDocumentsByIncidente(idIncidente) {
        return await api.get(`/api/documentos/incidente/${idIncidente}`);
    }

    // Buscar documentos con filtros
    async searchDocuments(params) {
        return await api.get('/api/documentos/Buscar', { params });
    }

    // Eliminar un documento por ID
    async deleteDocument(id) {
        return await api.delete(`/api/documentos/${id}`);
    }

    // Obtener URL de descarga para un archivo
   getDownloadUrl(filename) {
    return `${api.defaults.baseURL}/api/documentos/Archivo/${filename}`;
}
}

export default new DocumentoServices();
