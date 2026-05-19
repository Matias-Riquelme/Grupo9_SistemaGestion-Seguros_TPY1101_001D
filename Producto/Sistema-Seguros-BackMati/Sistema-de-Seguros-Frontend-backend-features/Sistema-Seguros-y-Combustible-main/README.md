# Sistema de Seguros y Combustible - Documentación Completa

## 📋 Descripción del Proyecto

Sistema de microservicios para la gestión de seguros, combustible y documentación. Desarrollado con Spring Boot y arquitectura de microservicios, utilizando Docker para la contenerización y MySQL como base de datos principal.

### 🎯 Objetivos
- Gestión integral de seguros y combustible
- Sistema de documentación con subida y descarga de archivos
- Arquitectura de microservicios escalable
- Despliegue automatizado con Docker

## 🏗️ Arquitectura

### Microservicios
- **ApiGateway**: Puerta de enlace principal del sistema
- **BackendTad**: Gestión de usuarios y autenticación
- **MicroservicioDocumentacion**: Gestión de documentos (PDF, JPG)
- **MicroservicioIncidenteSiniestros**: Gestión de incidentes y siniestros
- **tad**: Servicio principal de gestión de vehículos, combustible y seguros

### Tecnologías Utilizadas

#### Backend
- **Java 21**
- **Spring Boot 3.5.10**
- **Spring Data JPA** - Persistencia de datos
- **Spring Security** - Autenticación y autorización
- **Spring OAuth2 Resource Server** - Autenticación JWT
- **Spring Web** - APIs REST
- **Maven** - Gestión de dependencias

#### Base de Datos
- **MySQL 8.0** - Base de datos principal

#### Infraestructura
- **Docker & Docker Compose** - Contenerización
- **MySQL Connector/J** - Driver de conexión MySQL
- **Lombok** - Reducción de código boilerplate

#### DevOps
- **Docker Compose** - Orquestación de contenedores
- **Health Checks** - Monitoreo de servicios
- **Volúmenes Docker** - Persistencia de datos

## 📋 Prerrequisitos

- **Java 21** o superior
- **Maven 3.6+**
- **Docker & Docker Compose**
- **MySQL Workbench** (opcional, para gestión de BD)
- **Git**

### Requisitos del Sistema
- **RAM**: Mínimo 4GB, recomendado 8GB
- **Disco**: 5GB de espacio disponible
- **SO**: Windows 10/11, Linux, macOS

## 🚀 Instalación y Configuración

### 1. Clonar el Repositorio
```bash
git clone <url-del-repositorio>
cd Sistema-Seguros-y-Combustible
```

### 2. Configuración de Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus valores
nano .env
```

**Contenido del archivo `.env`:**
```env
# Configuración de la aplicación
SERVER_PORT=8080
STORAGE_LOCATION=/app/upload-dir

# Configuración de base de datos MySQL
MYSQL_ROOT_PASSWORD=tu_password_root_seguro
MYSQL_DATABASE=sistema_seguros
MYSQL_USER=user
MYSQL_PASSWORD=password_seguro
MYSQL_PORT=3306

# URL de conexión a la base de datos
DB_URL=jdbc:mysql://mysql:3306/sistema_seguros
DB_USER=user
DB_PASS=password_seguro
```

### 3. Despliegue con Docker

#### Desarrollo
```bash
# Construir e iniciar servicios
docker compose up --build

# O en segundo plano
docker compose up -d --build
```

#### Producción
```bash
# Usar configuración optimizada para producción
./deploy.sh prod
```

## 🔧 Configuración de Desarrollo

### Estructura del Proyecto
```
Sistema-Seguros-y-Combustible/
├── ApiGateway/                    # API Gateway
├── BackendTad/                    # Gestión de usuarios
├── MicroservicioDocumentacion/    # Gestión de documentos
│   ├── src/main/java/tad/MicroservicioDocumentacion/
│   │   ├── config/               # Configuración de seguridad
│   │   ├── controller/           # Controladores REST
│   │   └── storage/              # Servicio de almacenamiento
│   ├── src/main/resources/        # Configuración Spring
│   └── pom.xml                   # Dependencias Maven
├── MicroservicioIncidenteSiniestros/  # Gestión de incidentes
├── tad/                          # Servicio principal
├── docker-compose.yml            # Configuración Docker desarrollo
├── docker-compose.prod.yml       # Configuración Docker producción
├── docker-compose.override.yml   # Overrides desarrollo
├── .env.example                  # Variables de entorno ejemplo
└── deploy.sh                     # Script de despliegue
```

### Configuración de IDE
1. **Importar como proyecto Maven**
2. **Configurar JDK 21**
3. **Instalar Lombok plugin** (si usas IDE como IntelliJ/Eclipse)
4. **Configurar variables de entorno** en run configuration

## 📡 API Endpoints

### Microservicio de Documentación
**Base URL:** `http://localhost:8082`

#### Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/documentos/` | Lista todos los archivos subidos |
| `GET` | `/api/documentos/files/{nombreArchivo}` | Descarga un archivo específico |
| `POST` | `/api/documentos/` | Sube un nuevo archivo |

#### Ejemplos de Uso

**Subir archivo:**
```bash
curl -X POST \
  http://localhost:8082/api/documentos/ \
  -F "Archivo=@documento.pdf"
```

**Listar archivos:**
```bash
curl http://localhost:8082/api/documentos/
```

**Descargar archivo:**
```bash
curl -O http://localhost:8082/api/documentos/files/documento.pdf
```

#### Validaciones
- **Formatos permitidos:** PDF, JPG, JPEG
- **Tamaño máximo:** Configurable en `application.properties`
- **Ubicación de almacenamiento:** `/app/upload-dir` (mapeado a `./MicroservicioDocumentacion/upload-dir`)

## 🗄️ Base de Datos

### Configuración MySQL
- **Host:** `mysql` (desde contenedores) / `localhost:3307` (desde host)
- **Base de datos:** `sistema_seguros`
- **Usuario:** `user` / `password`
- **Root:** `root` / `rootpassword`

### Conexión con MySQL Workbench
```
Connection Name: Sistema Seguros MySQL
Connection Method: Standard (TCP/IP)
Hostname: localhost
Port: 3307
Username: user
Password: password
Default Schema: sistema_seguros
```

### Health Checks
- **MySQL:** `mysqladmin ping` cada 30 segundos
- **Aplicación:** `/actuator/health` cada 30 segundos

## 🔒 Seguridad

### Configuración OAuth2
- **Tipo:** Resource Server
- **Autenticación:** JWT Tokens
- **Configuración:** `SecurityConfig.java`

### Endpoints Protegidos
- Todos los endpoints requieren autenticación JWT
- Configuración CORS para dominios específicos
- Validación de tipos de archivo en subida

## 🐳 Docker y Despliegue

### Servicios Docker
```yaml
microservicio-documentacion: # Puerto 8082
mysql-db:                   # Puerto 3307 (MySQL)
```

### Volúmenes
- `mysql_data`: Datos persistentes de MySQL
- `uploads_data`: Archivos subidos por usuarios
- `./logs`: Logs de aplicación

### Comandos Útiles
```bash
# Ver estado de contenedores
docker compose ps

# Ver logs
docker compose logs -f

# Ver logs de un servicio específico
docker compose logs -f microservicio-documentacion

# Reiniciar servicios
docker compose restart

# Detener servicios
docker compose down

# Limpiar todo
docker compose down -v --remove-orphans
```

## 🧪 Testing

### Ejecutar Tests
```bash
# Desde el directorio del microservicio
cd MicroservicioDocumentacion
mvn test

# Con Docker
docker compose exec microservicio-documentacion mvn test
```

### Tests Incluidos
- **Unit Tests:** Lógica de negocio
- **Integration Tests:** Conexión a base de datos
- **API Tests:** Endpoints REST

## 📊 Monitoreo

### Endpoints de Actuator
- **Health:** `/actuator/health`
- **Info:** `/actuator/info`
- **Metrics:** `/actuator/metrics`
- **Environment:** `/actuator/env`

### Logs
```bash
# Logs en tiempo real
docker compose logs -f

# Logs de aplicación
tail -f logs/microservicio-documentacion.log

# Logs de MySQL
docker compose logs -f mysql
```

## 🔧 Solución de Problemas

### Problemas Comunes

#### 1. Puerto ya en uso
```bash
# Cambiar puertos en .env
APP_PORT=8083
MYSQL_PORT=3308
```

#### 2. Error de conexión MySQL
```bash
# Verificar estado de MySQL
docker compose logs mysql

# Reiniciar MySQL
docker compose restart mysql
```

#### 3. Error de build Maven
```bash
# Limpiar y reconstruir
mvn clean install

# Con Docker
docker compose build --no-cache
```

#### 4. Archivos no se suben
```bash
# Verificar permisos del directorio
ls -la MicroservicioDocumentacion/upload-dir/

# Verificar configuración de storage
cat application.properties | grep storage
```

#### 5. Error de memoria
```bash
# Aumentar límite de memoria Docker
# En Docker Desktop: Settings > Resources > Memory
```

### Comandos de Diagnóstico
```bash
# Ver estado de todos los servicios
docker compose ps

# Ver uso de recursos
docker stats

# Ver redes Docker
docker network ls

# Limpiar Docker
docker system prune -a --volumes
```

## 🚀 Despliegue en Producción

### Preparación
1. **Configurar variables de entorno** seguras
2. **Configurar dominios** en CORS
3. **Configurar HTTPS** (recomendado)
4. **Configurar backups** automáticos

### Despliegue
```bash
# Usar script automatizado
./deploy.sh prod

# O manualmente
docker-compose -f docker-compose.prod.yml up -d
```

### Configuración de Producción
- **Variables de entorno** en el servidor
- **Configuración MySQL** optimizada
- **Logs** estructurados
- **Health checks** automáticos
- **Restart policies** configuradas

## 🤝 Contribución

### Flujo de Desarrollo
1. **Crear rama** desde `main`
2. **Desarrollar** funcionalidad
3. **Crear tests** para nueva funcionalidad
4. **Hacer commit** con mensaje descriptivo
5. **Crear Pull Request**
6. **Code Review** y merge

### Estándares de Código
- **Java:** Seguir convenciones de Spring Boot
- **Commits:** Usar formato convencional
- **Tests:** Cobertura mínima del 80%
- **Documentación:** Actualizar README

### Ramas
- `main`: Código de producción
- `develop`: Desarrollo activo
- `feature/*`: Nuevas funcionalidades
- `bugfix/*`: Corrección de bugs
- `hotfix/*`: Parches críticos


## 📞 Soporte

Para soporte técnico:
1. Revisar logs de aplicación
2. Verificar estado de contenedores
3. Consultar documentación de Spring Boot
4. Revisar issues del repositorio

## 🔄 Versiones

### v1.0.0
- ✅ Arquitectura de microservicios
- ✅ Sistema de gestión documental
- ✅ Configuración MySQL completa
- ✅ Docker y despliegue automatizado
- ✅ Seguridad OAuth2/JWT
- ✅ Health checks y monitoreo

---

**Desarrollado con ❤️ usando Spring Boot y Docker**