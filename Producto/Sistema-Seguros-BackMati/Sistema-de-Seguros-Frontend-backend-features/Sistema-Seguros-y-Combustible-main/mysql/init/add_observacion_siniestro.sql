-- Script para agregar campos de observación y fecha de última modificación a la tabla Siniestro
-- Ejecutar este script en la base de datos db_sistema_seguros

USE db_sistema_seguros;

-- Agregar columna de observación
ALTER TABLE Siniestro 
ADD COLUMN IF NOT EXISTS observacion TEXT COMMENT 'Observaciones sobre el seguimiento del siniestro';

-- Agregar columna de fecha de última modificación
ALTER TABLE Siniestro 
ADD COLUMN IF NOT EXISTS fecha_ultima_modificacion DATETIME COMMENT 'Fecha y hora de la última modificación de la observación';

-- Agregar índice para mejorar el rendimiento de búsquedas por fecha
CREATE INDEX IF NOT EXISTS idx_fecha_ultima_modificacion ON Siniestro(fecha_ultima_modificacion);

COMMIT;
