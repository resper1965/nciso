# Epic 1: n.Platform MVP - Autenticação e Permissões

## Epic Goal

Implementar a base da plataforma n.ciso com autenticação multi-tenant via Supabase Auth, sistema de permissões RBAC e isolamento por tenant, estabelecendo a fundação para todos os outros módulos.

## Epic Description

**Existing System Context:**
- Projeto em estágio inicial com apenas dependências básicas
- Tecnologia: Node.js/Express para backend, React/Next.js para frontend
- Integração: Supabase para autenticação e banco de dados PostgreSQL

**Enhancement Details:**
- Implementar sistema de autenticação multi-tenant
- Criar sistema de permissões RBAC (Role-Based Access Control)
- Estabelecer isolamento por tenant em todas as operações
- Configurar estrutura base de APIs RESTful
- Implementar middleware de autenticação e autorização

## Stories

### Story 1: Configuração Inicial do Projeto
**Como** desenvolvedor, **quero** configurar a estrutura base do projeto **para** ter uma fundação sólida para desenvolvimento.

**Critérios de Aceitação:**
- [ ] Estrutura de pastas organizada (src/, api/, frontend/)
- [ ] Configuração do Supabase (autenticação e banco)
- [ ] Setup do ambiente de desenvolvimento (Docker, scripts)
- [ ] Configuração de linting e formatação
- [ ] Estrutura de testes básica

### Story 2: Sistema de Autenticação Multi-Tenant
**Como** usuário, **quero** fazer login na plataforma **para** acessar minha organização específica.

**Critérios de Aceitação:**
- [ ] Login com email/senha via Supabase Auth
- [ ] Registro de novos usuários
- [ ] Recuperação de senha
- [ ] MFA obrigatório para administradores
- [ ] Sessões JWT com refresh tokens
- [ ] Logout seguro

### Story 3: Sistema de Permissões RBAC
**Como** administrador, **quero** gerenciar permissões de usuários **para** controlar acesso aos módulos.

**Critérios de Aceitação:**
- [ ] CRUD de roles (Admin, Manager, User, Viewer)
- [ ] Permissões granulares por módulo e ação
- [ ] Middleware de autorização em todas as APIs
- [ ] Interface para gerenciar permissões
- [ ] Logs de auditoria para mudanças de permissão

### Story 4: Isolamento Multi-Tenant
**Como** usuário, **quero** acessar apenas dados da minha organização **para** manter isolamento de dados.

**Critérios de Aceitação:**
- [ ] Middleware de tenant_id em todas as requisições
- [ ] Filtros automáticos por tenant em todas as queries
- [ ] Validação de acesso cross-tenant
- [ ] Interface para gerenciar tenants
- [ ] Logs de tentativas de acesso não autorizado

## Compatibilidade Requirements

- [ ] APIs seguem padrão RESTful
- [ ] Banco de dados usa schema multi-tenant
- [ ] Frontend usa componentes reutilizáveis
- [ ] Performance otimizada para 1000+ usuários

## Risk Mitigation

**Primary Risk:** Complexidade do sistema multi-tenant
**Mitigation:** Implementação incremental com testes rigorosos
**Rollback Plan:** Backup do banco antes de cada deploy

## Definition of Done

- [ ] Todas as stories completadas com critérios atendidos
- [ ] Testes unitários e de integração passando
- [ ] Documentação de APIs atualizada
- [ ] Performance testada com carga
- [ ] Segurança validada (autenticação, autorização, isolamento)
- [ ] Deploy em ambiente de staging funcionando

## Estimativa

**Story Points:** 13 (3 + 5 + 3 + 2)
**Duração Estimada:** 2-3 sprints
**Complexidade:** Alta (fundação do sistema) 