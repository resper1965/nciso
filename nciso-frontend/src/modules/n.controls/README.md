# Módulo n.Controls

Este módulo implementa o catálogo centralizado de controles de segurança com suporte completo a internacionalização (i18n) e estrutura modular organizada.

## 🏗️ Estrutura Modular

```
src/modules/n.controls/
├── components/
│   ├── ControlCard.tsx        # Card de exibição de controle
│   ├── ControlForm.tsx        # Formulário de criação/edição
│   ├── ControlFilters.tsx     # Componente de filtros com i18n
│   ├── ControlStatusBadge.tsx # Badge de status com cores
│   ├── ControlsList.tsx       # Lista principal de controles
│   └── index.ts              # Exportações dos componentes
├── hooks/
│   ├── useControlFilters.ts   # Hook para gerenciar filtros
│   └── index.ts              # Exportações dos hooks
├── services/
│   ├── ControlsService.ts     # Service para operações CRUD
│   └── index.ts              # Exportações dos services
├── types/
│   └── index.ts              # Tipos TypeScript do módulo
├── examples/
│   ├── ControlsListWithFilters.tsx  # Exemplo de uso dos filtros
│   └── ControlStatusBadgeExample.tsx # Exemplo do badge de status
└── index.ts                  # Exportações principais do módulo
```

## 🧩 Componentes

### ControlStatusBadge
Badge visual para exibir status dos controles com cores padronizadas:
- **Ativo**: Verde 🟢
- **Inativo**: Cinza ⚪
- **Rascunho**: Amarelo 🟡
- **Arquivado**: Vermelho 🔴

```tsx
import { ControlStatusBadge } from '@/modules/n.controls'

<ControlStatusBadge status="active" />
```

### ControlFilters
Componente de filtros com tradução dinâmica para todos os campos:
- Busca por texto
- Filtro por tipo (preventive, corrective, detective, deterrent)
- Filtro por status (active, inactive, draft, archived)
- Filtro por framework (iso27001, nist, cobit, custom)
- Filtro por domínio (14 domínios de segurança)
- Filtro por prioridade (low, medium, high, critical)

```tsx
import { ControlFilters, useControlFilters } from '@/modules/n.controls'

const { filters, updateFilter, clearFilters } = useControlFilters()

<ControlFilters
  filters={filters}
  onFilterChange={updateFilter}
  onClearFilters={clearFilters}
/>
```

### ControlCard
Card para exibição de controle individual com:
- Informações principais (nome, descrição, tipo, status)
- Badges coloridos para status e prioridade
- Barra de progresso para efetividade
- Menu de ações (visualizar, editar, duplicar, excluir)

### ControlForm
Formulário completo para criação/edição de controles com:
- Validação via Zod
- Campos obrigatórios e opcionais
- Slider para efetividade (0-100%)
- Seletores para tipo, domínio, framework, status, prioridade
- Suporte a tradução dinâmica

### ControlsList
Lista principal de controles com:
- Visualização em tabela ou grid
- Paginação
- Filtros avançados
- Estatísticas
- Ações em lote

### ControlFrameworkMapper
Componente para associar controles a frameworks via checklist:

- **Interface Intuitiva**: Checkboxes para seleção rápida
- **Estado em Tempo Real**: Reflete mapeamentos existentes
- **Persistência Automática**: Salva alterações no Supabase
- **Feedback Visual**: Toasts de sucesso/erro
- **Estatísticas**: Contadores de mapeados/não mapeados
- **Multi-tenant**: Isolamento por tenant via RLS

```tsx
import { ControlFrameworkMapper } from '@/modules/n.controls'

<ControlFrameworkMapper 
  controlId="123-abc"
  controlName="Controle de Acesso"
  showStats={true}
/>
```

### FrameworkCoverageChart
Componente para relatório visual de cobertura de controles por framework:

- **Grálficos Interativos**: Barras, pizza e linha com Recharts
- **Estatísticas em Tempo Real**: Totais e percentuais
- **Filtros Dinâmicos**: Por domínio, tipo e framework
- **Insights Automáticos**: Análises baseadas nos dados
- **Rankings**: Top e bottom frameworks
- **Tooltips Informativos**: Detalhes ao passar o mouse
- **Responsivo**: Mobile-first design

```tsx
import { FrameworkCoverageChart } from '@/modules/n.controls'

<FrameworkCoverageChart 
  tenantId="123-abc"
  showFilters={true}
  chartType="bar"
/>
```

### ExportMappingButton
Componente para exportação de mapeamentos controle-framework:

- **Múltiplos Formatos**: CSV e JSON
- **Filtros Dinâmicos**: Aplicados na exportação
- **Validação de Permissões**: Por tenant
- **Preview com Estatísticas**: Antes da exportação
- **Nomenclatura Automática**: Com timestamp e filtros
- **Download Automático**: Via blob no navegador
- **Compatibilidade**: Excel e ferramentas de auditoria

```tsx
import { ExportMappingButton } from '@/modules/n.controls'

<ExportMappingButton 
  tenantId="123-abc"
  filters={{
    domain: 'access_control',
    type: 'preventive'
  }}
  variant="outline"
/>
```

## 🎣 Hooks

### useControlFilters
Hook personalizado para gerenciar o estado dos filtros:

```tsx
const {
  filters,           // Estado atual dos filtros
  updateFilter,      // Função para atualizar um filtro
  clearFilters,      // Função para limpar todos os filtros
  hasActiveFilters,  // Boolean indicando se há filtros ativos
  getActiveFiltersCount, // Número de filtros ativos
  getFilterSummary   // Resumo dos filtros ativos
} = useControlFilters()

### useFrameworkMapping
Hook personalizado para gerenciar mapeamento de controles e frameworks:

```tsx
const {
  frameworks,           // Lista de frameworks disponíveis
  mappedFrameworks,    // IDs dos frameworks mapeados
  loading,             // Estado de carregamento
  updating,            // Estado de atualização
  toggleMapping,       // Função para alternar mapeamento
  isFrameworkMapped,   // Função para verificar se está mapeado
  getStats,            // Função para obter estatísticas
  refresh              // Função para recarregar dados
} = useFrameworkMapping({ controlId: '123-abc' })

### useCoverageStats
Hook personalizado para gerenciar dados de cobertura de controles por framework:

```tsx
const {
  coverageData,           // Dados de cobertura por framework
  summary,                // Estatísticas gerais
  loading,                // Estado de carregamento
  error,                  // Erro se houver
  hasData,                // Boolean indicando se há dados
  getChartData,           // Dados formatados para gráficos
  getPieChartData,        // Dados para gráfico de pizza
  getTopFrameworks,       // Frameworks com melhor cobertura
  getBottomFrameworks,    // Frameworks com pior cobertura
  getColorForCoverage,    // Função para cores baseadas na cobertura
  getInsights,            // Insights automáticos
  refresh                 // Função para recarregar dados
} = useCoverageStats({ tenantId: '123-abc', filters: {} })
```

## 🔧 Services

### ControlsService
Service para operações CRUD e consultas:

```tsx
import { ControlsService } from '@/modules/n.controls'

// Listar controles
const controls = await ControlsService.list(filters, page, limit)

// Criar controle
const newControl = await ControlsService.create(controlData)

// Atualizar controle
const updatedControl = await ControlsService.update(id, controlData)

// Excluir controle
await ControlsService.delete(id)

// Obter estatísticas
const stats = await ControlsService.getStats()
```

## 📝 Tipos

Todos os tipos TypeScript estão centralizados em `types/index.ts`:

- `Control`: Interface principal do controle
- `ControlType`: Tipos de controle (preventive, corrective, detective, deterrent)
- `ControlStatus`: Status do controle (active, inactive, draft, archived)
- `ControlPriority`: Prioridades (low, medium, high, critical)
- `ControlFramework`: Frameworks (iso27001, nist, cobit, custom)
- `ControlDomain`: Domínios de segurança
- `ControlFilters`: Filtros para consultas
- `ControlStats`: Estatísticas dos controles
- `ControlFormData`: Dados do formulário
- `ControlValidationErrors`: Erros de validação

## 🌍 Traduções

O módulo suporta três idiomas:

- **pt-BR** (Português Brasileiro)
- **en-US** (Inglês Americano)
- **es** (Espanhol)

### Chaves de Tradução Principais

```json
{
  "controls": {
    "filters": {
      "title": "Filtros",
      "all_types": "Todos os tipos",
      "all_status": "Todos os status",
      "all_frameworks": "Todos os frameworks",
      "all_domains": "Todos os domínios",
      "all_priorities": "Todas as prioridades"
    },
    "types": {
      "preventive": "Preventivo",
      "corrective": "Corretivo",
      "detective": "Detetivo",
      "deterrent": "Dissuasivo"
    },
    "status": {
      "active": "Ativo",
      "inactive": "Inativo",
      "draft": "Rascunho",
      "archived": "Arquivado"
    }
  }
}
```

## ✅ Características Implementadas

- [x] **Estrutura Modular**: Organização por responsabilidade
- [x] **Internacionalização Completa**: Todos os labels traduzidos
- [x] **Componentes Reutilizáveis**: ControlStatusBadge, ControlFilters
- [x] **Hook Personalizado**: useControlFilters para gerenciar estado
- [x] **Hook de Mapeamento**: useFrameworkMapping para frameworks
- [x] **Hook de Cobertura**: useCoverageStats para relatórios
- [x] **Service Centralizado**: ControlsService para operações CRUD
- [x] **Tipos TypeScript**: Tipagem completa e organizada
- [x] **Suporte a Temas**: Dark mode nos componentes
- [x] **Validação**: Zod + React Hook Form
- [x] **Acessibilidade**: ARIA labels e roles apropriados
- [x] **Performance**: useCallback para otimização
- [x] **Mapeamento de Frameworks**: Interface checklist para associações
- [x] **Relatório de Cobertura**: Gráficos interativos com Recharts
- [x] **Exportação de Mapeamentos**: CSV e JSON com filtros

## 🎯 Benefícios

1. **Modularidade**: Cada responsabilidade em sua pasta
2. **Reutilização**: Componentes podem ser usados em outros módulos
3. **Manutenibilidade**: Código organizado e documentado
4. **Escalabilidade**: Fácil adição de novos recursos
5. **Consistência**: Padrões uniformes em todo o módulo

## 🔄 Uso

```tsx
import { 
  ControlsList, 
  ControlStatusBadge, 
  ControlFilters,
  ControlFrameworkMapper,
  FrameworkCoverageChart,
  ExportMappingButton,
  useControlFilters,
  useFrameworkMapping,
  useCoverageStats
} from '@/modules/n.controls'

function MyPage() {
  return (
    <div>
      <ControlStatusBadge status="active" />
      <ControlsList />
      <ControlFrameworkMapper 
        controlId="123-abc"
        controlName="Controle de Acesso"
      />
      <FrameworkCoverageChart 
        tenantId="123-abc"
        showFilters={true}
        chartType="bar"
      />
      <ExportMappingButton 
        tenantId="123-abc"
        filters={{
          domain: 'access_control',
          type: 'preventive'
        }}
      />
    </div>
  )
}
```

## 🔗 Integração

O módulo se integra com:

- **Supabase**: Para persistência de dados
- **ShadCN UI**: Para componentes visuais
- **React Hook Form**: Para validação de formulários
- **Zod**: Para schemas de validação
- **i18next**: Para internacionalização
- **Tailwind CSS**: Para estilização 