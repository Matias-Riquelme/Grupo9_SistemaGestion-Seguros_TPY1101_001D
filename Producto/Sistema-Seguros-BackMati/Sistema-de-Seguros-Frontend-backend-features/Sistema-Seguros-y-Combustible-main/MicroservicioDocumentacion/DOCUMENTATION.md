# Documentación del Microservicio de Documentación

## Descripción General
Este microservicio de Spring Boot maneja la subida, almacenamiento, búsqueda y descarga de documentos. Incluye características avanzadas como encriptación de archivos, búsqueda por metadatos e integración con otros microservicios.

## Características Implementadas

### 1. Búsqueda de Documentos
Permite buscar documentos almacenados por diversos criterios.

#### Entidad Document
- **Campos**: id, filename, originalFilename, contentType, size, uploadDate, uploadedBy, encryptedPath
- **Propósito**: Almacena metadatos de cada documento en la base de datos MySQL.

#### Repositorio DocumentRepository
- Métodos de búsqueda: findByFilenameContainingIgnoreCase, findByContentType, findByUploadedBy, findByUploadDateBetween, findBySizeBetween, findByOriginalFilename

#### Endpoint de Búsqueda
- **URL**: `GET /api/documentos/search`
- **Parámetros opcionales**:
  - `filename`: Buscar por nombre de archivo (contiene)
  - `contentType`: Buscar por tipo MIME
  - `uploadedBy`: Buscar por usuario que subió
- **Respuesta**: Lista de documentos en JSON

Ejemplo: `GET /api/documentos/search?filename=contrato`

### 2. Encriptación de Archivos
Los archivos se encriptan antes de almacenarse y se desencriptan al descargarlos para mayor seguridad.

#### Servicio EncryptionService
- Utiliza AES-128 con clave fija (en producción, usar keystore o variables de entorno).
- Métodos: encrypt(byte[]), decrypt(byte[])

#### Modificaciones en FileSystemStorageService
- `store()`: Encripta el archivo antes de guardarlo en disco.
- `loadAsResource()`: Desencripta el archivo al descargarlo, creando un archivo temporal.

**Nota de seguridad**: La clave de encriptación es fija para simplicidad. En producción, rotar claves y usar gestión segura.

### 3. Integración con Otros Microservicios
Notifica a otros servicios cuando se sube un documento.

#### Servicio NotificationService
- Usa RestTemplate para llamadas HTTP.
- Método: notifyUpload(String filename, String uploadedBy)
- Envía notificación a URL configurable (ej. ApiGateway).

#### Integración en FileSystemStorageService
- Después de guardar un documento, llama a notificationService.notifyUpload().

**Configuración**: Ajustar la URL en NotificationService según el sistema (ej. `http://localhost:8081/api/notifications`).

## Endpoints Principales

- **Subir archivo**: `POST /api/documentos/` (MultipartFile)
- **Descargar archivo**: `GET /api/documentos/files/{nombreArchivo}`
- **Buscar documentos**: `GET /api/documentos/search` (con parámetros)
- **Listar archivos**: `GET /api/documentos/`

## Configuración
- Base de datos: MySQL (configurado en docker-compose.yml)
- Puerto: 8080 (o 8082 en Docker)
- Perfiles: dev (Docker), prod (application-prod.properties)

## Ejecución
1. Iniciar con Docker: `docker-compose up`
2. Acceder a Swagger UI: `http://localhost:8082/swagger-ui.html`

## Dependencias Agregadas
- Ninguna nueva (usa dependencias existentes de Spring Boot).

## Mejoras Futuras
- Autenticación JWT para uploadedBy.
- Versionado de documentos.
- Compresión automática.
- Tests unitarios para nuevas funcionalidades.

## Notas
- Archivos encriptados no son legibles sin desencriptar.
- Notificaciones son asíncronas y no bloquean la subida.
- Buscar por filename es case-insensitive.</content>
<parameter name="filePath">c:\Users\rique\Desktop\sistemaDocumentacion\Sistema-Seguros-y-Combustible\MicroservicioDocumentacion\DOCUMENTATION.md