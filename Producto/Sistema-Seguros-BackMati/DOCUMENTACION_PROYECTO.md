# Documentación de Implementaciones Recientes - Sistema de Seguros

Este documento resume los cambios y nuevas funcionalidades implementadas en el sistema.

---

## 1. Filtros Dependientes de Geografía (Frontend)

Se ha mejorado la página de **Ubicación y Tipo de Incidente** con un sistema de filtros en cascada para facilitar la búsqueda de ubicaciones.

### Cambios en `Ubicacion_TipoIncidente.jsx`
- **Filtros Jerárquicos**: Se añadió una sección de filtros por País, Región y Comuna.
- **Lógica en Cascada**:
    - Seleccionar un **País** habilita y filtra las **Regiones** correspondientes.
	- Seleccionar una **Región** habilita y filtra las **Comunas** correspondientes.
- **Tabla Dinámica**: El listado de ubicaciones se actualiza en tiempo real según los filtros seleccionados.
- **Acción Rápida**: Botón "Limpiar Filtros" para resetear la búsqueda.

---

## 2. Sistema de Notificaciones por Correo Electrónico

Se ha implementado la infraestructura necesaria para enviar correos electrónicos desde el sistema.

### Backend (MicroservicioIncidenteSiniestros)
- **Dependencia**: Adición de `spring-boot-starter-mail`.
- **EmailService.java**: Servicio asíncrono que procesa el envío de correos sin bloquear la API.
- **EmailController.java**: Endpoint `POST /api/notificacion/enviar-correo` para solicitudes externas (frontend).
- **Configuración**: 
    - Soportado mediante variables de entorno en `.env`.
    - Configurado para SMTP (ej. Gmail).

### Frontend
- **notificacionService.js**: Nuevo servicio utilitario ubicado en `src/services/`.
- **Métodos**:
    - `enviarCorreo(destinatario, asunto, cuerpo)`: Método base.
    - `notificarNuevoSiniestro(email, siniestro)`: Método pre-formateado para avisos de siniestros.

### Configuración SMTP (Archivo `.env`)
Para que el envío funcione, asegúrese de editar las siguientes líneas en el archivo `.env` del backend:
```bash
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=tu-correo@gmail.com
SPRING_MAIL_PASSWORD=tu-contrasena-de-aplicacion
```

### Integración con Creación de Incidentes
El servicio ha sido implementado exitosamente en `src/pages/usuario/Formulario.jsx`. Al completar el envío de un nuevo incidente, el sistema envía una notificación asíncrona por correo electrónico con los detalles básicos del siniestro, sin bloquear el flujo principal de la aplicación.

---

## 3. Archivos Modificados / Creados

### Frontend
- **[MODIFY]** `src/pages/otros/Ubicacion_TipoIncidente.jsx`
- **[NEW]** `src/services/notificacionService.js`

### Backend
- **[MODIFY]** `MicroservicioIncidenteSiniestros/pom.xml`
- **[MODIFY]** `MicroservicioIncidenteSiniestros/.../MicroservicioIncidenteSiniestrosApplication.java` (EnableAsync)
- **[NEW]** `MicroservicioIncidenteSiniestros/.../services/EmailService.java`
- **[NEW]** `MicroservicioIncidenteSiniestros/.../controller/EmailController.java`
- **[NEW]** `MicroservicioIncidenteSiniestros/.../dto/EmailRequestDTO.java`
- **[MODIFY]** `MicroservicioIncidenteSiniestros/src/main/resources/application.properties`
- **[MODIFY]** `.env` (Raíz del backend)

---
*Documentación generada el 23 de febrero de 2026.*
