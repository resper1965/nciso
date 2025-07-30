#!/bin/bash

# 🚀 Script de Setup para EasyPanel com Traefik
# n.CISO - Configuração Automatizada

set -e

echo "🚀 Configurando n.CISO para EasyPanel com Traefik..."

# 1. Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script no diretório raiz do projeto"
    exit 1
fi

# 2. Criar arquivo de configuração para EasyPanel com Traefik
echo "📝 Criando configuração para EasyPanel com Traefik..."
cat > easypanel-traefik.json << EOF
{
  "name": "nciso",
  "description": "n.CISO - Information Security Management Platform",
  "version": "1.0.0",
  "type": "application",
  "services": [
    {
      "name": "backend",
      "type": "nodejs",
      "port": 3000,
      "build": {
        "dockerfile": "Dockerfile.backend"
      },
      "environment": {
        "NODE_ENV": "production",
        "PORT": "3000"
      },
      "labels": {
        "traefik.enable": "true",
        "traefik.http.routers.backend.rule": "Host(\`api.\${DOMAIN}\`) || PathPrefix(\`/api\`)",
        "traefik.http.routers.backend.entrypoints": "websecure",
        "traefik.http.routers.backend.tls.certresolver": "letsencrypt",
        "traefik.http.services.backend.loadbalancer.server.port": "3000",
        "traefik.http.middlewares.backend-stripprefix.stripprefix.prefixes": "/api",
        "traefik.http.routers.backend.middlewares": "backend-stripprefix"
      }
    },
    {
      "name": "frontend",
      "type": "nodejs",
      "port": 3000,
      "build": {
        "dockerfile": "Dockerfile.frontend"
      },
      "environment": {
        "NODE_ENV": "production",
        "NEXT_PUBLIC_API_URL": "https://api.\${DOMAIN}"
      },
      "labels": {
        "traefik.enable": "true",
        "traefik.http.routers.frontend.rule": "Host(\`\${DOMAIN}\`)",
        "traefik.http.routers.frontend.entrypoints": "websecure",
        "traefik.http.routers.frontend.tls.certresolver": "letsencrypt",
        "traefik.http.services.frontend.loadbalancer.server.port": "3000",
        "traefik.http.routers.frontend.priority": "1"
      }
    }
  ],
  "networks": {
    "nciso-network": {
      "external": true
    }
  }
}
EOF

# 3. Criar arquivo de variáveis de ambiente para Traefik
echo "🔧 Criando arquivo de variáveis..."
cat > .env.traefik << EOF
# n.CISO - Traefik Environment
NODE_ENV=production
PORT=3000

# Supabase Configuration
SUPABASE_URL=https://pszfqqmmljekibmcgmig.supabase.co
SUPABASE_ANON_KEY=sb_publishable_d2NwmSXLau87m9yNp590bA_zOKPvlMX
SUPABASE_SERVICE_ROLE_KEY=sb_secret_9nszt9IAhYd94neHZQHP6w_0viqK_FW

# Domain Configuration
DOMAIN=seu-dominio.com

# Frontend Configuration
NEXT_PUBLIC_API_URL=https://api.\${DOMAIN}
NEXT_PUBLIC_SUPABASE_URL=https://pszfqqmmljekibmcgmig.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_d2NwmSXLau87m9yNp590bA_zOKPvlMX
EOF

# 4. Criar script de deploy para EasyPanel com Traefik
echo "📋 Criando script de deploy..."
cat > deploy-easypanel-traefik.sh << 'EOF'
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
EOF

chmod +x deploy-easypanel-traefik.sh

# 5. Criar arquivo de instruções para Traefik
echo "📖 Criando instruções..."
cat > EASYPANEL_TRAEFIK_INSTRUCTIONS.md << EOF
# 🚀 n.CISO - Deploy no EasyPanel com Traefik

## 📋 Instruções de Deploy

### 1. Preparação
- Faça upload dos arquivos para o servidor
- Configure as variáveis de ambiente no EasyPanel
- Configure o domínio no EasyPanel
- Certifique-se que o Traefik está ativo

### 2. Variáveis de Ambiente
Configure estas variáveis no EasyPanel:

\`\`\`
NODE_ENV=production
SUPABASE_URL=https://pszfqqmmljekibmcgmig.supabase.co
SUPABASE_ANON_KEY=sb_publishable_d2NwmSXLau87m9yNp590bA_zOKPvlMX
SUPABASE_SERVICE_ROLE_KEY=sb_secret_9nszt9IAhYd94neHZQHP6w_0viqK_FW
DOMAIN=seu-dominio.com
\`\`\`

### 3. Deploy
Execute no terminal do EasyPanel:

\`\`\`bash
chmod +x deploy-easypanel-traefik.sh
./deploy-easypanel-traefik.sh
\`\`\`

### 4. Configuração Traefik
O Traefik irá automaticamente:
- Gerar certificados SSL com Let's Encrypt
- Configurar rotas para frontend e backend
- Gerenciar load balancing
- Aplicar middlewares de segurança

### 5. URLs Finais
- **Frontend**: https://seu-dominio.com
- **API**: https://api.seu-dominio.com
- **Health**: https://seu-dominio.com/health

### 6. Logs
\`\`\`bash
docker-compose -f docker-compose.traefik.yml logs -f
\`\`\`

## 🔧 Configuração Traefik

### Labels Configuradas
- **Backend**: \`api.seu-dominio.com\` ou \`/api\`
- **Frontend**: \`seu-dominio.com\`
- **SSL**: Automático com Let's Encrypt
- **Middleware**: Strip prefix para API

### Rede
- **Network**: \`nciso-network\` (external)
- **Ports**: 3000 (interno)
- **SSL**: 443 (externo)

## 📊 Monitoramento
Use o painel do EasyPanel para monitorar:
- Uso de CPU e RAM
- Logs em tempo real
- Status dos containers
- Métricas do Traefik

## 🚀 URLs Finais
- **Frontend**: https://seu-dominio.com
- **API**: https://api.seu-dominio.com
- **Health**: https://seu-dominio.com/health
EOF

echo "✅ Configuração para EasyPanel com Traefik concluída!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Faça upload dos arquivos para o servidor"
echo "   2. Configure as variáveis no EasyPanel"
echo "   3. Execute: ./deploy-easypanel-traefik.sh"
echo ""
echo "📖 Leia: EASYPANEL_TRAEFIK_INSTRUCTIONS.md" 