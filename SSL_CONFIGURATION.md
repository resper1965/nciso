# 🔐 **CONFIGURAÇÃO SSL DO BANCO DE DADOS**

## 📋 Visão Geral

O **Supabase** já fornece SSL/TLS por padrão, mas este documento explica como configurar adequadamente a segurança da conexão com o banco de dados.

## 🔒 Recursos de Segurança

### **1. 🔐 SSL/TLS Automático**
- ✅ **HTTPS obrigatório** - Todas as conexões usam HTTPS
- ✅ **Certificados válidos** - Certificados SSL/TLS gerenciados pelo Supabase
- ✅ **Criptografia em trânsito** - Dados criptografados durante transmissão
- ✅ **Headers de segurança** - Configurações de segurança aplicadas

### **2. 🔑 Autenticação Segura**
- ✅ **Chaves de API** - Autenticação via chaves seguras
- ✅ **JWT Tokens** - Tokens seguros para sessões
- ✅ **Row Level Security** - Isolamento de dados por tenant
- ✅ **Rate Limiting** - Proteção contra ataques

### **3. 🏢 Multi-tenant Seguro**
- ✅ **Isolamento de dados** - Cada tenant vê apenas seus dados
- ✅ **Headers de tenant** - Validação obrigatória de tenant ID
- ✅ **Auditoria** - Log de todas as operações
- ✅ **Validação de entrada** - Sanitização de dados

## 🔧 Configuração SSL

### **1. 📁 Arquivos Criados**

#### **`src/config/supabase-ssl.js`**
```javascript
// Cliente SSL configurado
const supabaseAnonSSL = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { /* configurações de autenticação */ },
  db: { schema: 'public' },
  global: { headers: { 'X-Client-Info': 'nciso-v1' } }
})
```

#### **`src/config/security.js`**
```javascript
// Configurações de segurança para produção
const securityConfig = {
  helmet: helmet({ /* headers de segurança */ }),
  rateLimit: rateLimit({ /* proteção contra ataques */ })
}
```

#### **`scripts/test-ssl-connection.js`**
```javascript
// Teste completo de SSL
async function testSSLConnection() {
  // Verificar certificados
  // Testar criptografia
  // Validar headers
}
```

### **2. 🧪 Comandos de Teste**

```bash
# Testar conexão SSL
npm run test:ssl

# Testar conexão geral
npm run test:connection

# Validar configurações
npm run validate:env
```

## 🔐 Tipos de Cliente SSL

### **1. 🔐 Cliente Anônimo SSL**
```javascript
const { supabaseAnonSSL } = require('../config/supabase-ssl')

// Login seguro
const { data } = await supabaseAnonSSL.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
```

### **2. 🔑 Cliente de Serviço SSL**
```javascript
const { supabaseServiceSSL } = require('../config/supabase-ssl')

// Operações administrativas seguras
const { data } = await supabaseServiceSSL
  .from('users')
  .select('*')
```

### **3. 🏢 Cliente Multi-tenant SSL**
```javascript
const { TenantSupabaseClientSSL } = require('../config/supabase-ssl')

const tenantClient = new TenantSupabaseClientSSL('tenant-id')

// Operações seguras por tenant
const policies = await tenantClient.listPolicies(10)
```

## 🛡️ Configurações de Segurança

### **1. 🔒 Headers de Segurança**
```javascript
// Content Security Policy
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    connectSrc: ["'self'", "https://*.supabase.co"],
    // ... outras diretivas
  }
}
```

### **2. 🚫 Rate Limiting**
```javascript
// Proteção contra ataques
rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
  message: { error: 'Muitas requisições' }
})
```

### **3. 🏢 Validação de Tenant**
```javascript
// Validar tenant ID
validateTenantId: (tenantId) => {
  if (!tenantId) return false
  if (!/^[a-zA-Z0-9-_]+$/.test(tenantId)) return false
  return true
}
```

## 🧪 Testes de Segurança

### **1. 🔐 Teste de Certificados**
```bash
npm run test:ssl
```

**Verifica:**
- ✅ URL usa HTTPS
- ✅ Domínio Supabase válido
- ✅ Chaves têm formato correto
- ✅ Certificados SSL válidos

### **2. 🔒 Teste de Criptografia**
```bash
npm run test:connection
```

**Verifica:**
- ✅ Comunicação criptografada
- ✅ Headers de segurança
- ✅ Dados protegidos em trânsito

### **3. 🏢 Teste de Multi-tenant**
```bash
npm run test:schema
```

**Verifica:**
- ✅ Isolamento de dados
- ✅ RLS policies funcionando
- ✅ Validação de tenant

## 🚨 Troubleshooting SSL

### **❌ Erro: "SSL certificate"**
- Verifique se a URL usa HTTPS
- Confirme se o domínio é válido
- Teste com `npm run test:ssl`

### **❌ Erro: "Invalid URL"**
- Configure credenciais no `.env`
- Use URL completa do Supabase
- Verifique formato das chaves

### **❌ Erro: "CORS"**
- Configure CORS adequadamente
- Adicione domínios permitidos
- Verifique headers de requisição

### **❌ Erro: "Rate limit"**
- Aguarde 15 minutos
- Verifique limite de requisições
- Use cache quando possível

## 🔍 Auditoria de Segurança

### **1. 📋 Logs de Auditoria**
```javascript
// Log automático de operações
auditConfig.logAudit(req, 'CREATE_POLICY', {
  tenantId: req.headers['x-tenant-id'],
  userId: req.user?.id,
  details: req.body
})
```

### **2. 🚨 Logs de Segurança**
```javascript
// Log de eventos de segurança
auditConfig.logSecurity(req, 'LOGIN_ATTEMPT', {
  ip: req.ip,
  userAgent: req.get('User-Agent')
})
```

### **3. 📊 Headers de Auditoria**
```javascript
// Headers obrigatórios
{
  'X-Tenant-ID': 'tenant-id',
  'X-User-Role': 'admin',
  'X-Request-ID': 'unique-request-id'
}
```

## ✅ Checklist de Segurança

- [ ] **SSL habilitado** - Todas as conexões usam HTTPS
- [ ] **Certificados válidos** - Certificados SSL/TLS ativos
- [ ] **Headers de segurança** - CSP, HSTS, etc. configurados
- [ ] **Rate limiting** - Proteção contra ataques implementada
- [ ] **Validação de entrada** - Dados sanitizados
- [ ] **Multi-tenant seguro** - Isolamento de dados funcionando
- [ ] **Auditoria ativa** - Logs de segurança implementados
- [ ] **CORS configurado** - Domínios permitidos definidos
- [ ] **JWT seguro** - Tokens com expiração e validação
- [ ] **RLS ativo** - Row Level Security funcionando

## 🎯 Próximos Passos

### **1. Imediato:**
```bash
# Configurar credenciais
nano .env

# Testar SSL
npm run test:ssl

# Aplicar schema
# Execute scripts/supabase-schema-manual.sql no Supabase
```

### **2. Curto Prazo:**
- Implementar middleware de segurança
- Configurar logs de auditoria
- Testar isolamento multi-tenant

### **3. Médio Prazo:**
- Configurar monitoramento de segurança
- Implementar alertas de segurança
- Configurar backup seguro

---

**Status:** 🟡 **SSL configurado, aguardando credenciais**  
**Próxima ação:** Configurar credenciais reais e testar SSL 