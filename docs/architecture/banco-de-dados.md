# 🗄️ Banco de Dados

## Supabase (PostgreSQL)
- **Schema:** Multi-tenant com isolamento por tenant_id
- **Tabelas principais:**
  - `tenants` - Organizações
  - `users` - Usuários do sistema
  - `roles` - Perfis de acesso
  - `permissions` - Permissões granulares
  - `policies` - Políticas de segurança
  - `controls` - Controles de segurança
  - `risks` - Riscos identificados
  - `audits` - Auditorias
  - `incidents` - Incidentes de segurança

## Redis
- **Uso:** Cache de sessões, dados temporários
- **Tópicos:**
  - Rate limiting
  - Cache de consultas
  - Filas de processamento
