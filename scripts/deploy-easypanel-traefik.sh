#!/bin/bash

# 🚀 Deploy n.CISO no EasyPanel com Traefik
# Script otimizado para EasyPanel já instalado

set -e

echo "🚀 Deployando n.CISO no EasyPanel com Traefik..."

# 1. Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script no diretório raiz do projeto"
    exit 1
fi

# 2. Verificar se o Traefik está rodando
echo "🔍 Verificando Traefik..."
if ! docker ps | grep -q "traefik"; then
    echo "⚠️  Traefik não encontrado. Verifique se o EasyPanel está rodando."
    echo "💡 O EasyPanel deve ter o Traefik ativo para este deploy."
    exit 1
fi

# 3. Criar rede se não existir
if ! docker network ls | grep -q "nciso-network"; then
    echo "🔧 Criando rede nciso-network..."
    docker network create nciso-network
else
    echo "✅ Rede nciso-network já existe"
fi

# 4. Build das imagens
echo "🔨 Fazendo build das imagens..."
docker build -f Dockerfile.backend -t nciso-backend .
docker build -f nciso-frontend/Dockerfile.frontend -t nciso-frontend ./nciso-frontend

# 5. Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose -f docker-compose.traefik.yml down --remove-orphans 2>/dev/null || true

# 6. Iniciar com Traefik
echo "🚀 Iniciando com Traefik..."
docker-compose -f docker-compose.traefik.yml up -d

# 7. Aguardar inicialização
echo "⏳ Aguardando inicialização dos containers..."
sleep 20

# 8. Verificar status
echo "🔍 Verificando status dos containers..."
docker-compose -f docker-compose.traefik.yml ps

# 9. Verificar logs do Traefik
echo "📋 Verificando logs do Traefik..."
docker logs $(docker ps -q --filter "name=traefik") --tail 10 2>/dev/null || echo "⚠️  Não foi possível verificar logs do Traefik"

# 10. Testar endpoints
echo "🧪 Testando endpoints..."
if [ ! -z "$DOMAIN" ]; then
    echo "🌐 Testando Frontend: https://$DOMAIN"
    curl -k -s -I https://$DOMAIN | head -1 || echo "⚠️  Frontend não respondeu"
    
    echo "🌐 Testando API: https://api.$DOMAIN"
    curl -k -s -I https://api.$DOMAIN | head -1 || echo "⚠️  API não respondeu"
    
    echo "🌐 Testando Health: https://$DOMAIN/health"
    curl -k -s https://$DOMAIN/health || echo "⚠️  Health check falhou"
else
    echo "⚠️  Variável DOMAIN não definida. Configure no .env.traefik"
fi

# 11. Mostrar informações finais
echo ""
echo "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
echo ""
echo "🌐 URLs disponíveis:"
echo "   Frontend: https://${DOMAIN:-seu-dominio.com}"
echo "   API:      https://api.${DOMAIN:-seu-dominio.com}"
echo "   Health:   https://${DOMAIN:-seu-dominio.com}/health"
echo ""
echo "📋 Comandos úteis:"
echo "   docker-compose -f docker-compose.traefik.yml logs -f    # Ver logs"
echo "   docker-compose -f docker-compose.traefik.yml restart    # Reiniciar"
echo "   docker-compose -f docker-compose.traefik.yml down       # Parar"
echo "   docker-compose -f docker-compose.traefik.yml up -d      # Iniciar"
echo ""
echo "🔧 Configuração Traefik:"
echo "   - SSL automático com Let's Encrypt"
echo "   - Load balancing automático"
echo "   - Middleware de segurança"
echo "   - Rede isolada: nciso-network"
echo ""
echo "🚀 n.CISO está rodando com Traefik!" 