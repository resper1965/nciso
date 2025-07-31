# 🔗 Guia de Comunicação SSH - VPS n.CISO

## 🚀 **Configuração Rápida**

### **1. Conectar na VPS:**
```bash
# Método direto
ssh root@62.72.8.164

# Usando script
bash scripts/ssh-vps.sh connect
```

### **2. Verificar Status:**
```bash
bash scripts/ssh-vps.sh status
```

### **3. Fazer Commit:**
```bash
bash scripts/ssh-vps.sh commit "Corrige configuração Traefik"
```

## 📋 **Comandos Disponíveis**

| Comando | Descrição | Exemplo |
|---------|-----------|---------|
| `connect` | Conectar na VPS | `bash scripts/ssh-vps.sh connect` |
| `status` | Ver status do git | `bash scripts/ssh-vps.sh status` |
| `commit` | Fazer commit | `bash scripts/ssh-vps.sh commit "mensagem"` |
| `logs` | Ver logs do backend | `bash scripts/ssh-vps.sh logs` |
| `restart` | Reiniciar containers | `bash scripts/ssh-vps.sh restart` |
| `deploy` | Executar deploy | `bash scripts/ssh-vps.sh deploy` |

## 🔧 **Configuração SSH**

### **Arquivo de Configuração (~/.ssh/config):**
```
Host nciso-vps
    HostName 62.72.8.164
    User root
    Port 22
    IdentityFile ~/.ssh/id_rsa
    StrictHostKeyChecking no
```

### **Conectar com Configuração:**
```bash
ssh nciso-vps
```

## 📊 **Workflow Completo**

### **1. Desenvolvimento Local:**
```bash
# Fazer mudanças no código
git add .
git commit -m "Nova funcionalidade"
git push origin main
```

### **2. Deploy na VPS:**
```bash
# Conectar na VPS
bash scripts/ssh-vps.sh connect

# Ou executar comandos remotamente
bash scripts/ssh-vps.sh deploy
```

### **3. Monitoramento:**
```bash
# Ver logs
bash scripts/ssh-vps.sh logs

# Verificar status
bash scripts/ssh-vps.sh status
```

## 🎯 **Exemplos Práticos**

### **Commit e Deploy Automático:**
```bash
# 1. Commit local
git add .
git commit -m "Nova feature"
git push origin main

# 2. Deploy na VPS
bash scripts/ssh-vps.sh deploy

# 3. Verificar logs
bash scripts/ssh-vps.sh logs
```

### **Debug na VPS:**
```bash
# Conectar na VPS
bash scripts/ssh-vps.sh connect

# Dentro da VPS:
cd /home/resper/nciso-v1
docker logs nciso-backend
docker logs nciso-frontend
```

## 🔐 **Segurança**

- ✅ Chaves SSH configuradas
- ✅ StrictHostKeyChecking desabilitado
- ✅ Conexão direta por IP
- ✅ Scripts automatizados

## 📈 **Benefícios**

1. **Rapidez:** Comandos automatizados
2. **Segurança:** SSH com chaves
3. **Facilidade:** Scripts prontos
4. **Monitoramento:** Logs remotos
5. **Deploy:** Automatizado

## 🚀 **Próximos Passos**

1. **Testar conexão:** `bash scripts/ssh-vps.sh connect`
2. **Verificar status:** `bash scripts/ssh-vps.sh status`
3. **Fazer commit:** `bash scripts/ssh-vps.sh commit "Teste"`
4. **Monitorar logs:** `bash scripts/ssh-vps.sh logs` 