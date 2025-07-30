# 🛡️ n.CISO - Guia de Aplicação de Schemas

## 📋 **STATUS ATUAL**

✅ **Tabelas já criadas:**
- users, policies, controls, domains
- assessments, risks, audits, incidents, tickets

✅ **Funções já criadas:**
- validate_email_domain
- generate_invite_token
- is_invite_expired
- update_updated_at_column

❌ **Tabelas pendentes:**
- tenants
- invites

## 🚀 **PASSO A PASSO PARA APLICAR SCHEMAS**

### **1. Acessar Supabase**
```
URL: https://supabase.com/dashboard/project/pszfqqmmljekibmcgmig
```

### **2. Ir para SQL Editor**
- Clique em "SQL Editor" no menu lateral
- Clique em "New query"

### **3. Aplicar Schema de Tenants (ESCOLHA UMA VERSÃO)**

**Opção A - Versão Ultra-Simples (RECOMENDADA):**
- Copie todo o conteúdo de `scripts/apply-tenants-simple.sql`
- Cole no SQL Editor
- Clique em "Run"

**Opção B - Versão Corrigida:**
- Copie todo o conteúdo de `scripts/apply-tenants-fixed.sql`
- Cole no SQL Editor
- Clique em "Run"

### **4. Verificar Aplicação**
Execute no terminal:
```bash
npm run check:schema
npm run test:tenants
```

## 📊 **VERSÕES DISPONÍVEIS**

### **1. Versão Ultra-Simples** (`scripts/apply-tenants-simple.sql`)
- ✅ Sem JSONB (evita problemas de sintaxe)
- ✅ Estrutura básica
- ✅ Todas as funcionalidades essenciais

### **2. Versão Corrigida** (`scripts/apply-tenants-fixed.sql`)
- ✅ JSONB com cast explícito
- ✅ Estrutura completa
- ✅ Configurações avançadas

## 🧪 **TESTES APÓS APLICAÇÃO**

### **1. Testar Schema**
```bash
npm run test:tenants
```

### **2. Testar Conexão**
```bash
npm run test:connection
```

### **3. Testar Invites API**
```bash
npm run test:invites
```

## ✅ **RESULTADO ESPERADO**

Após aplicar o schema, você deve ver:
- ✅ Tabela `tenants` criada
- ✅ Tabela `invites` criada
- ✅ Índices criados
- ✅ RLS habilitado
- ✅ Funções auxiliares criadas
- ✅ Dados iniciais inseridos

## 🚀 **PRÓXIMOS PASSOS**

1. **Aplicar schema** (manual no Supabase)
2. **Testar conexão** (`npm run test:tenants`)
3. **Iniciar frontend** (`cd nciso-frontend && npm run dev`)
4. **Testar API** (`npm run test:invites`)

## 📞 **SUPORTE**

Se houver erros:
1. **Erro de sintaxe**: Use a versão ultra-simples
2. **Erro de tipo**: Verifique se o SQL foi executado completamente
3. **Execute**: `npm run check:schema` para verificar status
4. **Verifique**: Logs no Supabase Dashboard

## 🔧 **COMANDOS ÚTEIS**

```bash
npm run check:schema      # Verificar status das tabelas
npm run test:tenants      # Testar schema de tenants
npm run check:status      # Status geral do projeto
cd nciso-frontend && npm run dev  # Frontend
```

---

**🎯 Status: Aguardando aplicação manual do schema de tenants**
**💡 Recomendação: Use scripts/apply-tenants-simple.sql** 