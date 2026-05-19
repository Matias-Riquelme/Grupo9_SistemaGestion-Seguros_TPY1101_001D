# ============================================
# Dockerfile - API Gateway
# Java 17 + Spring Boot 3.2 + Spring Cloud Gateway
# ============================================

# Stage 1: Build - Compilar el proyecto con Maven
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copiar pom.xml primero para cachear dependencias
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar código fuente y compilar
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime - Imagen ligera solo para ejecutar
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copiar solo el JAR generado
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
