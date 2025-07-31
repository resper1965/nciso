#!/bin/bash

# Script para fazer commit na VPS
echo "🚀 Fazendo commit na VPS..."

# Configurações
VPS_IP="62.72.8.164"
VPS_USER="root"
PROJECT_PATH="/home/resper/nciso-v1"

# Comandos para executar na VPS
VPS_COMMANDS="
cd $PROJECT_PATH
git status
git add .
git commit -m '🔧 Corrige configuração Traefik e deploy - Site funcionando'
git push origin main
echo '✅ Commit realizado com sucesso na VPS!'
"

echo "📋 Comandos a executar na VPS:"
echo "$VPS_COMMANDS"
echo ""
echo "🔑 Para conectar na VPS, execute:"
echo "ssh root@$VPS_IP"
echo ""
echo "📁 Depois execute os comandos acima no diretório: $PROJECT_PATH" 