# 🧩 Componentes Principais

## 1. Frontend
- **Tecnologia:** React/Next.js
- **Características:** 
  - Interface responsiva
  - PWA capabilities
  - Componentes reutilizáveis
  - Design system consistente

## 2. API Gateway
- **Tecnologia:** Kong ou NGINX
- **Funcionalidades:**
  - Roteamento de requisições
  - Rate limiting
  - Load balancing
  - SSL termination
  - Logging centralizado

## 3. Microserviços

### n.Platform
- **Responsabilidade:** Autenticação, autorização, multi-tenancy
- **Tecnologia:** Node.js/Express ou Python/FastAPI
- **Integração:** Supabase Auth
- **APIs:**
  - `/platform/api/v1/users`
  - `/platform/api/v1/roles`
  - `/platform/api/v1/tenants`

### n.ISMS
- **Responsabilidade:** Gestão do Sistema de Gestão de Segurança da Informação
- **Tecnologia:** Node.js/Express
- **APIs:**
  - `/isms/api/v1/policies`
  - `/isms/api/v1/controls`
  - `/isms/api/v1/compliance`
  - `/isms/api/v1/domains`
  - `/isms/api/v1/assessments`

### n.Controls
- **Responsabilidade:** Catálogo de controles de segurança
- **Tecnologia:** Node.js/Express
- **APIs:**
  - `/controls/api/v1/frameworks`
  - `/controls/api/v1/domains`
  - `/controls/api/v1/controls`

### n.Audit
- **Responsabilidade:** Gestão de auditorias
- **Tecnologia:** Node.js/Express
- **APIs:**
  - `/audit/api/v1/audits`
  - `/audit/api/v1/findings`
  - `/audit/api/v1/evidence`

### n.Risk
- **Responsabilidade:** Gestão de riscos
- **Tecnologia:** Node.js/Express
- **APIs:**
  - `/risk/api/v1/risks`
  - `/risk/api/v1/assessments`
  - `/risk/api/v1/kris`

### n.Privacy
- **Responsabilidade:** Conformidade LGPD/GDPR
- **Tecnologia:** Node.js/Express
- **APIs:**
  - `/privacy/api/v1/consents`
  - `/privacy/api/v1/data-subjects`
  - `/privacy/api/v1/processing-activities`

### n.SecDevOps
- **Responsabilidade:** Testes de segurança
- **Tecnologia:** Python/FastAPI
- **APIs:**
  - `/secdevops/api/v1/projects`
  - `/secdevops/api/v1/scans`
  - `/secdevops/api/v1/reports`

### n.Assessments
- **Responsabilidade:** Avaliações estruturadas
- **Tecnologia:** Node.js/Express
- **APIs:**
  - `/assessments/api/v1/templates`
  - `/assessments/api/v1/responses`
  - `/assessments/api/v1/reports`

### n.CIRT
- **Responsabilidade:** Resposta a incidentes
- **Tecnologia:** Node.js/Express
- **APIs:**
  - `/cirt/api/v1/incidents`
  - `/cirt/api/v1/tasks`
  - `/cirt/api/v1/playbooks`

### n.Tickets
- **Responsabilidade:** Sistema de suporte
- **Tecnologia:** Node.js/Express
- **APIs:**
  - `/tickets/api/v1/tickets`
  - `/tickets/api/v1/categories`
  - `/tickets/api/v1/slas`
