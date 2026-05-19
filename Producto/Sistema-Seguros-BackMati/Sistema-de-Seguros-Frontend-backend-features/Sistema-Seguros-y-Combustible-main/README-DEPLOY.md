# Sistema de Documentación - Guía de Despliegue

## 📋 Requisitos Previos

- Docker y Docker Compose instalados
- Puerto 8080 disponible (configurable)
- Puerto 3306 disponible para MySQL (configurable)
- Al menos 2GB de RAM disponible
- 5GB de espacio en disco

## 🚀 Despliegue Rápido

### 1. Preparación del Entorno

```bash
# Clonar o copiar el proyecto
cd Sistema-Seguros-y-Combustible

# Copiar archivo de variables de entorno
cp .env.example .env

# Editar las variables de entorno según tu configuración
nano .env
```

### 2. Configuración de Variables de Entorno

Edita el archivo `.env` con tus valores de producción:

```env
# Configuración de la aplicación
APP_PORT=8080
STORAGE_LOCATION=/app/uploads

# Configuración de base de datos MySQL
MYSQL_ROOT_PASSWORD=tu_password_root_muy_seguro
MYSQL_DATABASE=sistema_seguros
MYSQL_USER=app_user
MYSQL_PASSWORD=tu_password_muy_seguro
MYSQL_PORT=3306
```

### 3. Despliegue

```bash
# Para desarrollo
./deploy.sh dev

# Para producción
./deploy.sh prod
```

## 🔧 Configuración Avanzada

### Variables de Entorno Importantes

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `APP_PORT` | Puerto de la aplicación | 8080 |
| `MYSQL_ROOT_PASSWORD` | Password del root de MySQL | (requerido) |
| `MYSQL_DATABASE` | Nombre de la base de datos | sistema_seguros |
| `MYSQL_USER` | Usuario de la aplicación | app_user |
| `MYSQL_PASSWORD` | Password del usuario | (requerido) |
| `MYSQL_PORT` | Puerto de MySQL | 3306 |

### Health Checks

La aplicación incluye health checks automáticos:
- **MySQL**: Verifica conectividad cada 30 segundos
- **Aplicación**: Verifica endpoint `/actuator/health` cada 30 segundos

### Volúmenes Persistentes

- `mysql_data`: Datos de MySQL
- `uploads_data`: Archivos subidos por usuarios
- `./logs`: Logs de la aplicación

## 📊 Monitoreo

### Verificar Estado de Contenedores

```bash
docker-compose -f docker-compose.prod.yml ps
```

### Ver Logs

```bash
# Logs en tiempo real
docker-compose -f docker-compose.prod.yml logs -f

# Logs de un servicio específico
docker-compose -f docker-compose.prod.yml logs -f microservicio-documentacion
```

### Health Check Manual

```bash
# Verificar MySQL
docker-compose -f docker-compose.prod.yml exec mysql-db mysqladmin ping

# Verificar aplicación
curl http://localhost:8080/actuator/health
```

## 🔒 Seguridad en Producción

### Checklist de Seguridad

- [ ] Cambiar todas las contraseñas por valores seguros
- [ ] Configurar firewall para permitir solo puertos necesarios
- [ ] Usar HTTPS en lugar de HTTP
- [ ] Configurar CORS para dominios específicos
- [ ] Implementar rate limiting
- [ ] Configurar backups automáticos de la base de datos
- [ ] Monitorear logs de seguridad

### Configuración de Red

```yaml
# En docker-compose.prod.yml, ajustar según necesidad
ports:
  - "127.0.0.1:8080:8080"  # Solo localhost
```

## 🛠️ Mantenimiento

### Backup de Base de Datos

```bash
# Backup
docker-compose -f docker-compose.prod.yml exec mysql-db mysqldump -u root -p sistema_seguros > backup.sql

# Restore
docker-compose -f docker-compose.prod.yml exec -T mysql-db mysql -u root -p sistema_seguros < backup.sql
```

### Actualización

```bash
# Detener servicios
docker-compose -f docker-compose.prod.yml down

# Actualizar código/imagen
git pull  # o docker-compose -f docker-compose.prod.yml build

# Reiniciar
docker-compose -f docker-compose.prod.yml up -d
```

## 🆘 Solución de Problemas

### Problema: Puerto ya en uso
```bash
# Cambiar puerto en .env
APP_PORT=8081
MYSQL_PORT=3307
```

### Problema: Error de conexión a MySQL
```bash
# Verificar logs de MySQL
docker-compose -f docker-compose.prod.yml logs mysql-db

# Verificar variables de entorno
docker-compose -f docker-compose.prod.yml exec microservicio-documentacion env | grep DB_
```

### Problema: Sin espacio en disco
```bash
# Limpiar Docker
docker system prune -a --volumes

# Verificar uso de disco
df -h
```

## 📞 Soporte

Para soporte técnico, verificar:
1. Logs de la aplicación: `docker-compose logs -f`
2. Estado de contenedores: `docker-compose ps`
3. Variables de entorno: `cat .env`
4. Configuración de red: `docker network ls`