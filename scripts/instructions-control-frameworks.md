# Instruções para Criar Tabela control_frameworks

## Epic 2 — Mapeamento de Controles x Frameworks

### Objetivo
Criar tabela relacional `control_frameworks` com suporte a multi-tenant para permitir associação entre controles cadastrados e frameworks normativos.

## 📋 Pré-requisitos

Antes de executar esta migração, certifique-se de que:

1. ✅ A tabela `global_controls` já existe
2. ✅ A tabela `frameworks` já existe
3. ✅ RLS está configurado nas tabelas base
4. ✅ JWT com `tenant_id` está funcionando

## 🚀 Execução via Supabase CLI

### Opção 1: Criar Nova Migration

```bash
# 1. Criar nova migration
supabase migration new create_control_frameworks

# 2. Editar o arquivo gerado em supabase/migrations/
# Copiar o conteúdo do arquivo: scripts/supabase-migration-control-frameworks.sql

# 3. Aplicar a migration
supabase db push
```

### Opção 2: Executar SQL Diretamente

```bash
# 1. Conectar ao Supabase
supabase db reset  # Para ambiente de desenvolvimento
# OU
supabase db push   # Para aplicar migrations pendentes

# 2. Executar o script SQL
psql -h db.supabase.co -U postgres -d postgres -f scripts/create-control-frameworks-table.sql
```

## 🎯 Estrutura da Tabela

### Colunas Principais
- `id`: UUID PRIMARY KEY (auto-gerado)
- `control_id`: UUID → `global_controls(id)` (FOREIGN KEY)
- `framework_id`: UUID → `frameworks(id)` (FOREIGN KEY)
- `tenant_id`: UUID NOT NULL (para isolamento)
- `created_at`: TIMESTAMPTZ DEFAULT now()
- `updated_at`: TIMESTAMPTZ DEFAULT now()

### Índices Criados
- `idx_control_frameworks_control_id`: Performance em consultas por controle
- `idx_control_frameworks_framework_id`: Performance em consultas por framework
- `idx_control_frameworks_tenant_id`: Performance em filtros por tenant
- `idx_control_frameworks_composite`: Performance em joins
- `idx_control_frameworks_unique`: Constraint único para evitar duplicatas

## 🔒 Segurança (RLS)

### Políticas Implementadas
- **SELECT**: Usuário só vê associações do seu tenant
- **INSERT**: Usuário só pode inserir associações do seu tenant
- **UPDATE**: Usuário só pode atualizar associações do seu tenant
- **DELETE**: Usuário só pode deletar associações do seu tenant

### Isolamento por Tenant
```sql
tenant_id = (current_setting('request.jwt.claims', true)::json ->> 'tenant_id')::uuid
```

## 🔧 Funções Úteis Criadas

### 1. get_controls_by_framework(framework_uuid)
Retorna todos os controles associados a um framework específico.

### 2. get_frameworks_by_control(control_uuid)
Retorna todos os frameworks associados a um controle específico.

### 3. get_control_framework_stats()
Retorna estatísticas de mapeamento:
- Total de controles
- Total de frameworks
- Total de mapeamentos
- Controles com frameworks
- Frameworks com controles

## ✅ Validações Implementadas

### Integridade Referencial
- ✅ FOREIGN KEY `control_id` → `global_controls(id)`
- ✅ FOREIGN KEY `framework_id` → `frameworks(id)`
- ✅ ON DELETE CASCADE (remove associação se controle/framework for deletado)

### Isolamento Multi-tenant
- ✅ RLS ativo na tabela
- ✅ Políticas aplicadas para SELECT, INSERT, UPDATE, DELETE
- ✅ Verificação automática de `tenant_id` via JWT claims

### Performance
- ✅ Índices criados para consultas frequentes
- ✅ Constraint único para evitar duplicatas
- ✅ Trigger para `updated_at` automático

## 🧪 Testes Recomendados

### 1. Teste de Isolamento
```sql
-- Conectar como tenant A
-- Inserir associação
INSERT INTO control_frameworks (control_id, framework_id, tenant_id) 
VALUES ('control-uuid', 'framework-uuid', 'tenant-a-uuid');

-- Conectar como tenant B
-- Tentar ver associação do tenant A (deve falhar)
SELECT * FROM control_frameworks WHERE tenant_id = 'tenant-a-uuid';
```

### 2. Teste de Integridade
```sql
-- Tentar inserir associação com control_id inexistente (deve falhar)
INSERT INTO control_frameworks (control_id, framework_id, tenant_id) 
VALUES ('inexistente-uuid', 'framework-uuid', 'tenant-uuid');
```

### 3. Teste de Duplicatas
```sql
-- Inserir primeira associação
INSERT INTO control_frameworks (control_id, framework_id, tenant_id) 
VALUES ('control-uuid', 'framework-uuid', 'tenant-uuid');

-- Tentar inserir mesma associação (deve falhar)
INSERT INTO control_frameworks (control_id, framework_id, tenant_id) 
VALUES ('control-uuid', 'framework-uuid', 'tenant-uuid');
```

## 🔍 Verificações Pós-Migração

### 1. Verificar se a tabela foi criada
```sql
SELECT table_name, rowsecurity 
FROM pg_tables 
WHERE table_name = 'control_frameworks';
```

### 2. Verificar se RLS está ativo
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'control_frameworks';
```

### 3. Verificar se as políticas foram criadas
```sql
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'control_frameworks';
```

### 4. Verificar se as funções foram criadas
```sql
SELECT proname 
FROM pg_proc 
WHERE proname IN ('get_controls_by_framework', 'get_frameworks_by_control', 'get_control_framework_stats');
```

## 🚨 Troubleshooting

### Erro: "relation 'global_controls' does not exist"
- **Solução**: Criar primeiro a tabela `global_controls`

### Erro: "relation 'frameworks' does not exist"
- **Solução**: Criar primeiro a tabela `frameworks`

### Erro: "policy already exists"
- **Solução**: Remover políticas existentes antes de recriar

### Erro: "function already exists"
- **Solução**: As funções são recriadas automaticamente com `CREATE OR REPLACE`

## 📊 Próximos Passos

Após a criação da tabela:

1. **Frontend**: Criar interface para associar controles a frameworks
2. **API**: Implementar endpoints para CRUD de associações
3. **MCP**: Adicionar comandos para listar controles por framework
4. **Relatórios**: Criar relatórios de cobertura por framework

## 📞 Suporte

Em caso de problemas:
1. Verificar logs do Supabase
2. Executar verificações de segurança
3. Testar isolamento multi-tenant
4. Validar integridade referencial 