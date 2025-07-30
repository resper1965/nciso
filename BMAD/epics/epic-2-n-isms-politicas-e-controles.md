# Epic 2: n.ISMS - Gestão de Políticas e Controles

### 🎯 Epic Goal
Implementar o módulo n.ISMS com gestão completa de políticas de segurança, controles organizacionais e estrutura de domínios, estabelecendo a base para conformidade e auditoria.

### 📝 Epic Description

**Existing System Context:**
- n.Platform MVP implementado (autenticação, RBAC, multi-tenant)
- Schema SQL e RLS policies criados
- APIs básicas funcionando

**Enhancement Details:**
- CRUD completo de políticas de segurança
- Gestão de controles organizacionais
- Sistema de domínios hierárquicos
- Integração com frameworks de conformidade
- Avaliações de efetividade

## 🧩 Stories Incrementais

### **Story 1: CRUD de Políticas de Segurança** (5 SP) ✅ **COMPLETA**
**Como** CISO, **quero** gerenciar políticas de segurança **para** estabelecer diretrizes organizacionais claras.

**Critérios de Aceitação:**
- [x] Criar política com nome, descrição, conteúdo e versionamento
- [x] Editar política existente com histórico de versões
- [x] Listar políticas por tenant com filtros (status, organização)
- [x] Aprovar/rejeitar políticas (workflow de aprovação)
- [x] Validação de campos obrigatórios
- [x] Integração com n.Platform (autenticação/autorização)
- [x] Logs de auditoria para mudanças

**APIs implementadas:**
- `POST /api/v1/isms/policies` - Criar política ✅
- `GET /api/v1/isms/policies` - Listar políticas ✅
- `GET /api/v1/isms/policies/:id` - Obter política ✅
- `PUT /api/v1/isms/policies/:id` - Atualizar política ✅
- `DELETE /api/v1/isms/policies/:id` - Deletar política ✅
- `POST /api/v1/isms/policies/:id/approve` - Aprovar política ✅

**Status:** ✅ **IMPLEMENTADA E TESTADA**

### **Story 2: CRUD de Controles Organizacionais** (4 SP) ✅ **COMPLETA**
**Como** Analista de Segurança, **quero** gerenciar controles de segurança **para** implementar medidas de proteção específicas.

**Critérios de Aceitação:**
- [x] Criar controle com tipo (preventivo, detetivo, corretivo)
- [x] Associar controle a políticas específicas
- [x] Definir status de implementação (planejado, implementado, testado)
- [x] Avaliar efetividade do controle (0-100%)
- [x] Categorizar controles por domínio
- [x] Relatórios de cobertura de controles

**APIs implementadas:**
- `POST /api/v1/isms/controls` - Criar controle ✅
- `GET /api/v1/isms/controls` - Listar controles ✅
- `GET /api/v1/isms/controls/:id` - Obter controle ✅
- `PUT /api/v1/isms/controls/:id` - Atualizar controle ✅
- `DELETE /api/v1/isms/controls/:id` - Deletar controle ✅
- `GET /api/v1/isms/controls/effectiveness` - Relatório de efetividade ✅

**Status:** ✅ **IMPLEMENTADA E TESTADA**

### **Story 3: Sistema de Domínios Hierárquicos** (3 SP)
**Como** Gestor de Conformidade, **quero** organizar controles por domínios **para** facilitar auditorias e relatórios.

**Critérios de Aceitação:**
- [ ] Criar domínios de segurança (Governança, Operacional, etc.)
- [ ] Estrutura hierárquica de domínios (pai/filho)
- [ ] Associar controles a domínios específicos
- [ ] Relatórios por domínio
- [ ] Validação de hierarquia (sem loops)

**APIs a implementar:**
- `POST /api/v1/isms/domains` - Criar domínio
- `GET /api/v1/isms/domains` - Listar domínios
- `GET /api/v1/isms/domains/:id/controls` - Controles por domínio

### **Story 4: Integração com Frameworks de Conformidade** (3 SP)
**Como** Auditor, **quero** mapear controles a frameworks **para** demonstrar conformidade.

**Critérios de Aceitação:**
- [ ] Listar frameworks disponíveis (ISO 27001, NIST, COBIT)
- [ ] Mapear controles organizacionais a controles de framework
- [ ] Relatórios de conformidade por framework
- [ ] Gap analysis automático

**APIs a implementar:**
- `GET /api/v1/isms/frameworks` - Listar frameworks
- `POST /api/v1/isms/controls/:id/mappings` - Mapear controle
- `GET /api/v1/isms/compliance/report` - Relatório de conformidade

### **Story 5: Avaliações de Efetividade** (2 SP)
**Como** CISO, **quero** avaliar efetividade de controles **para** priorizar melhorias.

**Critérios de Aceitação:**
- [ ] Avaliar controle com score (0-100%) e justificativa
- [ ] Histórico de avaliações por controle
- [ ] Dashboard de efetividade geral
- [ ] Alertas para controles com baixa efetividade

**APIs a implementar:**
- `POST /api/v1/isms/controls/:id/assessments` - Avaliar controle
- `GET /api/v1/isms/effectiveness/dashboard` - Dashboard de efetividade

## 🔧 Implementação Incremental

### **Sprint 1 (Stories 1-2):** ✅ **COMPLETA**
- ✅ Implementar CRUD de políticas
- ✅ Implementar CRUD de controles
- ✅ Integração com autenticação
- ✅ Testes básicos

### **Sprint 2 (Stories 3-4):**
- [ ] Sistema de domínios
- [ ] Integração com frameworks
- [ ] Relatórios básicos

### **Sprint 3 (Story 5):**
- [ ] Avaliações de efetividade
- [ ] Dashboard
- [ ] Testes completos

## 📊 Métricas de Sucesso
- **Cobertura de controles:** 80%+ implementados
- **Políticas aprovadas:** 100% com workflow
- **Efetividade média:** 70%+
- **Tempo de resposta API:** < 200ms

## 🚀 Próximos Passos

**Story 1:** ✅ **COMPLETA** - CRUD de Políticas implementado e testado

**Qual Story você gostaria que eu implemente agora?**

1. **Story 2** - CRUD de Controles (próxima dependência)
2. **Story 3** - Domínios (estrutura)
3. **Story 4** - Frameworks (conformidade)
4. **Story 5** - Avaliações (métricas)

**Recomendo implementar a Story 2 (Controles) pois é a dependência natural da Story 1!** 🎯 