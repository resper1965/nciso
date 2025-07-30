# 🧱 **MCP - Model Content Protocol**

## 📋 **Visão Geral**

O **Model Content Protocol (MCP)** é uma estrutura padronizada para modelos de conteúdo no projeto `n.CISO`, garantindo consistência, reutilização e automação em todos os módulos.

### 🎯 **Objetivos**
- ✅ **Padronização** de modelos (Policy, Control, Domain)
- ✅ **Reutilização** em múltiplos módulos
- ✅ **Consistência** de validação, UI, i18n e permissões
- ✅ **Automação** de forms, tabelas e relatórios
- ✅ **Base** para novos módulos (Risk, Privacy, Audit, etc.)

---

## 📁 **Estrutura MCP**

```
src/models/
├── base.ts          # Tipos, schemas e utilitários base
├── policy.ts        # Modelo Policy completo
├── control.ts       # Modelo Control completo
├── domain.ts        # Modelo Domain completo
└── index.ts         # Registry e Factory MCP
```

---

## 🧩 **Componentes MCP**

### **1. TypeScript Types**
```typescript
// ✅ Tipos fortemente tipados
export type Policy = BaseEntity & {
  name: string
  description: string
  content: string
  version: string
  status: ApprovalStatus
  // ... outros campos
}

export type Control = BaseEntity & {
  name: string
  control_type: ControlType
  effectiveness_score: number
  // ... outros campos
}

export type Domain = BaseEntity & {
  name: string
  level: DomainLevel
  path: string
  // ... outros campos
}
```

### **2. Zod Schemas**
```typescript
// ✅ Validação com i18n dinâmico
export const createPolicySchema = (t: any) => z.object({
  name: z.string().min(2, t('policy.validation.name_min')),
  description: z.string().min(10, t('policy.validation.description_min')),
  content: z.string().min(50, t('policy.validation.content_min')),
  // ... outros campos
})
```

### **3. i18n Keys**
```typescript
// ✅ Traduções estruturadas
export const policyI18nKeys = {
  title: 'policy.title',
  subtitle: 'policy.subtitle',
  validation: {
    name_min: 'policy.validation.name_min',
    description_min: 'policy.validation.description_min'
  },
  actions: {
    create: 'policy.actions.create',
    edit: 'policy.actions.edit'
  }
}
```

### **4. Metadata para UI**
```typescript
// ✅ Metadata para automação de UI
export const policyMeta: ModelMeta = {
  displayName: 'Política de Segurança',
  icon: Shield,
  color: 'text-nciso-cyan',
  permissions: ['create', 'read', 'update', 'delete', 'approve'],
  fields: {
    name: {
      label: 'forms.name',
      type: 'text',
      required: true,
      validation: { min: 2 }
    }
    // ... outros campos
  },
  actions: {
    create: {
      label: 'policy.actions.create',
      icon: FileText,
      permission: 'create'
    }
    // ... outras ações
  }
}
```

### **5. Permissões**
```typescript
// ✅ Regras de permissão por modelo
export const policyPermissions = {
  canCreate: (user: User, tenantId: string): boolean => {
    return canCreate(user, tenantId)
  },
  canUpdate: (user: User, policy: Policy): boolean => {
    if (policy.status !== 'draft') return false
    return canUpdate(user, policy)
  }
  // ... outras permissões
}
```

---

## 🚀 **Uso do MCP**

### **1. Importação**
```typescript
import { 
  Policy, 
  policyMeta, 
  policyPermissions, 
  createPolicySchema,
  policyI18nKeys 
} from '@/models/policy'

// Ou via registry
import { MCPFactory, getMCPModel } from '@/models'
```

### **2. Criação de Modelo**
```typescript
// ✅ Via Factory
const policy = MCPFactory.createModel('policy', {
  name: 'Nova Política',
  description: 'Descrição da política',
  content: 'Conteúdo da política...'
})

// ✅ Validação
const validatedData = MCPFactory.validateModel('policy', data, t)
```

### **3. Verificação de Permissões**
```typescript
// ✅ Verificar permissões
const canEdit = policyPermissions.canUpdate(user, policy)

// ✅ Via registry
const canEdit = checkMCPPermission('policy', 'update', user, policy)
```

### **4. Uso em Componentes**
```typescript
// ✅ Componente genérico usando MCP
const PolicyForm = () => {
  const { t } = useTranslation("common")
  const meta = policyMeta
  const schema = createPolicySchema(t)
  
  return (
    <Form schema={schema}>
      {Object.entries(meta.fields).map(([key, field]) => (
        <FormField key={key} name={key}>
          <FormLabel>{t(field.label)}</FormLabel>
          {/* Renderizar campo baseado no tipo */}
        </FormField>
      ))}
    </Form>
  )
}
```

---

## 🎨 **Benefícios do MCP**

### **1. Consistência**
- ✅ **Mesma estrutura** para todos os modelos
- ✅ **Validação padronizada** com Zod
- ✅ **i18n consistente** em 3 idiomas
- ✅ **Permissões uniformes** por modelo

### **2. Reutilização**
- ✅ **Componentes genéricos** para CRUD
- ✅ **Forms automáticos** baseados em metadata
- ✅ **Tabelas dinâmicas** com configuração
- ✅ **Relatórios padronizados**

### **3. Manutenibilidade**
- ✅ **Código limpo** e organizado
- ✅ **Fácil extensão** para novos modelos
- ✅ **Testes unitários** simplificados
- ✅ **Documentação** automática

### **4. Automação**
- ✅ **Geração de forms** a partir de metadata
- ✅ **Validação automática** com schemas
- ✅ **Traduções estruturadas** e consistentes
- ✅ **Permissões declarativas**

---

## 📊 **Modelos Implementados**

### **1. Policy (Política)**
```typescript
// ✅ Campos principais
- name: string
- description: string
- content: string
- version: string
- status: ApprovalStatus
- category: string
- risk_level: 'low' | 'medium' | 'high' | 'critical'

// ✅ Ações específicas
- approve/reject (apenas para status 'pending')
- version control
- compliance frameworks
```

### **2. Control (Controle)**
```typescript
// ✅ Campos principais
- name: string
- control_type: ControlType
- implementation_status: ImplementationStatus
- effectiveness_score: number
- domain_id: string
- policy_ids: string[]

// ✅ Ações específicas
- assess (avaliação de efetividade)
- metrics tracking
- ROI calculation
```

### **3. Domain (Domínio)**
```typescript
// ✅ Campos principais
- name: string
- level: DomainLevel (1-3)
- path: string
- parent_id: string
- controls_count: number

// ✅ Ações específicas
- tree navigation
- hierarchy management
- breadcrumb generation
```

---

## 🔧 **Extensibilidade**

### **1. Adicionar Novo Modelo**
```typescript
// 1. Criar arquivo do modelo
// src/models/risk.ts

// 2. Definir tipos
export type Risk = BaseEntity & {
  name: string
  risk_level: 'low' | 'medium' | 'high' | 'critical'
  probability: number
  impact: number
  // ... outros campos
}

// 3. Definir schema
export const createRiskSchema = (t: any) => z.object({
  name: z.string().min(2, t('risk.validation.name_min')),
  risk_level: z.enum(['low', 'medium', 'high', 'critical']),
  probability: z.number().min(0).max(100),
  impact: z.number().min(0).max(100),
  // ... outros campos
})

// 4. Definir metadata
export const riskMeta: ModelMeta = {
  displayName: 'Risco de Segurança',
  icon: AlertTriangle,
  // ... configuração completa
}

// 5. Registrar no index.ts
export const MCPRegistry = {
  // ... modelos existentes
  risk: {
    meta: riskMeta,
    type: 'risk' as const,
    model: Risk
  }
}
```

### **2. Componentes Genéricos**
```typescript
// ✅ Form genérico baseado em MCP
const MCPForm = ({ type, data, onSubmit }) => {
  const meta = getMCPModelMeta(type)
  const schema = getMCPSchema(type, 'create')
  
  return (
    <Form schema={schema} onSubmit={onSubmit}>
      {Object.entries(meta.fields).map(([key, field]) => (
        <MCPField key={key} field={field} name={key} />
      ))}
    </Form>
  )
}

// ✅ Tabela genérica baseada em MCP
const MCPTable = ({ type, data, onEdit, onDelete }) => {
  const meta = getMCPModelMeta(type)
  
  return (
    <Table>
      <TableHeader>
        {Object.entries(meta.fields).map(([key, field]) => (
          <TableHead key={key}>{t(field.label)}</TableHead>
        ))}
        <TableHead>{t('common.actions.actions')}</TableHead>
      </TableHeader>
      <TableBody>
        {data.map(item => (
          <MCPTableRow key={item.id} item={item} meta={meta} />
        ))}
      </TableBody>
    </Table>
  )
}
```

---

## 🧪 **Testes MCP**

### **1. Testes de Validação**
```typescript
describe('Policy MCP', () => {
  it('should validate policy schema', () => {
    const t = (key: string) => key
    const schema = createPolicySchema(t)
    
    const validData = {
      name: 'Test Policy',
      description: 'Test description with enough characters',
      content: 'Test content with enough characters to meet minimum requirement'
    }
    
    expect(() => schema.parse(validData)).not.toThrow()
  })
})
```

### **2. Testes de Permissões**
```typescript
describe('Policy Permissions', () => {
  it('should allow admin to approve policies', () => {
    const user = { role: 'admin', tenant_id: 'tenant-1' }
    const policy = { status: 'pending', tenant_id: 'tenant-1' }
    
    expect(policyPermissions.canApprove(user, policy)).toBe(true)
  })
})
```

### **3. Testes de Metadata**
```typescript
describe('Policy Metadata', () => {
  it('should have required fields', () => {
    expect(policyMeta.fields.name).toBeDefined()
    expect(policyMeta.fields.description).toBeDefined()
    expect(policyMeta.fields.content).toBeDefined()
  })
})
```

---

## 📈 **Roadmap MCP**

### **Fase 1: Base (✅ Concluída)**
- ✅ Estrutura base MCP
- ✅ Modelos Policy, Control, Domain
- ✅ Schemas de validação
- ✅ Metadata para UI
- ✅ Sistema de permissões

### **Fase 2: Automação (🔄 Em desenvolvimento)**
- 🔄 Componentes genéricos (Form, Table, Card)
- 🔄 Geração automática de CRUD
- 🔄 Sistema de relatórios
- 🔄 Dashboard dinâmico

### **Fase 3: Extensão (📋 Planejado)**
- 📋 Novos modelos (Risk, Privacy, Audit)
- 📋 Integração com frameworks externos
- 📋 API automática baseada em MCP
- 📋 Documentação automática

### **Fase 4: IA/ML (📋 Futuro)**
- 📋 Sugestões automáticas de campos
- 📋 Validação inteligente
- 📋 Otimização de performance
- 📋 Análise preditiva

---

## ✅ **Conclusão**

O **MCP - Model Content Protocol** estabelece uma base sólida para o desenvolvimento consistente e escalável do projeto `n.CISO`:

### **🎯 Benefícios Alcançados**
- ✅ **Padronização completa** de modelos
- ✅ **Reutilização máxima** de código
- ✅ **Consistência** em validação, UI e i18n
- ✅ **Base sólida** para automações futuras
- ✅ **Extensibilidade** para novos módulos

### **🚀 Próximos Passos**
1. **Implementar componentes genéricos** baseados em MCP
2. **Criar novos modelos** (Risk, Privacy, Audit)
3. **Desenvolver automações** de CRUD e relatórios
4. **Integrar com frameworks** de conformidade

**O MCP está pronto para impulsionar o desenvolvimento do n.CISO!** 🧱 