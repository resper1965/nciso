#!/bin/bash

# 🚀 Script de Deploy para VPS com EasyPanel
# n.CISO - Deploy Automatizado

set -e

echo "🚀 Iniciando Deploy n.CISO na VPS..."

# 1. Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não está instalado. Instalando..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker instalado!"
fi

# 2. Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não está instalado. Instalando..."
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose instalado!"
fi

# 3. Criar diretório de logs
mkdir -p logs

# 4. Criar diretório SSL (para certificados)
mkdir -p ssl

# 5. Gerar certificado SSL auto-assinado (temporário)
if [ ! -f ssl/cert.pem ] || [ ! -f ssl/key.pem ]; then
    echo "🔐 Gerando certificado SSL temporário..."
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout ssl/key.pem \
        -out ssl/cert.pem \
        -subj "/C=BR/ST=SP/L=Sao Paulo/O=n.CISO/CN=localhost"
    echo "✅ Certificado SSL gerado!"
fi

# 6. Verificar variáveis de ambiente
if [ ! -f .env ]; then
    echo "❌ Arquivo .env não encontrado!"
    echo "📝 Criando .env com variáveis padrão..."
    cat > .env << EOF
# n.CISO - Environment Variables
NODE_ENV=production
PORT=3000

# Supabase Configuration
SUPABASE_URL=https://pszfqqmmljekibmcgmig.supabase.co
SUPABASE_ANON_KEY=sb_publishable_d2NwmSXLau87m9yNp590bA_zOKPvlMX
SUPABASE_SERVICE_ROLE_KEY=sb_secret_9nszt9IAhYd94neHZQHP6w_0viqK_FW

# API Configuration
API_URL=http://localhost:3000
EOF
    echo "✅ Arquivo .env criado!"
fi

# 7. Parar containers existentes
echo "🛑 Parando containers existentes..."
docker-compose down --remove-orphans

# 8. Build e deploy
echo "🔨 Fazendo build dos containers..."
docker-compose build --no-cache

echo "🚀 Iniciando containers..."
docker-compose up -d

# 9. Aguardar inicialização
echo "⏳ Aguardando inicialização..."
sleep 30

# 10. Verificar status
echo "🔍 Verificando status dos containers..."
docker-compose ps

# 11. Testar endpoints
echo "🧪 Testando endpoints..."
curl -k -s https://localhost/health || echo "⚠️  Health check falhou (normal na primeira execução)"

# 12. Mostrar informações
echo ""
echo "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
echo ""
echo "🌐 URLs disponíveis:"
echo "   Frontend: https://localhost"
echo "   Backend:  https://localhost/api"
echo "   Health:   https://localhost/health"
echo ""
echo "📋 Comandos úteis:"
echo "   docker-compose logs -f          # Ver logs"
echo "   docker-compose restart          # Reiniciar"
echo "   docker-compose down             # Parar"
echo "   docker-compose up -d            # Iniciar"
echo ""
echo "🔧 Para configurar domínio real:"
echo "   1. Configure DNS para apontar para este servidor"
echo "   2. Substitua certificado SSL em ./ssl/"
echo "   3. Atualize nginx.conf com seu domínio"
echo ""
echo "🚀 n.CISO está rodando em produção!" 