# Guía de Docker para despliegue de microservicios y frontend

Este documento explica cómo contenerizar y desplegar tu proyecto (Java microservicios + MySQL + frontend React/Vite) usando Docker y Docker Compose.

## Estructura recomendada

```
/BackendTad/Sistema-Seguros-y-Combustible
│   docker-compose.yml
│   DOCKER_SETUP.md
│
├── Microservicio1/
│   └── Dockerfile
├── Microservicio2/
│   └── Dockerfile
├── ...
├── frontend/
│   └── Dockerfile
```

## 1. Dockerfile para microservicios Java

Ejemplo para un microservicio Spring Boot:
```Dockerfile
FROM openjdk:17-jdk-alpine
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

## 2. Dockerfile para frontend (React + Vite)

```Dockerfile
# Build stage
FROM node:18 AS build
WORKDIR /app
COPY . .
RUN npm install && npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

## 3. docker-compose.yml ejemplo

```yaml
version: '3.8'
services:
  mysql:
    image: mysql:8
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: tu_base
      MYSQL_USER: usuario
      MYSQL_PASSWORD: contraseña
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql

  microservicio1:
    build: ./Microservicio1
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/tu_base
      SPRING_DATASOURCE_USERNAME: usuario
      SPRING_DATASOURCE_PASSWORD: contraseña
    depends_on:
      - mysql
    ports:
      - "8081:8081"

  microservicio2:
    build: ./Microservicio2
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/tu_base
      SPRING_DATASOURCE_USERNAME: usuario
      SPRING_DATASOURCE_PASSWORD: contraseña
    depends_on:
      - mysql
    ports:
      - "8082:8082"

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - microservicio1
      - microservicio2

volumes:
  db_data:
```

## 4. Pasos para desplegar

1. Compila cada microservicio (`mvn clean package`) y el frontend (`npm run build`).
2. Crea los Dockerfile en cada carpeta.
3. Configura el `docker-compose.yml` en la raíz del proyecto.
4. Ejecuta localmente: `docker-compose up --build`
5. Verifica que todos los servicios estén corriendo y comunicándose.
6. Sube los archivos al hosting y ejecuta `docker-compose up -d`.

## 5. Consejos
- Usa variables de entorno para credenciales y configuración.
- Prueba todo local antes de subir al servidor.
- Revisa los logs de cada servicio con `docker-compose logs <servicio>`.

---

**¡Listo! Tu proyecto estará listo para producción y fácil de mantener.**