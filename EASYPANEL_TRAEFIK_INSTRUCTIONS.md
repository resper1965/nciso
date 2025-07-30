# 🚀 n.CISO - Deploy no EasyPanel com Traefik

## 📋 Instruções de Deploy

### 1. Preparação
- Faça upload dos arquivos para o servidor
- Configure as variáveis de ambiente no EasyPanel
- Configure o domínio no EasyPanel
- Certifique-se que o Traefik está ativo

### 2. Variáveis de Ambiente
Configure estas variáveis no EasyPanel:

```
NODE_ENV=production
SUPABASE_URL=https://pszfqqmmljekibmcgmig.supabase.co
SUPABASE_ANON_KEY=sb_publishable_d2NwmSXLau87m9yNp590bA_zOKPvlMX
SUPABASE_SERVICE_ROLE_KEY=sb_secret_9nszt9IAhYd94neHZQHP6w_0viqK_FW
DOMAIN=seu-dominio.com
```

### 3. Deploy
Execute no terminal do EasyPanel:

```bash
chmod +x deploy-easypanel-traefik.sh
./deploy-easypanel-traefik.sh
```

### 4. Configuração Traefik
O Traefik irá automaticamente:
- Gerar certificados SSL com Let's Encrypt
- Configurar rotas para frontend e backend
- Gerenciar load balancing
- Aplicar middlewares de segurança

### 5. URLs Finais
- **Frontend**: https://seu-dominio.com
- **API**: https://api.seu-dominio.com
- **Health**: https://seu-dominio.com/health

### 6. Logs
```bash
docker-compose -f docker-compose.traefik.yml logs -f
```

## 🔧 Configuração Traefik

### Labels Configuradas
- **Backend**: `api.seu-dominio.com` ou `/api`
- **Frontend**: `seu-dominio.com`
- **SSL**: Automático com Let's Encrypt
- **Middleware**: Strip prefix para API

### Rede
- **Network**: `nciso-network` (external)
- **Ports**: 3000 (interno)
- **SSL**: 443 (externo)

## 📊 Monitoramento
Use o painel do EasyPanel para monitorar:
- Uso de CPU e RAM
- Logs em tempo real
- Status dos containers
- Métricas do Traefik

## 🚀 URLs Finais
- **Frontend**: https://seu-dominio.com
- **API**: https://api.seu-dominio.com
- **Health**: https://seu-dominio.com/health
