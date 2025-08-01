# Módulo n.ISMS - Sistema de Gestão de Segurança da Informação

## Visão Geral

O módulo `n.ISMS` implementa a infraestrutura e base operacional do Sistema de Gestão de Segurança da Informação (SGSI) no projeto n.CISO. Este módulo fornece os fundamentos necessários para estabelecer e manter um SGSI eficaz.

## Funcionalidades Implementadas

### ✅ Story 1: Escopo do SGSI
- **CRUD completo de escopos** com campos: nome, descrição, abrangência, unidades aplicáveis
- **Relacionamento com organizações e domínios**
- **Interface responsiva** com filtros avançados e paginação
- **Validação de formulários** com feedback visual
- **Integração com MCP** através de endpoints padronizados

### 🚧 Stories em Desenvolvimento
- **Story 2**: Organizações e Unidades
- **Story 3**: Ativos
- **Story 4**: Domínios
- **Story 5**: Avaliações Estruturadas

## Estrutura de Arquivos

```
src/
├── components/isms/
│   ├── scope-list.tsx          # Lista de escopos ISMS
│   ├── scope-form.tsx          # Formulário de escopo
│   ├── index.ts               # Exportações do módulo
│   └── README.md              # Esta documentação
├── lib/
│   ├── types/isms.ts          # Tipos TypeScript
│   ├── services/isms.ts       # Serviços de API
│   └── i18n/locales/
│       ├── pt-BR/isms.json    # Traduções PT-BR
│       ├── en-US/isms.json    # Traduções EN-US
│       └── es/isms.json       # Traduções ES
├── app/isms/
│   └── page.tsx               # Página principal ISMS
└── scripts/
    └── create-isms-tables.sql # Script SQL para Supabase
```

## Componentes Principais

### ScopeList
Componente principal para listagem e gestão de escopos ISMS.

**Funcionalidades:**
- Listagem paginada com filtros
- Busca por nome e organização
- Filtros por status ativo/inativo
- Ações CRUD (criar, editar, excluir, ativar/desativar)
- Interface responsiva com tabela

**Props:** Nenhuma (componente autônomo)

### ScopeForm
Modal de formulário para criação e edição de escopos.

**Props:**
```typescript
interface ScopeFormProps {
  scope?: ISMSScope | null    // Escopo para edição (null = criação)
  organizations: Organization[] // Lista de organizações disponíveis
  onSuccess: () => void       // Callback de sucesso
  onCancel: () => void        // Callback de cancelamento
}
```

## Tipos de Dados

### ISMSScope
```typescript
interface ISMSScope {
  id: string
  name: string
  description: string
  coverage: string                    // Abrangência
  applicable_units: string[]          // Unidades aplicáveis
  organization_id: string
  domain_ids: string[]               // IDs dos domínios
  tenant_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}
```

### Organization
```typescript
interface Organization {
  id: string
  name: string
  type: 'company' | 'department' | 'unit' | 'division'
  parent_id?: string
  description?: string
  tenant_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}
```

### Asset
```typescript
interface Asset {
  id: string
  name: string
  type: AssetType
  owner_id: string
  classification: AssetClassification
  description?: string
  location?: string
  value?: number
  organization_id: string
  tenant_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}
```

## Serviços de API

### ismsScopeService
Serviço principal para operações com escopos ISMS.

**Métodos:**
- `list(filters, page, limit)` - Listar escopos com filtros
- `get(id)` - Obter escopo por ID
- `create(data)` - Criar novo escopo
- `update(id, data)` - Atualizar escopo
- `delete(id)` - Excluir escopo
- `toggleActive(id, isActive)` - Ativar/desativar escopo

### organizationService
Serviço para gestão de organizações.

**Métodos:**
- `list(filters, page, limit)` - Listar organizações
- `get(id)` - Obter organização por ID
- `create(data)` - Criar organização
- `update(id, data)` - Atualizar organização
- `delete(id)` - Excluir organização
- `getHierarchy()` - Obter hierarquia organizacional

### assetService
Serviço para gestão de ativos.

**Métodos:**
- `list(filters, page, limit)` - Listar ativos
- `get(id)` - Obter ativo por ID
- `create(data)` - Criar ativo
- `update(id, data)` - Atualizar ativo
- `delete(id)` - Excluir ativo
- `getStats()` - Obter estatísticas de ativos

### domainService
Serviço para gestão de domínios.

**Métodos:**
- `list(filters, page, limit)` - Listar domínios
- `get(id)` - Obter domínio por ID
- `create(data)` - Criar domínio
- `update(id, data)` - Atualizar domínio
- `delete(id)` - Excluir domínio
- `getHierarchy()` - Obter hierarquia de domínios

## Banco de Dados

### Tabelas Principais

1. **organizations** - Entidades organizacionais
2. **domains** - Domínios de segurança hierárquicos
3. **assets** - Ativos de informação
4. **isms_scopes** - Escopos do SGSI
5. **evaluations** - Avaliações estruturadas

### Características
- **Row Level Security (RLS)** habilitado em todas as tabelas
- **Multi-tenancy** através do campo `tenant_id`
- **Índices otimizados** para performance
- **Triggers automáticos** para `updated_at`
- **Constraints de validação** para integridade dos dados

## Internacionalização (i18n)

O módulo suporta três idiomas:
- **pt-BR** (Português Brasileiro)
- **en-US** (Inglês Americano)
- **es** (Espanhol)

**Estrutura de traduções:**
```json
{
  "isms": {
    "title": "SGSI",
    "scope": {
      "title": "Escopo do SGSI",
      "actions": { ... },
      "fields": { ... },
      "messages": { ... },
      "validation": { ... }
    },
    "organizations": { ... },
    "assets": { ... },
    "domains": { ... },
    "evaluations": { ... }
  }
}
```

## Integração com MCP

O módulo ISMS está preparado para integração com o MCP Server através de:

### Endpoints MCP
- `list_scope` - Listar escopos
- `create_scope` - Criar escopo
- `update_scope` - Atualizar escopo
- `delete_scope` - Excluir escopo
- `list_organizations` - Listar organizações
- `list_assets` - Listar ativos
- `list_domains` - Listar domínios
- `evaluation_report` - Relatório de avaliações

### Estrutura de Request/Response
```typescript
interface MCPISMSRequest {
  method: string
  params: {
    id?: string
    filters?: any
    data?: any
  }
}

interface MCPISMSResponse {
  success: boolean
  data?: any
  error?: string
  message?: string
}
```

## Uso

### Página Principal
```tsx
import { ScopeList } from '@/components/isms'

export default function ISMSPage() {
  return <ScopeList />
}
```

### Uso de Componentes
```tsx
import { ScopeForm } from '@/components/isms'

function MyComponent() {
  const [showForm, setShowForm] = useState(false)
  
  return (
    <ScopeForm
      organizations={organizations}
      onSuccess={() => setShowForm(false)}
      onCancel={() => setShowForm(false)}
    />
  )
}
```

### Uso de Serviços
```tsx
import { ismsScopeService } from '@/lib/services/isms'

// Listar escopos
const scopes = await ismsScopeService.list({ is_active: true })

// Criar escopo
const newScope = await ismsScopeService.create({
  name: 'Novo Escopo',
  description: 'Descrição do escopo',
  coverage: 'Abrangência do escopo',
  organization_id: 'org-id',
  is_active: true
})
```

## Próximos Passos

### Story 2: Organizações e Unidades
- [ ] Componente de lista de organizações
- [ ] Formulário de organização
- [ ] Gestão hierárquica
- [ ] Integração com escopos

### Story 3: Ativos
- [ ] Componente de lista de ativos
- [ ] Formulário de ativo
- [ ] Classificação CIA
- [ ] Dashboard de ativos

### Story 4: Domínios
- [ ] Componente de lista de domínios
- [ ] Formulário hierárquico
- [ ] Breadcrumbs visuais
- [ ] Associação com controles

### Story 5: Avaliações Estruturadas
- [ ] Componente de avaliações
- [ ] Formulários dinâmicos
- [ ] Upload de evidências
- [ ] Relatórios automáticos

## Considerações Técnicas

### Performance
- Paginação implementada em todas as listagens
- Índices otimizados no banco de dados
- Lazy loading de componentes pesados

### Segurança
- RLS habilitado em todas as tabelas
- Validação de entrada em formulários
- Sanitização de dados

### Acessibilidade
- Labels semânticos em formulários
- Navegação por teclado
- Contraste adequado
- Screen reader friendly

### Responsividade
- Design mobile-first
- Breakpoints consistentes
- Componentes adaptáveis

## Contribuição

Para contribuir com o módulo ISMS:

1. Siga os padrões estabelecidos
2. Mantenha a compatibilidade com i18n
3. Implemente testes para novos componentes
4. Documente mudanças significativas
5. Siga o Design System n.CISO 