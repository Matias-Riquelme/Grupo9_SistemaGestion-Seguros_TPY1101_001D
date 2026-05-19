-- Se ejecuta automáticamente la primera vez que el contenedor MySQL arranca.
-- Una sola base para todos los microservicios (usuario, incidentes, vehículos, documentación).
-- Las tablas las crea/actualiza JPA (ddl-auto=update) al levantar cada microservicio.
CREATE DATABASE IF NOT EXISTS db_sistema_seguros
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
