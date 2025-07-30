# 🚀 n.CISO - Deploy no EasyPanel

## 📋 Instruções de Deploy

### 1. Preparação
- Faça upload dos arquivos para o servidor
- Configure as variáveis de ambiente no EasyPanel
- Configure o domínio no EasyPanel

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
chmod +x deploy-easypanel.sh
./deploy-easypanel.sh
```

### 4. Verificação
- Frontend: https://seu-dominio.com
- Backend: https://seu-dominio.com/api
- Health: https://seu-dominio.com/health

### 5. Logs
```bash
docker-compose logs -f
```

## 🔧 Configuração SSL
O EasyPanel gerencia automaticamente os certificados SSL.

## 📊 Monitoramento
Use o painel do EasyPanel para monitorar:
- Uso de CPU e RAM
- Logs em tempo real
- Status dos containers

## 🚀 URLs Finais
- **Frontend**: https://seu-dominio.com
- **API**: https://seu-dominio.com/api
- **Health**: https://seu-dominio.com/health
