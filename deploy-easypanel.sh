#!/bin/bash

# Deploy script para EasyPanel
echo "🚀 Deployando n.CISO no EasyPanel..."

# 1. Build das imagens
docker build -f Dockerfile.backend -t nciso-backend .
docker build -f nciso-frontend/Dockerfile.frontend -t nciso-frontend ./nciso-frontend

# 2. Parar containers existentes
docker-compose down --remove-orphans

# 3. Iniciar com Docker Compose
docker-compose up -d

# 4. Verificar status
docker-compose ps

echo "✅ Deploy concluído!"
echo "🌐 Acesse: https://${DOMAIN:-localhost}"
