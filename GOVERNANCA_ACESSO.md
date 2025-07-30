# 🛡️ Epic: Governança de Acesso e Convites

## 🎯 Objetivo

Implementar um sistema seguro de controle de acesso com convites, isolamento multi-tenant, validação de domínio de e-mail, e granularidade de permissões no módulo de plataforma (n.Platform).

## ✅ Stories Implementadas

### **Story 1: Tabela de Organizações (tenants)**

✅ **Status**: Implementado

**Campos da tabela `tenants`:**
- `id` (UUID) - Chave primária
- `name` (VARCHAR) - Nome da organização
- `email_domain` (VARCHAR) - Domínio de e-mail autorizado
- `contact_email` (VARCHAR) - E-mail de contato
- `logo_url` (TEXT) - URL do logo (opcional)
- `status` (VARCHAR) - Status da organização
- `settings` (JSONB) - Configurações da organização
- `created_at`, `updated_at` - Timestamps

**Índices criados:**
- `idx_tenants_email_domain` - Para busca por domínio
- `idx_tenants_status` - Para filtros por status
- `idx_tenants_created_at` - Para ordenação

### **Story 2: Tabela de Convites**

✅ **Status**: Implementado

**Campos da tabela `invites`:**
- `id` (UUID) - Chave primária
- `email` (VARCHAR) - E-mail convidado
- `role` (VARCHAR) - Role a ser atribuída
- `tenant_id` (UUID) - Chave estrangeira para `tenants`
- `token` (VARCHAR) - String única para validação
- `expires_at` (TIMESTAMP) - Data de expiração
- `accepted` (BOOLEAN) - Status de aceitação
- `created_by` (UUID) - User ID do remetente
- `created_at`, `updated_at` - Timestamps

**Índices criados:**
- `idx_invites_email` - Para busca por e-mail
- `idx_invites_tenant_id` - Para filtros por tenant
- `idx_invites_token` - Para validação de token
- `idx_invites_expires_at` - Para verificação de expiração
- `idx_invites_accepted` - Para filtros por status
- `idx_invites_created_by` - Para auditoria

### **Story 3: API - Criar Convite**

✅ **Status**: Implementado

**Endpoint:** `POST /api/v1/platform/invite`

**Regras implementadas:**
- ✅ Somente `platform_admin` ou `org_admin` podem enviar convites
- ✅ Validação de domínio do e-mail
- ✅ Verificação de convites pendentes
- ✅ Geração de token único
- ✅ Expiração automática (7 dias)

**Payload:**
```json
{
  "email": "usuario@empresa.com",
  "role": "user"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Convite criado com sucesso",
  "data": {
    "id": "uuid",
    "email": "usuario@empresa.com",
    "role": "user",
    "expires_at": "2024-02-06T10:00:00Z",
    "invite_url": "http://localhost:3000/invite?token=abc123"
  }
}
```

## 🔐 Segurança Implementada

### **RLS (Row Level Security)**
- ✅ Políticas para `tenants`
- ✅ Políticas para `invites`
- ✅ Isolamento multi-tenant
- ✅ Controle de acesso por role

### **Validações**
- ✅ Domínio de e-mail autorizado
- ✅ Roles válidos (`user`, `org_admin`, `auditor`)
- ✅ Expiração de convites
- ✅ Duplicação de convites pendentes

### **Middleware de Segurança**
- ✅ `validateTenantAccess` - Validação de tenant
- ✅ `validateRole` - Controle de permissões
- ✅ `validateResourceOwner` - Ownership de recursos

## 📊 Endpoints Implementados

### **1. Criar Convite**
```
POST /api/v1/platform/invite
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "usuario@empresa.com",
  "role": "user"
}
```

### **2. Listar Convites**
```
GET /api/v1/platform/invites?page=1&limit=10&status=pending
Authorization: Bearer <token>
```

### **3. Aceitar Convite**
```
POST /api/v1/platform/invite/accept
Content-Type: application/json

{
  "token": "abc123",
  "password": "senha123",
  "name": "Nome do Usuário"
}
```

### **4. Cancelar Convite**
```
DELETE /api/v1/platform/invite/:id
Authorization: Bearer <token>
```

## 🧪 Como Testar

### **1. Aplicar Schema**
```bash
# Copiar conteúdo do arquivo scripts/tenants-schema.sql
# Executar no SQL Editor do Supabase
```

### **2. Testar API**
```bash
npm run test:invites
```

### **3. Testar Manualmente**
```bash
# Criar convite
curl -X POST http://localhost:3000/api/v1/platform/invite \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@nciso.dev","role":"user"}'

# Listar convites
curl -X GET http://localhost:3000/api/v1/platform/invites \
  -H "Authorization: Bearer <token>"
```

## 🔧 Configuração

### **Variáveis de Ambiente**
```env
SUPABASE_URL=https://pszfqqmmljekibmcgmig.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_9nszt9IAhYd94neHZQHP6w_0viqK_FW
FRONTEND_URL=http://localhost:3000
```

### **Scripts Disponíveis**
```bash
npm run test:invites          # Testar API de convites
npm run diagnose:supabase     # Diagnosticar Supabase
npm run update:credentials    # Atualizar credenciais
```

## 📋 Próximos Passos

### **1. Frontend**
- [ ] Página de criação de convites
- [ ] Listagem de convites com filtros
- [ ] Página de aceitação de convite
- [ ] Integração com e-mail

### **2. E-mail**
- [ ] Template de convite
- [ ] Configuração de SMTP
- [ ] Envio automático de convites

### **3. Auditoria**
- [ ] Log de criação de convites
- [ ] Log de aceitação
- [ ] Relatórios de convites

### **4. Funcionalidades Avançadas**
- [ ] Convites em lote
- [ ] Templates de convite
- [ ] Expiração customizada
- [ ] Notificações push

## 🎯 Status Atual

- ✅ **Schema**: Implementado
- ✅ **API**: Implementada
- ✅ **Segurança**: Implementada
- ✅ **Testes**: Implementados
- ⏳ **Frontend**: Pendente
- ⏳ **E-mail**: Pendente

## 📞 Suporte

Para dúvidas ou problemas:
- **Issues**: GitHub
- **Documentação**: Este arquivo
- **API Docs**: Swagger/OpenAPI (pendente) 