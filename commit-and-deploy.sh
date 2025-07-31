#!/bin/bash

echo "🚀 Fazendo commit das alterações..."

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "feat: implementar módulo n.ISMS completo com métricas, navegação e traduções"

# Push para o repositório
git push origin main

echo "✅ Commit realizado com sucesso!"

echo "🚀 Iniciando deploy na VPS..."

# Executar deploy
./scripts/ssh-vps.sh deploy

echo "✅ Deploy iniciado!" 