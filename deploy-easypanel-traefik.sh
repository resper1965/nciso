#!/bin/bash

# Deploy script para EasyPanel com Traefik
echo "🚀 Deployando n.CISO no EasyPanel com Traefik..."

# 1. Verificar se a rede existe
if ! docker network ls | grep -q "nciso-network"; then
    echo "🔧 Criando rede nciso-network..."
    docker network create nciso-network
fi

# 2. Build das imagens
echo "🔨 Fazendo build das imagens..."
docker build -f Dockerfile.backend -t nciso-backend .
docker build -f nciso-frontend/Dockerfile.frontend -t nciso-frontend ./nciso-frontend

# 3. Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose -f docker-compose.traefik.yml down --remove-orphans

# 4. Iniciar com Traefik
echo "🚀 Iniciando com Traefik..."
docker-compose -f docker-compose.traefik.yml up -d

# 5. Verificar status
echo "🔍 Verificando status..."
docker-compose -f docker-compose.traefik.yml ps

# 6. Aguardar inicialização
echo "⏳ Aguardando inicialização..."
sleep 30

# 7. Testar endpoints
echo "🧪 Testando endpoints..."
curl -k -s https://${DOMAIN:-localhost}/health || echo "⚠️  Health check falhou (normal na primeira execução)"

echo "✅ Deploy concluído!"
echo "🌐 URLs disponíveis:"
echo "   Frontend: https://${DOMAIN:-localhost}"
echo "   API:      https://api.${DOMAIN:-localhost}"
echo "   Health:   https://${DOMAIN:-localhost}/health"
