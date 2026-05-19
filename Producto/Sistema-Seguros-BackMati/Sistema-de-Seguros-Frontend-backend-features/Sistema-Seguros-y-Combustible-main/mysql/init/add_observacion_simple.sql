-- Script para agregar campos de observación a la tabla Siniestro
USE db_sistema_seguros;

-- Agregar columna de observación (ignorar error si ya existe)
ALTER TABLE siniestro ADD COLUMN observacion TEXT COMMENT 'Observaciones sobre el seguimiento del siniestro';

-- Agregar columna de fecha de última modificación (ignorar error si ya existe)
ALTER TABLE siniestro ADD COLUMN fecha_ultima_modificacion DATETIME COMMENT 'Fecha y hora de la última modificación de la observación';

-- Agregar índice
CREATE INDEX idx_fecha_ultima_modificacion ON siniestro(fecha_ultima_modificacion);

COMMIT;
