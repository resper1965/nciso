#!/bin/bash

# 🛡️ n.CISO - Setup VPS Ubuntu
# Uso: ./scripts/setup-vps.sh

set -e

echo "🐧 Configurando VPS Ubuntu para n.CISO..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERRO: $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] AVISO: $1${NC}"
}

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
    error "Execute este script como root (sudo)"
    exit 1
fi

# 1. Atualizar sistema
log "📦 Atualizando sistema..."
apt update && apt upgrade -y

# 2. Instalar dependências básicas
log "📦 Instalando dependências básicas..."
apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# 3. Instalar Node.js 18+
log "📦 Instalando Node.js 18+..."
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# Verificar versão do Node.js
NODE_VERSION=$(node --version)
log "✅ Node.js instalado: $NODE_VERSION"

# 4. Instalar PM2
log "📦 Instalando PM2..."
npm install -g pm2

# 5. Instalar Nginx
log "📦 Instalando Nginx..."
apt install -y nginx

# 6. Instalar Redis (opcional)
log "📦 Instalando Redis..."
apt install -y redis-server

# 7. Instalar Certbot
log "📦 Instalando Certbot..."
apt install -y certbot python3-certbot-nginx

# 8. Configurar firewall
log "🔒 Configurando firewall..."
ufw allow ssh
ufw allow 80
ufw allow 443
ufw allow 22
ufw --force enable

# 9. Criar usuário para aplicação
log "👤 Criando usuário para aplicação..."
if ! id "nciso" &>/dev/null; then
    useradd -m -s /bin/bash nciso
    usermod -aG sudo nciso
    log "✅ Usuário nciso criado"
else
    log "✅ Usuário nciso já existe"
fi

# 10. Configurar diretórios
log "📁 Configurando diretórios..."
mkdir -p /var/www/nciso
chown -R nciso:nciso /var/www/nciso
chmod -R 755 /var/www/nciso

# 11. Configurar Nginx
log "🌐 Configurando Nginx..."
cat > /etc/nginx/sites-available/nciso << 'EOF'
server {
    listen 80;
    server_name _;

    # Backend API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend (quando implementado)
    location / {
        root /var/www/nciso/frontend;
        try_files $uri $uri/ /index.html;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
}
EOF

# Ativar site
ln -sf /etc/nginx/sites-available/nciso /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Testar configuração Nginx
nginx -t

# Reiniciar Nginx
systemctl restart nginx
systemctl enable nginx

# 12. Configurar PM2 startup
log "🚀 Configurando PM2 startup..."
pm2 startup systemd -u nciso --hp /home/nciso

# 13. Configurar logs
log "📋 Configurando logs..."
mkdir -p /var/log/nciso
chown -R nciso:nciso /var/log/nciso

# 14. Configurar Redis
log "🔴 Configurando Redis..."
systemctl enable redis-server
systemctl start redis-server

# 15. Configurar monitoramento
log "📊 Configurando monitoramento..."
apt install -y htop iotop

# 16. Configurar backup
log "💾 Configurando backup..."
apt install -y rsync

# 17. Configurar cron jobs
log "⏰ Configurando cron jobs..."
cat > /etc/cron.d/nciso << 'EOF'
# Backup diário
0 2 * * * nciso rsync -av /var/www/nciso /backup/nciso/

# Limpeza de logs (semanal)
0 3 * * 0 find /var/log/nciso -name "*.log" -mtime +7 -delete

# Renovação SSL (diário)
0 12 * * * /usr/bin/certbot renew --quiet
EOF

# 18. Configurar swap (se necessário)
log "💾 Configurando swap..."
if [ ! -f /swapfile ]; then
    fallocate -l 2G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    log "✅ Swap configurado"
else
    log "✅ Swap já existe"
fi

# 19. Configurar limites do sistema
log "⚙️ Configurando limites do sistema..."
cat >> /etc/security/limits.conf << 'EOF'
nciso soft nofile 65536
nciso hard nofile 65536
nciso soft nproc 32768
nciso hard nproc 32768
EOF

# 20. Finalizar
log "🎉 Setup da VPS concluído!"
log ""
log "📊 Próximos passos:"
echo "   1. Configure seu domínio no DNS"
echo "   2. Execute: sudo certbot --nginx -d seu-dominio.com"
echo "   3. Clone o repositório: git clone https://github.com/seu-usuario/nciso-v1.git"
echo "   4. Configure as variáveis de ambiente"
echo "   5. Execute: ./scripts/deploy-vps.sh"
echo ""
log "📋 Comandos úteis:"
echo "   sudo systemctl status nginx    # Ver status do Nginx"
echo "   sudo systemctl status redis    # Ver status do Redis"
echo "   pm2 status                     # Ver status da aplicação"
echo "   htop                          # Monitor de recursos"
echo "   sudo ufw status               # Ver status do firewall" 