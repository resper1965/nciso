# Módulo n.Controls

Este módulo implementa o catálogo centralizado de controles de segurança com suporte completo a internacionalização (i18n).

## Estrutura

```
src/modules/n.controls/
├── components/
│   ├── ControlFilters.tsx    # Componente de filtros com i18n
│   └── index.ts             # Exportações dos componentes
├── hooks/
│   ├── useControlFilters.ts  # Hook para gerenciar filtros
│   └── index.ts             # Exportações dos hooks
├── examples/
│   └── ControlsListWithFilters.tsx  # Exemplo de uso
└── index.ts                 # Exportações principais do módulo
```

## Componentes

### ControlFilters

Componente de filtros com tradução dinâmica para todos os campos:

- **Busca**: Campo de texto para buscar por nome/descrição
- **Tipo**: Select com opções (preventive, corrective, detective, deterrent)
- **Status**: Select com opções (active, inactive, draft, archived)
- **Framework**: Select com opções (iso27001, nist, cobit, custom)
- **Domínio**: Select com opções de domínios de segurança
- **Prioridade**: Select com opções (low, medium, high, critical)

#### Uso

```tsx
import { ControlFilters, useControlFilters } from '@/modules/n.controls'

function MyComponent() {
  const { filters, updateFilter, clearFilters } = useControlFilters()
  
  return (
    <ControlFilters
      filters={filters}
      onFilterChange={updateFilter}
      onClearFilters={clearFilters}
    />
  )
}
```

## Hooks

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
```

## Traduções

O módulo suporta três idiomas:

- **pt-BR** (Português Brasileiro)
- **en-US** (Inglês Americano)
- **es** (Espanhol)

### Chaves de Tradução

```json
{
  "controls": {
    "filters": {
      "title": "Filtros",
      "all_types": "Todos os tipos",
      "all_status": "Todos os status",
      "all_frameworks": "Todos os frameworks",
      "all_domains": "Todos os domínios",
      "all_priorities": "Todas as prioridades",
      "search_placeholder": "Buscar controles...",
      "clear_filters": "Limpar filtros"
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

## Características

### ✅ Implementado

- [x] Tradução dinâmica em todos os filtros
- [x] Suporte a pt-BR, en-US, es
- [x] Hook personalizado para gerenciar filtros
- [x] Componente reutilizável de filtros
- [x] Limpeza automática de filtros vazios
- [x] Contador de filtros ativos
- [x] Botão para limpar todos os filtros
- [x] Estrutura modular organizada
- [x] Exportações centralizadas

### 🎯 Benefícios

1. **Internacionalização Completa**: Todos os labels são traduzidos dinamicamente
2. **Reutilização**: Componente pode ser usado em qualquer parte da aplicação
3. **Manutenibilidade**: Filtros centralizados e organizados
4. **UX Melhorada**: Feedback visual sobre filtros ativos
5. **Performance**: Hook otimizado com useCallback

### 🔧 Uso Avançado

```tsx
// Exemplo com filtros iniciais
const { filters, updateFilter } = useControlFilters({
  status: 'active',
  type: 'preventive'
})

// Exemplo com callback personalizado
const handleFilterChange = (key, value) => {
  updateFilter(key, value)
  // Lógica adicional aqui
}
```

## Integração

O módulo se integra com:

- **Supabase**: Para persistência de dados
- **ShadCN UI**: Para componentes visuais
- **React Hook Form**: Para validação de formulários
- **Zod**: Para schemas de validação
- **i18next**: Para internacionalização 