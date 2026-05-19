# Funcionalidades de Importación - Sistema de Seguros

## Resumen
El sistema cuenta con tres funcionalidades de importación masiva desde archivos Excel (.xlsx) para:
- **Pólizas**
- **Incidentes (Formulario de Incidente)**
- **Siniestros**

Los datos se importan de forma asíncrona en lotes de 500 registros para optimizar el rendimiento.

---

## 1. Importar Pólizas

### Endpoint
```
POST /api/poliza/importar
```

### Descripción
Importa múltiples pólizas desde un archivo Excel.

### Permisos Requeridos
- `admin_client_role`
- `admin`

### Parámetros
- **file** (MultipartFile): Archivo Excel (.xlsx) con los datos de pólizas

### Estructura del Archivo Excel
Las columnas deben estar en este orden (sin encabezados opcionales):

| Columna | Campo | Tipo | Ejemplo |
|---------|-------|------|---------|
| A | Nombre Póliza | String | Póliza SOAT |
| B | Número Póliza | Integer | 12345 |
| C | Tipo Póliza | Integer/String | 1 o "Seguro Obligatorio" |
| D | Asegurado | Integer/String | 1 o "Empresa XYZ" |
| E | Contratante | Integer/String | 1 o "Contratante ABC" |
| F | Fecha Emisión | DateTime | 2024-01-15 10:30:00 |
| G | Fecha Inicio | DateTime | 2024-01-15 10:30:00 |
| H | Fecha Fin | DateTime | 2025-01-15 10:30:00 |
| I | Fecha Vencimiento | DateTime | 2025-01-15 10:30:00 |
| J | Prima | BigDecimal | 150000.50 |
| K | Asegurados Adicionales | String | "Juan Pérez, María García" |

### Ejemplo cURL
```bash
curl -X POST "http://localhost:8080/api/poliza/importar" \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@polizas.xlsx"
```

### Respuesta
```json
{
  "status": 200,
  "message": "Importación exitosa"
}
```

---

## 2. Importar Incidentes (Formulario de Incidente)

### Endpoint
```
POST /api/formulario-incidente/importar
```

### Descripción
Importa múltiples formularios de incidente desde un archivo Excel.

### Permisos Requeridos
- `admin_client_role`
- `admin`

### Parámetros
- **file** (MultipartFile): Archivo Excel (.xlsx) con los datos de incidentes

### Estructura del Archivo Excel
Las columnas deben estar en este orden:

| Columna | Campo | Tipo | Ejemplo |
|---------|-------|------|---------|
| A | Tipo Incidente | Integer/String | 1 o "Choque" |
| B | Ubicación | Integer/String | 1 o "Santiago Centro" |
| C | ID Usuario (Keycloak) | String | "user123@keycloak" |
| D | ID Tipo Vehículo | Integer | 2 |
| E | Fecha Ingreso Formulario | DateTime | 2024-01-15 10:30:00 |
| F | Fecha Hora Incidente | DateTime | 2024-01-15 09:45:00 |
| G | Relato del Incidente | String | "Descripción del incidente..." |
| H | Patente 1 | String | "ABCD-12" |
| I | Patente 2 | String | "EFGH-34" |
| J | Nombre Conductor | String | "Carlos López" |
| K | RUT Conductor | String | "12345678-9" |
| L | Base | String | "Base Providencia" |
| M | Operación | String | "Op-001" |
| N | Lugar Carga | String | "Bodega Central" |
| O | Fecha Inicio Transporte | DateTime | 2024-01-15 10:00:00 |
| P | Destino Carga | String | "Puerto de Valparaíso" |

### Ejemplo cURL
```bash
curl -X POST "http://localhost:8080/api/formulario-incidente/importar" \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@incidentes.xlsx"
```

### Respuesta
```json
{
  "status": 200,
  "message": "Importación exitosa"
}
```

---

## 3. Importar Siniestros

### Endpoint
```
POST /api/siniestro/importar
```

### Descripción
Importa múltiples siniestros desde un archivo Excel.

### Permisos Requeridos
- `admin_client_role`
- `admin`

### Parámetros
- **file** (MultipartFile): Archivo Excel (.xlsx) con los datos de siniestros

### Estructura del Archivo Excel
Las columnas deben estar en este orden:

| Columna | Campo | Tipo | Ejemplo |
|---------|-------|------|---------|
| A | Número Siniestro | String | "SIN-2024-001" |
| B | Fecha Hora Siniestro | DateTime | 2024-01-15 10:30:00 |
| C | Póliza | Integer/String | 1 o "Póliza ABC" |
| D | Estado Siniestro | Integer/String | 1 o "Abierto" |
| E | Tipo Siniestro | Integer/String | 1 o "Choque" |
| F | Deducible Aplicado | BigDecimal | 50000.00 |
| G | Indemnización | BigDecimal | 500000.00 |
| H | Costo Siniestro | BigDecimal | 550000.00 |
| I | Observación | String | "Observaciones del siniestro..." |
| J | ID Formulario Incidente | Integer | 1 |
| K | ID Cierre | Integer | 2 |

### Ejemplo cURL
```bash
curl -X POST "http://localhost:8080/api/siniestro/importar" \
  -H "Authorization: Bearer TOKEN" \
  -F "file=@siniestros.xlsx"
```

### Respuesta
```json
{
  "status": 200,
  "message": "Importación exitosa"
}
```

---

## Características Comunes de Importación

### Procesamiento Asíncrono
- Las importaciones se procesan de forma asíncrona
- Se pueden importar miles de registros sin bloquear la aplicación
- Los registros se guardan en lotes de 500

### Manejo de Errores
- Si hay errores en filas específicas, se reportan pero se continúan importando el resto
- Se devuelve un resumen con los errores encontrados

### Búsqueda de Referencias
Para campos que referencian otras entidades:
- **Por ID**: Si el valor es numérico, se busca por ID
- **Por Nombre**: Si el valor es alfanumérico, se busca por el campo de nombre correspondiente

### Formato de Fechas
Todas las fechas deben estar en formato: `yyyy-MM-dd HH:mm:ss`

Ejemplo: `2024-01-15 14:30:00`

### Formato de Moneda
- Usar punto (.) como separador decimal
- Ejemplo: `150000.50`, `1000.99`

---

## Respuestas de Error Comunes

### Error 400: Archivo Inválido
```json
{
  "status": 400,
  "message": "Error al importar: El archivo no contiene encabezados"
}
```

### Error 401: No Autenticado
```json
{
  "status": 401,
  "message": "Acceso no autorizado"
}
```

### Error 403: Permiso Insuficiente
```json
{
  "status": 403,
  "message": "No tiene permisos para realizar esta operación"
}
```

### Error 500: Error del Servidor
```json
{
  "status": 500,
  "message": "Error: [descripción del error]"
}
```

---

## Servicios Asociados

- **PolizaImportService**: Servicio de importación de pólizas
- **FormularioIncidenteImportService**: Servicio de importación de incidentes
- **SiniestroImportService**: Servicio de importación de siniestros

Todos los servicios utilizan Apache POI para leer archivos Excel (.xlsx) y Spring Data JPA para persistencia.

---

## Notas Importantes

1. **Validación de Datos**: Los datos se validan durante la importación; registros inválidos generan errores pero no detienen el proceso
2. **Relaciones**: Los campos que referencian otras entidades se validan; si no encuentran la entidad, el campo se deja en null
3. **Rendimiento**: Para archivos muy grandes (>10,000 registros), considerar dividirlos en múltiples cargas
4. **Respaldo**: Es recomendable hacer backup de la base de datos antes de importar grandes volúmenes de datos

