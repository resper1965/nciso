#!/bin/bash

# Script para configurar chave SSH na VPS
echo "🔑 Configurando chave SSH na VPS n.CISO..."

# Configurações
VPS_IP="62.72.8.164"
VPS_USER="root"
SSH_KEY_FILE="~/.ssh/id_rsa.pub"

# Mostrar a chave pública
echo "📋 Sua chave pública SSH:"
echo "=================================="
cat ~/.ssh/id_rsa.pub
echo "=================================="
echo ""

# Instruções para adicionar na VPS
echo "🚀 Para adicionar esta chave na VPS:"
echo ""
echo "1. Conecte na VPS:"
echo "   ssh root@$VPS_IP"
echo ""
echo "2. Adicione a chave ao authorized_keys:"
echo "   mkdir -p ~/.ssh"
echo "   echo 'SUA_CHAVE_AQUI' >> ~/.ssh/authorized_keys"
echo "   chmod 600 ~/.ssh/authorized_keys"
echo "   chmod 700 ~/.ssh"
echo ""
echo "3. Ou use o comando automático:"
echo "   ssh-copy-id root@$VPS_IP"
echo ""

# Tentar conexão com senha para configurar
echo "🔧 Tentando configurar automaticamente..."
echo "Digite a senha da VPS quando solicitado:"
ssh-copy-id -o StrictHostKeyChecking=no $VPS_USER@$VPS_IP

echo ""
echo "✅ Configuração concluída!"
echo "Teste a conexão com: ssh root@$VPS_IP" 