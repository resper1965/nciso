# 🛡️ n.CISO - Guia de Aplicação do Schema

## 📋 Status Atual

**❌ Schema não aplicado** - As tabelas ainda não foram criadas no Supabase.

## 🎯 Tarefa: Aplicar Schema Completo

### **1. Acessar o Painel do Supabase**

1. Acesse: https://supabase.com/dashboard
2. Faça login com suas credenciais
3. Selecione o projeto: `pszfqqmmljekibmcgmig`

### **2. Executar Schema no SQL Editor**

1. No painel do Supabase, vá para **SQL Editor**
2. Clique em **New Query**
3. Copie e cole o conteúdo do arquivo `scripts/supabase-schema-manual.sql`
4. Clique em **Run** para executar

### **3. Verificar Aplicação**

Após executar o SQL, execute o comando de teste:

```bash
npm run test:schema
```

### **4. Estrutura do Schema**

#### **📊 Tabelas Principais:**

- **`users`** - Usuários do sistema
- **`policies`** - Políticas de segurança
- **`controls`** - Controles de segurança
- **`domains`** - Domínios hierárquicos
- **`assessments`** - Avaliações de controles
- **`risks`** - Gestão de riscos
- **`audits`** - Auditorias
- **`incidents`** - Incidentes de segurança
- **`tickets`** - Tickets de suporte

#### **🔐 Recursos de Segurança:**

- **Row Level Security (RLS)** - Isolamento por tenant
- **Índices otimizados** - Performance de consultas
- **Triggers automáticos** - Atualização de timestamps
- **Políticas de acesso** - Controle granular

#### **🏗️ Arquitetura Multi-tenant:**

- **`tenant_id`** em todas as tabelas
- **Isolamento completo** entre tenants
- **Roles hierárquicos** (admin, auditor, user)
- **Auditoria automática** de mudanças

### **5. Próximos Passos Após Schema**

#### **🎨 Frontend Integration:**

1. **Design System** - Implementar componentes base
2. **Página de Login** - Integração com Supabase Auth
3. **Listagem de Políticas** - Usando MCPTable
4. **React Query** - Cache e sincronização
5. **MCP Integration** - Comunicação com backend

#### **🌍 Multilíngue:**

- **pt-BR** - Português (padrão)
- **en-US** - Inglês
- **es** - Espanhol

### **6. Comandos Úteis**

```bash
# Testar schema
npm run test:schema

# Aplicar schema (automático)
npm run apply:schema

# Testar conexão Supabase
npm run test:supabase-basic

# Validar variáveis de ambiente
npm run validate:env
```

### **7. Troubleshooting**

#### **❌ Erro: "relation does not exist"**
- Execute o SQL manualmente no painel do Supabase
- Verifique se está no projeto correto

#### **❌ Erro: "RLS policy"**
- RLS está ativo (comportamento esperado)
- Configure autenticação adequada

#### **❌ Erro: "permission denied"**
- Verifique se a chave de serviço está correta
- Confirme permissões do projeto

### **8. Estrutura Final Esperada**

```
Supabase Database/
├── 📊 Tables/
│   ├── users
│   ├── policies
│   ├── controls
│   ├── domains
│   ├── assessments
│   ├── risks
│   ├── audits
│   ├── incidents
│   └── tickets
├── 🔐 RLS Policies/
│   ├── Tenant isolation
│   ├── Role-based access
│   └── User permissions
├── 📊 Indexes/
│   ├── Performance optimization
│   └── Query acceleration
└── 🔄 Triggers/
    ├── Auto timestamps
    └── Audit trails
```

### **9. Status de Implementação**

- ✅ **Schema SQL** - Criado e pronto
- ❌ **Aplicação Manual** - Pendente
- ❌ **Teste de Validação** - Pendente
- ❌ **Frontend Integration** - Pendente
- ❌ **MCP Integration** - Pendente

### **10. Próxima Ação**

**Execute o SQL no painel do Supabase e depois execute:**

```bash
npm run test:schema
```

**Para confirmar que tudo está funcionando!** 