# Estructura del Proyecto

Este documento describe la organización de carpetas del proyecto Sistema de Seguros Frontend.

## 📁 Estructura de Carpetas

### `src/`
Carpeta principal que contiene todo el código fuente de la aplicación.

### `src/components/`
**Propósito:** Componentes reutilizables de React.

Aquí se almacenan todos los componentes que se pueden usar en diferentes partes de la aplicación:
- Botones personalizados
- Inputs y formularios
- Cards y tarjetas
- Modales y diálogos
- Tablas
- Navegación (Navbar, Sidebar, Footer)
- Componentes de UI generales

**Ejemplo:**
```
components/
├── Button.jsx
├── Input.jsx
├── Modal.jsx
├── Navbar.jsx
└── Card.jsx
```

### `src/pages/`
**Propósito:** Vistas principales de la aplicación.

Contiene las páginas completas que representan las diferentes rutas de la aplicación:
- Página de inicio (Home)
- Login/Registro
- Dashboard
- Gestión de Pólizas
- Gestión de Clientes
- Gestión de Siniestros
- Reportes

**Ejemplo:**
```
pages/
├── Home.jsx
├── Login.jsx
├── Dashboard.jsx
├── Polizas.jsx
└── Clientes.jsx
```

### `src/services/`
**Propósito:** Lógica de comunicación con APIs externas.

Contiene las funciones que manejan las peticiones HTTP al backend:
- Configuración de axios o fetch
- Endpoints de API
- Manejo de autenticación
- Peticiones GET, POST, PUT, DELETE
- Interceptores de peticiones/respuestas

**Ejemplo:**
```
services/
├── api.js
├── authService.js
├── polizasService.js
└── clientesService.js
```

### `src/hooks/`
**Propósito:** Custom Hooks de React.

Hooks personalizados que encapsulan lógica reutilizable:
- useAuth - Manejo de autenticación
- useFetch - Peticiones de datos
- useForm - Manejo de formularios
- useLocalStorage - Almacenamiento local
- useDebounce - Optimización de búsquedas

**Ejemplo:**
```
hooks/
├── useAuth.js
├── useFetch.js
└── useForm.js
```

### `src/utils/`
**Propósito:** Funciones auxiliares y utilidades.

Funciones helper que se usan en toda la aplicación:
- Validaciones (validar email, teléfono, etc.)
- Formateadores (fechas, moneda, etc.)
- Constantes
- Helpers generales

**Ejemplo:**
```
utils/
├── validators.js
├── formatters.js
├── constants.js
└── helpers.js
```

### `src/assets/`
**Propósito:** Recursos estáticos.

Archivos multimedia y recursos estáticos:
- Imágenes (logos, iconos, ilustraciones)
- Fuentes personalizadas
- Archivos SVG
- Otros recursos estáticos

**Ejemplo:**
```
assets/
├── images/
├── icons/
└── fonts/
```

---

## 🎯 Buenas Prácticas

1. **Modularidad:** Mantén cada archivo con una única responsabilidad.
2. **Nomenclatura:** Usa nombres descriptivos para archivos y componentes.
3. **Reutilización:** Los componentes comunes deben estar en `components/`.
4. **Separación de conceptos:** Separa la lógica de negocio (services) de la presentación (components).
5. **Documentación:** Comenta el código complejo y mantén este documento actualizado.

## 📝 Convenciones

- Componentes React: PascalCase (`MyComponent.jsx`)
- Utilidades y servicios: camelCase (`authService.js`)
- Constantes: UPPER_SNAKE_CASE (`API_URL`)
- Carpetas: lowercase (`components/`, `services/`)
