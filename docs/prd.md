# 📘 PRD - Documento de Requisitos do Produto

### Produto: `n.ciso` - Plataforma de Gestão de Segurança da Informação

### Versão: 1.0.0

### Responsável: Equipe BMAD

---

### 🎯 Objetivo Geral

Oferecer uma plataforma unificada para gestão de segurança da informação, com foco em conformidade, riscos, auditoria, privacidade e operações seguras.

A arquitetura é baseada em microserviços, multi-tenant, com integração com Supabase (autenticação e banco de dados), Portainer para deploy, e gestão segura de secrets via Infusion.

---

## 🧱 Módulos Principais

### 1. `n.ISMS` - Escopo e Estrutura SGSI

**Descrição:** Define os escopos, organizações, ativos e documentos do SGSI.
**Recursos:**
* Políticas
* Controles
* Compliance
* Domínios
* Avaliações

**APIs:**
* `/isms/api/v1/policies`
* `/isms/api/v1/controls`
* `/isms/api/v1/compliance`
* `/isms/api/v1/domains`
* `/isms/api/v1/assessments`

### 2. `n.Controls` - Controles e Frameworks

**Descrição:** Catálogo centralizado de controles de segurança e conformidade.
**Recursos:**
* Domínios
* Controles por framework
* Avaliação de efetividade

### 3. `n.Audit` - Auditorias

**Descrição:** Permite o planejamento, execução e registro de auditorias.
**Recursos:**
* Controles auditados
* Achados
* Evidências
* Ações corretivas

### 4. `n.Risk` - Gestão de Riscos

**Descrição:** Geração e tratamento de riscos corporativos e de fornecedores.
**Recursos:**
* Classificação de riscos
* Questionários
* Avaliação de impacto
* Indicadores de risco (KRIs)

### 5. `n.Privacy` - LGPD e GDPR

**Descrição:** Governança de dados pessoais e conformidade legal.
**Recursos:**
* Consentimentos
* Processamento de dados
* Titulares e solicitações
* Transferências internacionais

---

## 🔍 Monitoramento e Resposta

### 6. `n.SecDevOps` - Testes de Segurança

**Descrição:** Execução de testes SAST, DAST, IAST e integração com pipeline CI/CD.
**Recursos:**
* Projetos e execuções
* Agendamentos
* Integração com ferramentas de segurança

### 7. `n.Assessments` - Avaliações Estruturadas

**Descrição:** Questionários inteligentes e automação de coleta de dados.
**Recursos:**
* Templates
* Respostas por usuário
* Relatórios automáticos
* Suporte à IA

### 8. `n.CIRT` - Incidentes

**Descrição:** Gerencia resposta a incidentes, evidências e execução de playbooks.
**Recursos:**
* Registro de incidente
* Atribuição de tarefas
* Resolução e encerramento

---

## ⚙️ Internos e Configuração

### 9. `n.Platform` - Plataforma e Permissões

**Descrição:** Garante autenticação via Supabase Auth, permissões via RBAC e isolamento multi-tenant.
**Recursos:**
* Usuários
* Perfis e permissões
* Tenants

### 10. `n.Tickets` - Suporte

**Descrição:** Canal de suporte interno para todas as funcionalidades.
**Recursos:**
* Tickets por módulo
* Categorizado
* Notificações e SLAs

---

## 🎯 Critérios de Aceitação

### Funcionalidades Core
- [ ] Autenticação multi-tenant via Supabase
- [ ] RBAC implementado em todos os módulos
- [ ] APIs RESTful documentadas
- [ ] Interface responsiva e acessível
- [ ] Logs de auditoria em todas as operações

### Performance
- [ ] Tempo de resposta < 2s para operações CRUD
- [ ] Suporte a 1000+ usuários simultâneos
- [ ] Disponibilidade 99.9%

### Segurança
- [ ] Criptografia em trânsito (TLS 1.3)
- [ ] Criptografia em repouso
- [ ] Validação de entrada em todas as APIs
- [ ] Rate limiting implementado

---

## 🚀 Roadmap

### Fase 1 (MVP)
- n.Platform (autenticação e permissões)
- n.ISMS (políticas e controles básicos)
- n.Controls (catálogo de controles)

### Fase 2
- n.Audit (auditorias)
- n.Risk (gestão de riscos)
- n.Privacy (LGPD/GDPR)

### Fase 3
- n.SecDevOps (testes de segurança)
- n.Assessments (avaliações)
- n.CIRT (incidentes)

### Fase 4
- n.Tickets (suporte)
- Integrações avançadas
- Analytics e relatórios 