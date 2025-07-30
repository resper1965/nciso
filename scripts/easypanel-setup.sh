#!/bin/bash

# 🚀 Script de Setup para EasyPanel
# n.CISO - Configuração Automatizada

set -e

echo "🚀 Configurando n.CISO para EasyPanel..."

# 1. Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ Execute este script no diretório raiz do projeto"
    exit 1
fi

# 2. Criar arquivo de configuração para EasyPanel
echo "📝 Criando configuração para EasyPanel..."
cat > easypanel.json << EOF
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
      }
    },
    {
      "name": "frontend",
      "type": "nodejs",
      "port": 3001,
      "build": {
        "dockerfile": "Dockerfile.frontend"
      },
      "environment": {
        "NODE_ENV": "production",
        "NEXT_PUBLIC_API_URL": "https://\${DOMAIN}/api"
      }
    }
  ],
  "proxy": {
    "nginx": {
      "ssl": true,
      "domains": ["\${DOMAIN}"],
      "locations": [
        {
          "path": "/api",
          "proxy_pass": "http://backend:3000"
        },
        {
          "path": "/",
          "proxy_pass": "http://frontend:3000"
        }
      ]
    }
  }
}
EOF

# 3. Criar arquivo de variáveis de ambiente
echo "🔧 Criando arquivo de variáveis..."
cat > .env.production << EOF
# n.CISO - Production Environment
NODE_ENV=production
PORT=3000

# Supabase Configuration
SUPABASE_URL=https://pszfqqmmljekibmcgmig.supabase.co
SUPABASE_ANON_KEY=sb_publishable_d2NwmSXLau87m9yNp590bA_zOKPvlMX
SUPABASE_SERVICE_ROLE_KEY=sb_secret_9nszt9IAhYd94neHZQHP6w_0viqK_FW

# API Configuration
API_URL=https://\${DOMAIN}/api

# Frontend Configuration
NEXT_PUBLIC_API_URL=https://\${DOMAIN}/api
NEXT_PUBLIC_SUPABASE_URL=https://pszfqqmmljekibmcgmig.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_d2NwmSXLau87m9yNp590bA_zOKPvlMX
EOF

# 4. Criar script de deploy para EasyPanel
echo "📋 Criando script de deploy..."
cat > deploy-easypanel.sh << 'EOF'
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
EOF

chmod +x deploy-easypanel.sh

# 5. Criar arquivo de instruções
echo "📖 Criando instruções..."
cat > EASYPANEL_INSTRUCTIONS.md << EOF
# 🚀 n.CISO - Deploy no EasyPanel

## 📋 Instruções de Deploy

### 1. Preparação
- Faça upload dos arquivos para o servidor
- Configure as variáveis de ambiente no EasyPanel
- Configure o domínio no EasyPanel

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
chmod +x deploy-easypanel.sh
./deploy-easypanel.sh
\`\`\`

### 4. Verificação
- Frontend: https://seu-dominio.com
- Backend: https://seu-dominio.com/api
- Health: https://seu-dominio.com/health

### 5. Logs
\`\`\`bash
docker-compose logs -f
\`\`\`

## 🔧 Configuração SSL
O EasyPanel gerencia automaticamente os certificados SSL.

## 📊 Monitoramento
Use o painel do EasyPanel para monitorar:
- Uso de CPU e RAM
- Logs em tempo real
- Status dos containers

## 🚀 URLs Finais
- **Frontend**: https://seu-dominio.com
- **API**: https://seu-dominio.com/api
- **Health**: https://seu-dominio.com/health
EOF

echo "✅ Configuração para EasyPanel concluída!"
echo ""
echo "📋 Próximos passos:"
echo "   1. Faça upload dos arquivos para o servidor"
echo "   2. Configure as variáveis no EasyPanel"
echo "   3. Execute: ./deploy-easypanel.sh"
echo ""
echo "📖 Leia: EASYPANEL_INSTRUCTIONS.md" 