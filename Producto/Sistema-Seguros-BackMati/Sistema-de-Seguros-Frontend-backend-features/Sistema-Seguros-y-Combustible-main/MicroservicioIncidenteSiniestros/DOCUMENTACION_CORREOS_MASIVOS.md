# Resumen de Modificaciones: Soporte Multicorreo

Para permitir el envío de correos electrónicos a múltiples personas de manera simultánea en el `MicroservicioIncidenteSiniestros`, se realizaron las siguientes modificaciones en el código fuente:

## Cambios Implementados

1. **Ampliación del DTO (`EmailRequestDTO.java`):**
   - Se añadió un nuevo campo `List<String> destinatarios` manteniendo también el original `String destinatario`. Esto permite total retrocompatibilidad con integraciones previas (por ejemplo, si envían un correo a una sola persona seguirán funcionando tal cual).
   
2. **Actualización del Servicio (`EmailService.java`):**
   - Se modificó la firma de `public void enviarCorreo(String to, ...)` a `public void enviarCorreo(String[] to, ...)`.
   - Se actualizó también el log en la consola para mostrar el array completo de destinatarios usando `Arrays.toString()`.  
   - Como  el framework de envío en Spring Boot (`SimpleMailMessage`) usa internamente la función `setTo(String... to)`, pasarle el array habilita nativamente el envío masivo.

3. **Adaptación del Controlador (`EmailController.java`):**
   - Se modificó la función recibidora `enviarCorreo(@RequestBody EmailRequestDTO request)` para fusionar las direcciones recibidas en `request.getDestinatario()` y las enviadas en `request.getDestinatarios()` en un solo arreglo Java (`String[]`).
   - Se añadió una validación básica para rechazar la solicitud si la lista calculada de correos se encuentra vacía.

## Ejemplo de uso API (Payload JSON)

A partir de ahora, el endpoint `/api/notificacion/enviar-correo` procesará correctamente este formato:
```json
{
    "destinatarios": ["juan@ejemplo.com", "maria@ejemplo.com"],
    "asunto": "Notificación de Incidente",
    "cuerpo": "Este mensaje será entregado a Juan y a María."
}
```
También sigue soportando el formato original:
```json
{
    "destinatario": "juan@ejemplo.com",
    "asunto": "Notificación de Incidente",
    "cuerpo": "Este mensaje será entregado a Juan."
}
```
