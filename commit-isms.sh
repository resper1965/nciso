#!/bin/bash

echo "🚀 Fazendo commit do módulo n.ISMS completo..."

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "feat: implementar módulo n.ISMS completo com dados reais do Supabase

- Adiciona hooks para dados reais (useISMSData.ts)
- Implementa métricas dinâmicas do Supabase
- Adiciona CRUD completo para políticas, controles, domínios
- Implementa busca e filtros funcionais
- Adiciona loading states e error handling
- Integra com React Query para cache e sincronização
- Remove dependência de dados mock
- Adiciona traduções completas para pt-BR, en-US, es"

# Push para o repositório
git push origin main

echo "✅ Commit realizado com sucesso!"
echo "🚀 Deploy automático iniciado via GitHub Actions..." 