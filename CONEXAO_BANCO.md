# 🔗 **CONFIGURAÇÃO DE CONEXÃO COM BANCO DE DADOS**

## 📋 Status Atual

**❌ Credenciais não configuradas** - As variáveis do Supabase ainda estão como placeholders.

## 🎯 Passo a Passo para Configurar

### **1. 🔧 Configurar Credenciais do Supabase**

#### **A. Obter Credenciais:**
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto: `pszfqqmmljekibmcgmig`
3. Vá em **Settings > API**
4. Copie as credenciais:
   - **Project URL:** `https://pszfqqmmljekibmcgmig.supabase.co`
   - **anon public:** `sb_publishable_d2NwmSXLau87m9yNp590bA_zOKPvlMX`
   - **service_role secret:** `sb_secret_9nszt9IAhYd94neHZQHP6w_0viqK_FW`

#### **B. Configurar .env:**
```bash
# Editar arquivo .env
nano .env

# Substituir as linhas:
SUPABASE_URL=https://pszfqqmmljekibmcgmig.supabase.co
SUPABASE_ANON_KEY=sb_publishable_d2NwmSXLau87m9yNp590bA_zOKPvlMX
SUPABASE_SERVICE_ROLE_KEY=sb_secret_9nszt9IAhYd94neHZQHP6w_0viqK_FW
```

### **2. 🗄️ Aplicar Schema do Banco**

#### **A. Executar SQL no Supabase:**
1. No painel do Supabase, vá para **SQL Editor**
2. Clique em **New Query**
3. Copie e cole o conteúdo de `scripts/supabase-schema-manual.sql`
4. Clique em **Run**

#### **B. Verificar Aplicação:**
```bash
npm run test:schema
```

### **3. 🧪 Testar Conexão**

#### **A. Teste Básico:**
```bash
npm run test:connection
```

#### **B. Teste de Schema:**
```bash
npm run test:schema
```

#### **C. Teste de MCP:**
```bash
npm run mcp:test
```

## 🔧 Arquivos de Conexão Criados

### **1. 📁 `src/config/supabase.js`**
- **Cliente Anônimo** - Para frontend e autenticação
- **Cliente de Serviço** - Para operações administrativas
- **Cliente Multi-tenant** - Para operações por tenant
- **Função de Teste** - Para validar conexão

### **2. 📁 `scripts/test-connection.js`**
- **Teste CRUD** - Criar, ler, atualizar, excluir
- **Teste Multi-tenant** - Isolamento entre tenants
- **Teste Performance** - Tempo de resposta
- **Teste Básico** - Conexão simples

### **3. 📁 `src/api/example-usage.js`**
- **Exemplos de Uso** - Como usar em APIs
- **Middleware** - Autenticação e tenant
- **Operações** - CRUD e relatórios

## 🔐 Tipos de Cliente

### **🔐 Cliente Anônimo (`supabaseAnon`)**
```javascript
// Para frontend e autenticação
const { supabaseAnon } = require('../config/supabase')

// Login
const { data, error } = await supabaseAnon.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
})
```

### **🔑 Cliente de Serviço (`supabaseService`)**
```javascript
// Para operações administrativas (bypass RLS)
const { supabaseService } = require('../config/supabase')

// Listar todos os usuários
const { data, error } = await supabaseService
  .from('users')
  .select('*')
```

### **🏢 Cliente Multi-tenant (`TenantSupabaseClient`)**
```javascript
// Para operações específicas por tenant
const { TenantSupabaseClient } = require('../config/supabase')

const tenantClient = new TenantSupabaseClient('tenant-id')

// Listar políticas do tenant
const policies = await tenantClient.listPolicies(10)

// Criar política no tenant
const newPolicy = await tenantClient.createPolicy({
  title: 'Nova Política',
  content: 'Conteúdo da política'
})
```

## 🚀 Exemplos de Uso

### **1. 🔐 Autenticação (Frontend)**
```javascript
// Login de usuário
const result = await handleUserLogin('user@example.com', 'password')
```

### **2. 🏢 API de Políticas (Backend)**
```javascript
// Listar políticas
const policies = await handlePoliciesAPI('tenant-1', 'list')

// Criar política
const newPolicy = await handlePoliciesAPI('tenant-1', 'create', {
  title: 'Política de Segurança',
  content: 'Conteúdo da política'
})
```

### **3. 📊 Relatórios (Backend)**
```javascript
// Relatório de efetividade
const report = await handleReportsAPI('tenant-1', 'effectiveness')
```

### **4. 🔑 Operações Administrativas**
```javascript
// Listar todos os usuários
const users = await handleAdminOperations('list_all_users')
```

## 🔄 Middleware

### **Autenticação:**
```javascript
app.use('/api', authenticateUser)
```

### **Validação de Tenant:**
```javascript
app.use('/api', validateTenant)
```

## 🧪 Comandos de Teste

```bash
# Testar conexão completa
npm run test:connection

# Testar schema
npm run test:schema

# Testar MCP
npm run mcp:test

# Validar ambiente
npm run validate:env
```

## ❌ Troubleshooting

### **Erro: "Invalid URL"**
- Verifique se `SUPABASE_URL` está correto
- Deve ser: `https://pszfqqmmljekibmcgmig.supabase.co`

### **Erro: "relation does not exist"**
- Execute o schema SQL no Supabase
- Verifique se as tabelas foram criadas

### **Erro: "RLS policy"**
- RLS está ativo (comportamento esperado)
- Use cliente de serviço para bypass

### **Erro: "permission denied"**
- Verifique se as chaves estão corretas
- Confirme permissões do projeto

## ✅ Checklist de Configuração

- [ ] **Credenciais configuradas** no `.env`
- [ ] **Schema aplicado** no Supabase
- [ ] **Teste de conexão** passando
- [ ] **Teste de schema** passando
- [ ] **MCP funcionando** corretamente

## 🎯 Próximos Passos

1. **Configurar credenciais** no `.env`
2. **Aplicar schema** no Supabase
3. **Testar conexão** com `npm run test:connection`
4. **Implementar APIs** usando os exemplos
5. **Integrar frontend** com os clientes

---

**Status:** 🟡 **Aguardando configuração das credenciais**  
**Próxima ação:** Configurar credenciais reais no `.env` 