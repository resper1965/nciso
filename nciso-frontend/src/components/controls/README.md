# n.Controls - Módulo de Controles de Segurança

## Visão Geral

O módulo `n.Controls` é responsável por centralizar o catálogo de controles de segurança da informação, com suporte a múltiplos frameworks (ISO 27001, NIST, COBIT), avaliações de efetividade, dashboards de conformidade e automações MCP.

## Funcionalidades Implementadas

### ✅ Story 1: CRUD de Controles Globais

- **Campos completos**: nome, descrição, tipo, domínio, framework, status, efetividade, prioridade, responsável
- **Relacionamento com domínios**: integração com n.ISMS
- **Avaliação de efetividade**: score de 0-100% com interface visual
- **APIs REST**: compatíveis com MCP e padrões REST
- **i18n completo**: suporte a pt-BR, en-US, es em todos os labels e mensagens

## Estrutura de Arquivos

```
src/
├── components/controls/
│   ├── index.ts                 # Exportações do módulo
│   ├── controls-list.tsx        # Lista principal com filtros e paginação
│   ├── control-card.tsx         # Card para visualização em grid
│   ├── control-form.tsx         # Formulário de criação/edição
│   ├── control-filters.tsx      # Componente de filtros (futuro)
│   └── control-stats.tsx        # Componente de estatísticas (futuro)
├── lib/
│   ├── types/controls.ts        # Tipos TypeScript
│   └── services/controls.ts     # Serviço de API
├── lib/i18n/locales/
│   ├── pt-BR/controls.json      # Traduções em português
│   ├── en-US/controls.json      # Traduções em inglês
│   └── es/controls.json         # Traduções em espanhol
└── app/controls/
    └── page.tsx                 # Página principal
```

## Componentes Principais

### ControlsList
- Lista de controles com filtros avançados
- Visualização em tabela e grid
- Paginação
- Ações CRUD integradas
- Busca em tempo real

### ControlCard
- Exibição visual dos controles
- Indicadores de status e prioridade
- Barra de progresso de efetividade
- Menu de ações contextual

### ControlForm
- Formulário completo para criação/edição
- Validação em tempo real
- Campos obrigatórios e opcionais
- Slider para efetividade

## Tipos de Dados

### Control
```typescript
interface Control {
  id: string
  name: string
  description: string
  type: 'preventive' | 'corrective' | 'detective' | 'deterrent'
  domain: ControlDomain
  framework: 'iso27001' | 'nist' | 'cobit' | 'custom'
  status: 'active' | 'inactive' | 'draft' | 'archived'
  effectiveness: number // 0-100
  priority: 'low' | 'medium' | 'high' | 'critical'
  owner?: string
  tenant_id: string
  created_at: string
  updated_at: string
}
```

## Domínios Suportados

- **Access Control**: Controle de Acesso
- **Asset Management**: Gestão de Ativos
- **Business Continuity**: Continuidade de Negócio
- **Communications**: Comunicações
- **Compliance**: Conformidade
- **Cryptography**: Criptografia
- **Human Resources**: Recursos Humanos
- **Incident Management**: Gestão de Incidentes
- **Operations**: Operações
- **Physical Security**: Segurança Física
- **Risk Management**: Gestão de Riscos
- **Security Architecture**: Arquitetura de Segurança
- **Supplier Relationships**: Relacionamentos com Fornecedores
- **System Development**: Desenvolvimento de Sistemas

## Frameworks Suportados

- **ISO 27001**: Controles padrão ISO 27001
- **NIST CSF**: Cybersecurity Framework
- **COBIT**: Control Objectives for Information and Related Technologies
- **Custom**: Controles personalizados

## APIs e Serviços

### ControlsService
- `list(filters, page, limit)`: Listar controles com filtros
- `get(id)`: Buscar controle por ID
- `create(data)`: Criar novo controle
- `update(id, data)`: Atualizar controle
- `delete(id)`: Excluir controle
- `getStats()`: Buscar estatísticas
- `duplicate(id)`: Duplicar controle
- `getByDomain(domain)`: Buscar por domínio
- `getByFramework(framework)`: Buscar por framework

## Internacionalização (i18n)

Todos os textos estão externalizados em arquivos JSON:

- **pt-BR**: Português brasileiro
- **en-US**: Inglês americano
- **es**: Espanhol

### Exemplo de uso:
```typescript
const { t } = useTranslation()
t('controls.title') // "Controles"
t('controls.types.preventive') // "Preventivo"
```

## Banco de Dados

### Tabela: controls
- UUID como chave primária
- Constraints de validação
- Índices para performance
- RLS (Row Level Security) habilitado
- Triggers para updated_at automático

### Scripts SQL
- `scripts/create-controls-table.sql`: Criação da tabela
- Dados de exemplo incluídos
- Políticas de segurança configuradas

## Próximas Stories

### 🔄 Story 2: Importação de Frameworks
- Carregar frameworks ISO 27001, NIST CSF, COBIT
- Endpoint `/controls/frameworks/import`
- Interface para visualizar frameworks

### 🔄 Story 3: Mapeamento entre Frameworks
- Relacionar controles de diferentes frameworks
- Dashboard de sobreposição por domínio

### 🔄 Story 4: Avaliação de Efetividade
- Interface para aplicar avaliações
- Histórico de avaliações
- Dashboard de efetividade

### 🔄 Story 5: Dashboard de Conformidade
- Gráficos interativos (Recharts)
- KPIs de conformidade
- Gaps entre frameworks

## Como Usar

1. **Executar script SQL**:
   ```sql
   -- No Supabase SQL Editor
   \i scripts/create-controls-table.sql
   ```

2. **Importar componentes**:
   ```typescript
   import { ControlsList } from '@/components/controls'
   ```

3. **Usar em página**:
   ```typescript
   export default function ControlsPage() {
     return (
       <div className="container mx-auto py-6">
         <ControlsList />
       </div>
     )
   }
   ```

## Requisitos Técnicos

- ✅ React 18+ com TypeScript
- ✅ Supabase como backend
- ✅ ShadCN UI + Radix UI
- ✅ Tailwind CSS
- ✅ i18n com react-i18next
- ✅ Design System n.CISO
- ✅ Compatibilidade MCP
- ✅ Responsividade completa

## Contribuição

Para adicionar novos controles ou funcionalidades:

1. Atualizar tipos em `lib/types/controls.ts`
2. Adicionar traduções nos arquivos JSON
3. Implementar componentes seguindo padrões existentes
4. Atualizar documentação
5. Testar em múltiplos idiomas 