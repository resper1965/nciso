#!/bin/bash

# Script para configurar credenciais do Supabase
echo "🔧 Configurando credenciais do Supabase..."

# Backup do arquivo .env se existir
if [ -f .env ]; then
    cp .env .env.backup
    echo "✅ Backup do .env criado"
fi

# Criar novo arquivo .env com credenciais reais
cat > .env << 'EOF'
# =============================================================================
# 🛡️ n.CISO - Configuração de Ambiente (REAL)
# =============================================================================

# =============================================================================
# 📊 BANCO DE DADOS - SUPABASE (REAL)
# =============================================================================
SUPABASE_URL=https://pszfqqmmljekibmcgmig.supabase.co
SUPABASE_ANON_KEY=sb_publishable_d2NwmSXLau87m9yNp590bA_zOKPvlMX
SUPABASE_SERVICE_ROLE_KEY=sb_secret_9nszt9IAhYd94neHZQHP6w_0viqK_FW

# =============================================================================
# 🔐 SEGURANÇA E AUTENTICAÇÃO
# =============================================================================
JWT_SECRET=nciso_jwt_secret_key_for_production_min_32_chars_long
BCRYPT_ROUNDS=12
ENCRYPTION_KEY=nciso_encryption_key_32_chars_long_for_prod

# =============================================================================
# 🚀 APLICAÇÃO PRINCIPAL
# =============================================================================
NODE_ENV=production
PORT=3000
API_VERSION=v1
CORS_ORIGIN=http://localhost:3000

# =============================================================================
# 📧 EMAIL E NOTIFICAÇÕES
# =============================================================================
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@nciso.com
SMTP_PASS=nciso_email_password
SMTP_FROM=noreply@nciso.com

# =============================================================================
# 🗄️ CACHE - REDIS
# =============================================================================
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=nciso_redis_password
REDIS_DB=0

# =============================================================================
# 🛡️ RATE LIMITING E SEGURANÇA
# =============================================================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MAX_FILE_SIZE=10485760
MAX_FILES=5

# =============================================================================
# 📝 LOGGING E MONITORAMENTO
# =============================================================================
LOG_LEVEL=info
LOG_FILE=logs/app.log
LOG_MAX_SIZE=20m
LOG_MAX_FILES=14

# =============================================================================
# 🌍 INTERNACIONALIZAÇÃO (i18n)
# =============================================================================
DEFAULT_LOCALE=pt-BR
SUPPORTED_LOCALES=pt-BR,en-US,es
I18N_DEBUG=false

# =============================================================================
# 🧪 DESENVOLVIMENTO E TESTES
# =============================================================================
DEV_MODE=false
MOCK_DATA=false
DEBUG_MODE=false
TEST_MODE=false

# =============================================================================
# 🛡️ MCP SERVER
# =============================================================================
MCP_LOG_LEVEL=info
MCP_TIMEOUT=30000
MCP_MAX_CONNECTIONS=100

# =============================================================================
# 🔗 SERVIÇOS EXTERNOS
# =============================================================================
# Portainer (Opcional)
PORTANIER_URL=http://localhost:9000
PORTANIER_USERNAME=admin
PORTANIER_PASSWORD=nciso_portainer_password

# Infusion (Opcional)
INFUSION_API_KEY=nciso_infusion_api_key

# =============================================================================
# 📊 MÓDULOS ESPECÍFICOS
# =============================================================================

# n.Platform - Autenticação
PLATFORM_SESSION_TIMEOUT=3600000
PLATFORM_MAX_LOGIN_ATTEMPTS=5
EOF

echo "✅ Arquivo .env configurado com credenciais reais do Supabase"
echo "🔗 URL: https://pszfqqmmljekibmcgmig.supabase.co"
echo "🔑 Anon Key: sb_publishable_d2NwmSXLau87m9yNp590bA_zOKPvlMX"
echo "🔐 Service Role Key: sb_secret_9nszt9IAhYd94neHZQHP6w_0viqK_FW"
echo ""
echo "📋 Próximos passos:"
echo "1. Execute os scripts SQL no Supabase"
echo "2. Teste a conexão com: npm run test:supabase"
echo "3. Inicie o servidor: npm run dev" 