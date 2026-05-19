#!/bin/bash

# Script de despliegue para Sistema de Documentación
# Uso: ./deploy.sh [dev|prod]

set -e

ENVIRONMENT=${1:-prod}
COMPOSE_FILE="docker-compose.yml"

if [ "$ENVIRONMENT" = "prod" ]; then
    COMPOSE_FILE="docker-compose.prod.yml"
fi

echo "🚀 Iniciando despliegue en modo: $ENVIRONMENT"
echo "📄 Usando archivo: $COMPOSE_FILE"

# Verificar que existe el archivo .env
if [ ! -f ".env" ]; then
    echo "❌ Error: Archivo .env no encontrado. Copia .env.example a .env y configura las variables."
    exit 1
fi

# Crear directorios necesarios
echo "📁 Creando directorios necesarios..."
mkdir -p logs mysql/conf.d mysql/init uploads

# Detener contenedores existentes
echo "🛑 Deteniendo contenedores existentes..."
docker-compose -f $COMPOSE_FILE down || true

# Limpiar imágenes no utilizadas (opcional)
echo "🧹 Limpiando imágenes no utilizadas..."
docker image prune -f || true

# Construir imágenes si es necesario
if [ "$ENVIRONMENT" = "dev" ]; then
    echo "🔨 Construyendo imágenes..."
    docker-compose -f $COMPOSE_FILE build --no-cache
fi

# Iniciar servicios
echo "▶️  Iniciando servicios..."
docker-compose -f $COMPOSE_FILE up -d

# Esperar a que los servicios estén listos
echo "⏳ Esperando a que los servicios estén listos..."
sleep 30

# Verificar estado de los contenedores
echo "🔍 Verificando estado de los contenedores..."
docker-compose -f $COMPOSE_FILE ps

# Verificar health checks
echo "🏥 Verificando health checks..."
sleep 10

# Mostrar logs iniciales
echo "📋 Logs iniciales:"
docker-compose -f $COMPOSE_FILE logs --tail=20

echo ""
echo "✅ Despliegue completado!"
echo ""
echo "📊 Para ver logs en tiempo real: docker-compose -f $COMPOSE_FILE logs -f"
echo "🛑 Para detener: docker-compose -f $COMPOSE_FILE down"
echo "🔄 Para reiniciar: docker-compose -f $COMPOSE_FILE restart"