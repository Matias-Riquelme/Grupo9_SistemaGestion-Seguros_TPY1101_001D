# Consumo de APIs - Sistema de Seguros Frontend

## Resumen

Este documento explica cómo el frontend se conecta con el backend (API REST en `http://localhost:8083`) para realizar operaciones CRUD sobre las entidades del sistema.

---

## Arquitectura de la conexión

```
┌─────────────────────┐       HTTP (Axios)       ┌─────────────────────┐
│    React Frontend    │ ◄─────────────────────► │   Spring Boot API   │
│   localhost:5173     │                          │   localhost:8083    │
└─────────────────────┘                          └─────────────────────┘
         │                                                │
    src/config/api.js                              Swagger UI:
    (instancia Axios)                     localhost:8083/swagger-ui/index.html
         │
    src/services/
    (un servicio por entidad)
```

---

## 1. Configuración base — `src/config/api.js`

Archivo central que crea una instancia de **Axios** con:

- **`baseURL`**: `http://localhost:8083` (puerto del backend).
- **Header** `Content-Type: application/json`.
- **Interceptor de request**: agrega automáticamente el token JWT (`Bearer`) desde `localStorage` en cada petición, si existe.

```js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8083',
    headers: { 'Content-Type': 'application/json' },
});

// Interceptor: agrega token a cada request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
```

> Todos los servicios importan esta instancia `api` para hacer sus peticiones.

---

## 2. Capa de Servicios — `src/services/`

Cada entidad del backend tiene su propio archivo de servicio. Los servicios encapsulan las llamadas HTTP y exponen funciones simples para los componentes.

### Servicios disponibles

| Archivo | Entidad | Endpoints |
|---------|---------|-----------|
| `conductorService.js` | Conductores | listar, obtenerPorId, crear, actualizar, eliminar, importar, exportar |
| `vehiculoService.js` | Vehículos | listar, obtenerPorId, crear, actualizar, eliminar, importar, exportar |
| `tipoVehiculoService.js` | Tipo de Vehículo | listar, obtenerPorId, crear, actualizar, eliminar |
| `operacionesService.js` | Operaciones | listar, obtenerPorId, crear, actualizar, eliminar |
| `baseService.js` | Bases | listar, obtenerPorId, crear, actualizar, eliminar |
| `authKeycloakServices.js` | Autenticación | login, logout, refresh token (Keycloak) |

### Ejemplo: `conductorService.js`

```js
import api from '../config/api';

const conductorService = {
    listar:      async ()          => (await api.get('/api/conductores')).data,
    obtenerPorId: async (id)       => (await api.get(`/api/conductores/${id}`)).data,
    crear:       async (conductor) => (await api.post('/api/conductores', conductor)).data,
    actualizar:  async (id, datos) => (await api.post(`/api/conductores/actualizar/${id}`, datos)).data,
    eliminar:    async (id)        => (await api.delete(`/api/conductores/${id}`)).data,
};

export default conductorService;
```

> **Nota importante**: El backend usa `POST` para actualizar (`/actualizar/{id}`) en vez del estándar `PUT`. Los servicios reflejan esto.

---

## 3. Mapeo Frontend ↔ Backend (DTOs)

Los campos del formulario deben coincidir **exactamente** con los nombres del DTO del backend.

### ConductorDTO

| Campo Backend | Tipo | Campo en Formulario |
|---------------|------|---------------------|
| `id_conductor` | int64 | ID (auto-generado, disabled) |
| `primerNombre` | string | Primer Nombre |
| `segundoNombre` | string | Segundo Nombre |
| `apellidoPaterno` | string | Apellido Paterno |
| `apellidoMaterno` | string | Apellido Materno |
| `rut` | string | RUT (con formato y validación) |
| `telefono` | string | Teléfono |
| `direccion` | string | Dirección |

### VehiculoDTO

| Campo Backend | Tipo | Campo en Formulario |
|---------------|------|---------------------|
| `id_vehiculo` | int64 | ID (auto-generado, disabled) |
| `patente` | string | Patente |
| `marca` | string | Marca |
| `modelo` | string | Modelo |
| `tipo` | string | Tipo (select dinámico desde API) |
| `rampla` | string | Rampla |
| `anio` | int32 | Año |
| `anioRegistro` | int32 | Año Registro |
| `num_motor_veh` | int32 | N° Motor |
| `num_chasis_veh` | int32 | N° Chasis |

### TipovehiculoDTO

| Campo Backend | Tipo |
|---------------|------|
| `id_tipo_vehiculo` | int64 |
| `tipo_vehiculo` | string |

### OperacionesDTO

| Campo Backend | Tipo |
|---------------|------|
| `id_operacion` | int64 |
| `nombre` | string |

### BaseDTO

| Campo Backend | Tipo |
|---------------|------|
| `id_base` | int64 |
| `nombre` | string |

---

## 4. Flujo en un componente (ejemplo: GestionConductores)

### Carga de datos (READ)

```jsx
import conductorService from "../../services/conductorService";

const [conductores, setConductores] = useState([]);
const [cargando, setCargando] = useState(true);
const [error, setError] = useState(null);

const cargarConductores = async () => {
    try {
        setCargando(true);
        const data = await conductorService.listar(); // GET /api/conductores
        setConductores(data);
    } catch (err) {
        setError("No se pudieron cargar los conductores.");
    } finally {
        setCargando(false);
    }
};

useEffect(() => {
    cargarConductores();
}, []);
```

### Crear / Actualizar (CREATE / UPDATE)

```jsx
const handleGuardar = async () => {
    // ... validaciones ...

    try {
        if (editandoId) {
            await conductorService.actualizar(editandoId, conductorActual);
            // POST /api/conductores/actualizar/{id}
        } else {
            await conductorService.crear(conductorActual);
            // POST /api/conductores
        }
        cerrar();
        await cargarConductores(); // Recargar lista
    } catch (err) {
        alert("Error al guardar.");
    }
};
```

### Eliminar (DELETE)

```jsx
const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro?")) {
        await conductorService.eliminar(id); // DELETE /api/conductores/{id}
        await cargarConductores();            // Recargar lista
    }
};
```

---

## 5. Estados de UI

Cada componente conectado a la API maneja 3 estados visuales:

| Estado | UI |
|--------|----|
| `cargando = true` | Muestra "Cargando..." |
| `error != null` | Muestra mensaje de error + botón "Reintentar" |
| `items.length === 0` | Muestra "No hay registros" |
| `guardando = true` | Deshabilita botones Guardar/Cancelar, muestra "Guardando..." |

---

## 6. Estructura final de archivos

```
src/
├── config/
│   └── api.js                    ← Instancia Axios + interceptor JWT
├── services/
│   ├── authKeycloakServices.js   ← Login/Logout con Keycloak
│   ├── conductorService.js       ← CRUD Conductores
│   ├── vehiculoService.js        ← CRUD Vehículos
│   ├── tipoVehiculoService.js    ← CRUD Tipo Vehículo
│   ├── operacionesService.js     ← CRUD Operaciones
│   └── baseService.js            ← CRUD Bases
├── hooks/
│   ├── useCrud.js                ← Hook genérico CRUD (lista local)
│   └── useFormulario.js          ← Hook genérico formulario
├── utils/
│   ├── validaciones.js           ← validarRut, validarCamposObligatorios, etc.
│   └── formatos.js               ← formatRut, formatTelefono, etc.
└── pages/admin/
    ├── GestionConductores.jsx    ← Conectado a conductorService
    └── GestionVehiculo.jsx       ← Conectado a vehiculoService + tipoVehiculoService
```

---

## 7. Cómo agregar un nuevo CRUD

Para conectar una nueva entidad (ej: Pólizas):

1. **Crear el servicio** `src/services/polizaService.js` con las funciones `listar`, `crear`, `actualizar`, `eliminar`.
2. **Crear la página** `src/pages/admin/GestionPoliza.jsx`:
   - Importar el servicio.
   - Usar `useFormulario` para el formulario.
   - Usar `useState` + `useEffect` para cargar datos.
   - Manejar estados `cargando`, `error`, `guardando`.
3. **Mapear los campos** del formulario a los nombres exactos del DTO del backend.
4. **Agregar la ruta** en `App.jsx` si no existe.
