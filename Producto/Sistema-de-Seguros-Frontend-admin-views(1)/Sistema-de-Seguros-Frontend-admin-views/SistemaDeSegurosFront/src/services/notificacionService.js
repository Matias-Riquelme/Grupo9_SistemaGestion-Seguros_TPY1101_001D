import api from '../config/api';

/**
 * Servicio para el envío de notificaciones por correo electrónico.
 * Se conecta con el Microservicio de Incidentes y Siniestros.
 */
class NotificacionService {

    /**
     * Envía un correo electrónico a través del backend.
     * @param {string} destinatario - Email del receptor
     * @param {string} asunto - Asunto del correo
     * @param {string} cuerpo - Contenido del mensaje
     * @returns {Promise} - Promesa con la respuesta del servidor
     */
    async enviarCorreo(destinatario, asunto, cuerpo) {
        try {
            const response = await api.post('/api/notificacion/enviar-correo', {
                destinatario,
                asunto,
                cuerpo
            });
            return response.data;
        } catch (error) {
            console.error('Error en NotificacionService.enviarCorreo:', error);
            throw error;
        }
    }

    /**
     * Función de conveniencia para notificar nuevos siniestros.
     * @param {string} email - Email del receptor
     * @param {Object} siniestro - Datos del siniestro
     */
    async notificarNuevoSiniestro(email, siniestro) {
        const asunto = `Nuevo Siniestro Registrado: ${siniestro.descripcion || 'Sin descripción'}`;
        const cuerpo = `
            Se ha registrado un nuevo siniestro en el sistema.
            
            Detalles:
            - Descripción: ${siniestro.descripcion || 'N/A'}
            - Fecha: ${new Date().toLocaleDateString()}
            
            Por favor, ingrese al sistema para más detalles.
        `;
        return this.enviarCorreo(email, asunto, cuerpo);
    }
}

export default new NotificacionService();
