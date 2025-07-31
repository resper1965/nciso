#!/bin/bash

echo "🔍 Testando conexão SSH com a VPS..."

# Testar conexão básica
echo "📡 Testando ping..."
ping -c 3 62.72.8.164

echo ""
echo "🔑 Testando SSH..."
ssh -o ConnectTimeout=10 -o StrictHostKeyChecking=no root@62.72.8.164 "echo '✅ SSH funcionando!'" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Conexão SSH funcionando!"
    echo ""
    echo "🚀 Agora você pode usar:"
    echo "   bash scripts/ssh-vps.sh status"
    echo "   bash scripts/ssh-vps.sh commit 'mensagem'"
else
    echo "❌ Problema na conexão SSH"
    echo ""
    echo "🔧 Verifique:"
    echo "   1. Se a chave SSH está configurada"
    echo "   2. Se a VPS está acessível"
    echo "   3. Se as permissões estão corretas"
fi 