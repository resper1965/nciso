#!/bin/bash

# Script para testar o build do backend
echo "🔧 Testando build do backend..."

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo "❌ package.json não encontrado. Execute este script no diretório raiz do projeto."
    exit 1
fi

# Instalar dependências
echo "📦 Instalando dependências..."
npm ci

# Verificar se os arquivos principais existem
echo "🔍 Verificando arquivos principais..."
if [ ! -f "scripts/start-backend.js" ]; then
    echo "❌ scripts/start-backend.js não encontrado"
    exit 1
fi

if [ ! -f "src/api/index.js" ]; then
    echo "❌ src/api/index.js não encontrado"
    exit 1
fi

# Testar se o servidor inicia
echo "🧪 Testando inicialização do servidor..."
timeout 10s node scripts/start-backend.js &
SERVER_PID=$!

# Aguardar um pouco para o servidor inicializar
sleep 3

# Verificar se o servidor está rodando
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
    echo "✅ Servidor iniciou corretamente!"
    kill $SERVER_PID 2>/dev/null
    echo "🎉 Build testado com sucesso!"
else
    echo "❌ Servidor não iniciou corretamente"
    kill $SERVER_PID 2>/dev/null
    exit 1
fi

echo "✅ Build testado com sucesso!" 