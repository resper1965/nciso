# 🔐 Segurança

## Autenticação
- **Provedor:** Supabase Auth
- **Métodos:** Email/Senha, OAuth (Google, GitHub)
- **MFA:** Obrigatório para admin
- **Sessões:** JWT com refresh tokens

## Autorização
- **Modelo:** RBAC (Role-Based Access Control)
- **Granularidade:** Permissões por módulo e ação
- **Isolamento:** Multi-tenant com tenant_id

## Criptografia
- **Em trânsito:** TLS 1.3
- **Em repouso:** AES-256
- **Secrets:** Infusion para gestão segura
