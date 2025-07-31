#!/bin/bash

# Script para conectar na VPS n.CISO
echo "🚀 Conectando na VPS n.CISO..."

# Configurações
VPS_HOST="62.72.8.164"
PROJECT_PATH="/etc/easypanel/projects/nciso"

# Função para executar comandos na VPS
execute_on_vps() {
    local command="$1"
    echo "📋 Executando: $command"
    ssh -i ~/.ssh/id_rsa_nciso -o StrictHostKeyChecking=no root@$VPS_HOST "cd $PROJECT_PATH && $command"
}

# Função para abrir shell na VPS
connect_vps() {
    echo "🔗 Conectando na VPS..."
    ssh -i ~/.ssh/id_rsa_nciso -o StrictHostKeyChecking=no root@$VPS_HOST
}

# Função para fazer commit na VPS
commit_vps() {
    echo "💾 Fazendo commit na VPS..."
    execute_on_vps "git add ."
    execute_on_vps "git commit -m '🔧 $1'"
    execute_on_vps "git push origin main"
    echo "✅ Commit realizado com sucesso!"
}

# Menu de opções
case "$1" in
    "connect")
        connect_vps
        ;;
    "status")
        execute_on_vps "echo '📊 Status do projeto:' && ls -la && echo '🐳 Containers:' && docker ps --format 'table {{.Names}}\t{{.Status}}' | grep nciso"
        ;;
    "commit")
        echo "❌ Comando commit não disponível - projeto não é um repositório git"
        echo "💡 Use: $0 status para ver o status atual"
        ;;
    "logs")
        execute_on_vps "docker logs nciso_nciso-backend.1.k76p87u4vdf429wy5yl4ngcxt --tail 20"
        ;;
    "restart")
        execute_on_vps "docker-compose -f docker-compose.traefik.yml restart"
        ;;
    "deploy")
        execute_on_vps "bash deploy-easypanel-traefik.sh"
        ;;
    *)
        echo "🔧 Script SSH VPS n.CISO"
        echo ""
        echo "Uso: $0 [comando]"
        echo ""
        echo "Comandos disponíveis:"
        echo "  connect  - Conectar na VPS"
        echo "  status   - Ver status do git"
        echo "  commit   - Fazer commit (ex: $0 commit 'mensagem')"
        echo "  logs     - Ver logs do backend"
        echo "  restart  - Reiniciar containers"
        echo "  deploy   - Executar deploy"
        echo ""
        echo "Exemplo:"
        echo "  $0 commit 'Corrige configuração Traefik'"
        ;;
esac 