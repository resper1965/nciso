# 📊 Instruções: Criação da Tabela control_effectiveness

## Epic 4 — Avaliações de Efetividade de Controles

### 🎯 Objetivo
Criar tabela relacional para armazenar avaliações periódicas sobre a efetividade prática de cada controle, garantindo segurança multi-tenant.

---

## 🚀 Métodos de Execução

### Opção 1: Via Supabase CLI (Recomendado)

```bash
# 1. Criar nova migração
supabase migration new create_control_effectiveness

# 2. Copiar conteúdo do arquivo supabase-migration-control-effectiveness.sql
# para o arquivo gerado em supabase/migrations/

# 3. Aplicar migração
supabase db push

# 4. Verificar se foi criada corretamente
supabase db reset  # em ambiente de desenvolvimento
```

### Opção 2: Via Supabase Studio

1. Acessar o **SQL Editor** no Supabase Studio
2. Copiar e executar o conteúdo do arquivo `supabase-migration-control-effectiveness.sql`
3. Verificar se a tabela foi criada na seção **Table Editor**

---

## 📋 Estrutura da Tabela

### Colunas Principais
- **`id`**: UUID PRIMARY KEY (identificador único)
- **`control_id`**: UUID (referência ao controle avaliado)
- **`score`**: INTEGER (0-100, pontuação da efetividade)
- **`comentario`**: TEXT (comentário sobre a avaliação)
- **`data_avaliacao`**: TIMESTAMPTZ (data da avaliação)
- **`tenant_id`**: UUID (isolamento multi-tenant)
- **`avaliador_id`**: UUID (quem fez a avaliação)

### Constraints e Validações
- ✅ **Score entre 0-100**: `CHECK (score BETWEEN 0 AND 100)`
- ✅ **Foreign Key**: `control_id` referencia `global_controls(id)`
- ✅ **Cascade Delete**: Avaliações são removidas quando controle é deletado
- ✅ **Campos obrigatórios**: `control_id`, `score`, `tenant_id`, `avaliador_id`

---

## 🔒 Segurança (RLS)

### Políticas Implementadas
- **SELECT**: Usuários veem apenas avaliações do seu tenant
- **INSERT**: Usuários criam avaliações apenas para seu tenant
- **UPDATE**: Usuários atualizam apenas suas avaliações
- **DELETE**: Usuários deletam apenas suas avaliações

### Validação JWT
```sql
tenant_id = (current_setting('request.jwt.claims', true)::json ->> 'tenant_id')::uuid
```

---

## 📈 Funções Úteis Criadas

### 1. `get_control_effectiveness_avg(control_uuid, tenant_uuid)`
Retorna estatísticas de efetividade para um controle específico:
- Média de score
- Total de avaliações
- Data da última avaliação

### 2. `get_effectiveness_stats(tenant_uuid)`
Retorna estatísticas gerais de efetividade:
- Total de avaliações
- Média geral de score
- Controles com avaliações
- Distribuição de scores (excellent, good, fair, poor)

### 3. `get_low_effectiveness_controls(tenant_uuid, min_score)`
Retorna controles com baixa efetividade:
- Controles com média < min_score
- Ordenados por score crescente
- Inclui nome do controle e estatísticas

---

## 🔍 Verificações Pós-Criação

### 1. Verificar se RLS está ativo
```sql
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'control_effectiveness';
```

### 2. Verificar políticas criadas
```sql
SELECT 
    policyname,
    cmd,
    permissive
FROM pg_policies 
WHERE tablename = 'control_effectiveness';
```

### 3. Verificar constraints
```sql
SELECT 
    conname,
    contype,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'control_effectiveness'::regclass;
```

### 4. Testar inserção
```sql
-- Inserir avaliação de teste (substituir UUIDs)
INSERT INTO control_effectiveness (
    control_id, 
    score, 
    comentario, 
    tenant_id, 
    avaliador_id
) VALUES (
    'uuid-do-controle',
    85,
    'Controle implementado corretamente',
    'uuid-do-tenant',
    'uuid-do-avaliador'
);
```

---

## 📊 Índices Criados

### Índices Simples
- `idx_control_effectiveness_control_id`
- `idx_control_effectiveness_tenant_id`
- `idx_control_effectiveness_avaliador_id`
- `idx_control_effectiveness_data_avaliacao`
- `idx_control_effectiveness_score`

### Índices Compostos
- `idx_control_effectiveness_tenant_control`
- `idx_control_effectiveness_tenant_score`

---

## 🛠️ Troubleshooting

### Problema: "Tabela já existe"
**Solução**: O script verifica automaticamente se a tabela existe antes de criar

### Problema: "Foreign key constraint failed"
**Solução**: Verificar se o `control_id` existe na tabela `global_controls`

### Problema: "RLS policy violation"
**Solução**: Verificar se o JWT contém `tenant_id` válido

### Problema: "Score out of range"
**Solução**: Garantir que score está entre 0 e 100

---

## 📝 Exemplos de Uso

### Inserir Avaliação
```sql
INSERT INTO control_effectiveness (
    control_id,
    score,
    comentario,
    tenant_id,
    avaliador_id
) VALUES (
    '123e4567-e89b-12d3-a456-426614174000',
    85,
    'Controle implementado corretamente, funcionando bem',
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440001'
);
```

### Consultar Estatísticas
```sql
-- Estatísticas gerais
SELECT * FROM get_effectiveness_stats('550e8400-e29b-41d4-a716-446655440000');

-- Estatísticas de um controle específico
SELECT * FROM get_control_effectiveness_avg(
    '123e4567-e89b-12d3-a456-426614174000',
    '550e8400-e29b-41d4-a716-446655440000'
);

-- Controles com baixa efetividade
SELECT * FROM get_low_effectiveness_controls(
    '550e8400-e29b-41d4-a716-446655440000',
    70
);
```

---

## ✅ Checklist de Validação

- [ ] Tabela `control_effectiveness` criada
- [ ] RLS ativo na tabela
- [ ] 4 políticas RLS criadas (SELECT, INSERT, UPDATE, DELETE)
- [ ] Constraints aplicados (score 0-100, foreign key)
- [ ] Índices criados para performance
- [ ] Trigger `updated_at` funcionando
- [ ] 3 funções úteis criadas
- [ ] Teste de inserção bem-sucedido
- [ ] Isolamento multi-tenant funcionando

---

## 🔗 Próximos Passos

1. **Criar API REST** para gerenciar avaliações
2. **Implementar componentes UI** para avaliação de controles
3. **Adicionar comandos MCP** para consultas de efetividade
4. **Criar relatórios visuais** de efetividade
5. **Integrar com dashboard** de controles

---

## 📞 Suporte

Se encontrar problemas:
1. Verificar logs do Supabase
2. Consultar documentação de RLS
3. Testar com dados de exemplo
4. Verificar permissões de usuário 