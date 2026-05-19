# Documentación: Envío de correo desde FormularioIncidente

Fecha: 2026-02-24

## Resumen

Se añadió la funcionalidad para enviar correos HTML usando la plantilla `incidente-template.html` poblada con los datos de un `FormularioIncidente`. El envío puede dispararse al crear un formulario proporcionando destinatarios via query param `recipients` en el endpoint de creación.

## Archivos modificados

- `src/main/java/MicroservicioIncidenteSiniestros/services/EmailService.java` — Nuevo método `enviarCorreoFormulario(String[] to, FormularioIncidente formulario)` que mapea campos del formulario a la plantilla Thymeleaf y envía el correo (inline logo).  
- `src/main/java/MicroservicioIncidenteSiniestros/controller/FormularioIncidenteController.java` — El endpoint `POST /api/formulario-incidente/crear` ahora acepta opcionalmente `recipients` (coma-separados) y llama a `EmailService.enviarCorreoFormulario(...)` si se proporciona.
- `src/main/resources/templates/incidente-template.html` — Plantilla Thymeleaf (ya existente) usada para renderizar el correo; se reemplazó la línea de guiones por `<hr class="separator" />`.

## Endpoints relevantes

- `POST /api/formulario-incidente/crear`  
  - Seguridad: requiere roles (`admin_client_role`, `client_role`, `user_client_role`).  
  - Body: JSON con la entidad `FormularioIncidente`.  
  - Query param opcional: `recipients` (ej. `recipients=usuario@example.com,otro@ejemplo.com`).  
  - Comportamiento: guarda el formulario y, si `recipients` está presente, envía el correo poblado.

- `GET /api/formulario-incidente/obtener/{id}`  
  - Usado como `enlaceFormulario` dentro de la plantilla (actualmente apunta a la API interna). Se puede adaptar al frontend si se proporciona la URL base.

## Mapeo de variables (Thymeleaf)

Las variables inyectadas en la plantilla `incidente-template.html` por `enviarCorreoFormulario` son:  

- `asunto` ← `formulario.operacion` (o texto por defecto)  
- `cuerpo` ← `formulario.relatoForm`  
- `idIncidente` ← `formulario.idForm`  
- `fechaIncidente` ← `formulario.fechaHoraIncidente`  
- `tipoIncidente` ← `formulario.tipoIncidente.nombreTipoIncidente`  
- `fechaNotificacion` ← `formulario.fechaIngresoForm`  
- `conductorInvolucrado` ← `formulario.nombreConductor`  
- `rutConductor` ← `formulario.rutConductor`  
- `patenteVehiculo` ← combinación `patente1[/patente2]`  
- `base` ← `formulario.base`  
- `operacion` ← `formulario.operacion`  
 - `enlaceFormulario` ← `/api/formulario-incidente/obtener/{idForm}` (ajustable)

## Ejemplo de uso (curl)

```bash
curl -X POST 'http://localhost:8080/api/formulario-incidente/crear?recipients=usuario@example.com' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer <TU_JWT>' \
  -d '{ "idUsuario":"user-1", "tipoIncidente": {"idTipoIncidente":1}, "fechaIngresoForm":"2026-02-24T10:00:00", "fechaHoraIncidente":"2026-02-24T09:30:00", "relatoForm":"Descripción...", "patente1":"ABC123", "nombreConductor":"Juan Pérez", "rutConductor":"12.345.678-9", "base":"baseX", "operacion":"Registro de incidente" }'
```

## Requisitos y notas

- `EmailService.enviarCorreoFormulario` es `@Async`. Verifica que la aplicación tenga `@EnableAsync` configurado (en la clase principal o configuración).  
- Asegúrate de que `JavaMailSender` esté configurado (propiedades SMTP) y que `logo-tad.png` exista en `src/main/resources` para el inline image.  
- Si deseas que `enlaceFormulario` apunte al frontend público, indícame la URL base y lo adapto.  
- Actualmente el controlador usa el query param `recipients` para los destinatarios; si prefieres tomar destinatarios desde un campo del formulario (`base` u otro), se puede cambiar fácilmente.

## Siguientes pasos recomendados

1. Ejecutar build y pruebas:  
   ```bash
   mvn -f MicroservicioIncidenteSiniestros/pom.xml clean package
   ```
2. Probar con Postman/curl y revisar logs para confirmar envío.  
3. Ajustar `enlaceFormulario` al frontend o ajustar campo de destinatarios según requerimientos.

---

Documento generado automáticamente por desarrollador (resumen de cambios realizados en el código).
