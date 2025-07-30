import { z } from 'zod'
import { Link, ArrowRight, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react'
import { MCPModelType } from './index'

// =====================================================
// FRAMEWORK CROSSWALK MODEL - MCP FRAMEWORK CORRELATIONS
// =====================================================

export type CrosswalkRelationType = 'equivalent' | 'partial_overlap' | 'related' | 'suggested'

export interface FrameworkCrosswalk {
  id: string
  source_control_id: string
  target_control_id: string
  source_framework_id: string
  target_framework_id: string
  relation_type: CrosswalkRelationType
  notes: string
  confidence_score: number // 0.0 to 1.0
  is_public: boolean
  is_ai_generated: boolean
  reviewed_by?: string
  reviewed_at?: string
  tenant_id: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface CrosswalkAnalysis {
  framework_id: string
  framework_name: string
  total_controls: number
  mapped_controls: number
  coverage_percentage: number
  crosswalk_count: number
  average_confidence: number
  domains: {
    domain: string
    controls: number
    mapped: number
    coverage: number
  }[]
}

export interface CrosswalkSuggestion {
  source_control_id: string
  target_control_id: string
  relation_type: CrosswalkRelationType
  confidence_score: number
  reasoning: string
  suggested_notes: string
}

// =====================================================
// ZOD SCHEMAS
// =====================================================

export const FrameworkCrosswalkSchema = z.object({
  id: z.string().uuid(),
  source_control_id: z.string().uuid(),
  target_control_id: z.string().uuid(),
  source_framework_id: z.string().uuid(),
  target_framework_id: z.string().uuid(),
  relation_type: z.enum(['equivalent', 'partial_overlap', 'related', 'suggested']),
  notes: z.string().optional(),
  confidence_score: z.number().min(0).max(1),
  is_public: z.boolean(),
  is_ai_generated: z.boolean(),
  reviewed_by: z.string().uuid().optional(),
  reviewed_at: z.string().datetime().optional(),
  tenant_id: z.string().uuid(),
  created_by: z.string().uuid(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime()
})

export const CrosswalkSuggestionSchema = z.object({
  source_control_id: z.string().uuid(),
  target_control_id: z.string().uuid(),
  relation_type: z.enum(['equivalent', 'partial_overlap', 'related']),
  confidence_score: z.number().min(0).max(1),
  reasoning: z.string(),
  suggested_notes: z.string()
})

// =====================================================
// MCP METADATA
// =====================================================

export const FrameworkCrosswalkModelMeta = {
  type: 'framework_crosswalk' as MCPModelType,
  icon: Link,
  title: 'models.framework_crosswalk.title',
  description: 'models.framework_crosswalk.description',
  fields: {
    source_control_id: {
      label: 'forms.crosswalk.source_control',
      type: 'relation' as const,
      required: true,
      relation: 'framework_control'
    },
    target_control_id: {
      label: 'forms.crosswalk.target_control',
      type: 'relation' as const,
      required: true,
      relation: 'framework_control'
    },
    source_framework_id: {
      label: 'forms.crosswalk.source_framework',
      type: 'relation' as const,
      required: true,
      relation: 'framework'
    },
    target_framework_id: {
      label: 'forms.crosswalk.target_framework',
      type: 'relation' as const,
      required: true,
      relation: 'framework'
    },
    relation_type: {
      label: 'forms.crosswalk.relation_type',
      type: 'select' as const,
      required: true,
      options: [
        { value: 'equivalent', label: 'relation_type.equivalent' },
        { value: 'partial_overlap', label: 'relation_type.partial_overlap' },
        { value: 'related', label: 'relation_type.related' },
        { value: 'suggested', label: 'relation_type.suggested' }
      ]
    },
    confidence_score: {
      label: 'forms.crosswalk.confidence_score',
      type: 'number' as const,
      required: true,
      validation: { min: 0, max: 1 }
    },
    notes: {
      label: 'forms.crosswalk.notes',
      type: 'textarea' as const,
      required: false,
      placeholder: 'forms.crosswalk.notes_placeholder'
    },
    is_public: {
      label: 'forms.crosswalk.is_public',
      type: 'boolean' as const,
      required: true
    }
  }
}

// =====================================================
// MOCK DATA
// =====================================================

export const getFrameworkCrosswalkMockData = (): FrameworkCrosswalk[] => [
  {
    id: '1',
    source_control_id: 'iso-a-5-1',
    target_control_id: 'nist-ac-1',
    source_framework_id: 'iso27001',
    target_framework_id: 'nist',
    relation_type: 'equivalent',
    notes: 'Políticas de segurança da informação são equivalentes entre ISO 27001 A.5.1 e NIST AC-1',
    confidence_score: 0.95,
    is_public: true,
    is_ai_generated: false,
    reviewed_by: 'admin',
    reviewed_at: '2024-01-15T10:00:00Z',
    tenant_id: 'dev-tenant',
    created_by: 'admin',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    source_control_id: 'iso-a-6-1',
    target_control_id: 'nist-ac-2',
    source_framework_id: 'iso27001',
    target_framework_id: 'nist',
    relation_type: 'partial_overlap',
    notes: 'Contratos com terceiros (ISO A.6.1) tem sobreposição parcial com controle de acesso (NIST AC-2)',
    confidence_score: 0.75,
    is_public: true,
    is_ai_generated: true,
    reviewed_by: 'admin',
    reviewed_at: '2024-01-15T10:00:00Z',
    tenant_id: 'dev-tenant',
    created_by: 'admin',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '3',
    source_control_id: 'iso-a-7-1',
    target_control_id: 'cobit-apo-13',
    source_framework_id: 'iso27001',
    target_framework_id: 'cobit',
    relation_type: 'related',
    notes: 'Controle de acesso físico (ISO A.7.1) relacionado com governança de segurança (COBIT APO13)',
    confidence_score: 0.60,
    is_public: true,
    is_ai_generated: true,
    reviewed_by: undefined,
    reviewed_at: undefined,
    tenant_id: 'dev-tenant',
    created_by: 'admin',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
]

export const getCrosswalkAnalysisMockData = (): CrosswalkAnalysis[] => [
  {
    framework_id: 'iso27001',
    framework_name: 'ISO 27001:2022',
    total_controls: 114,
    mapped_controls: 89,
    coverage_percentage: 78.1,
    crosswalk_count: 156,
    average_confidence: 0.82,
    domains: [
      {
        domain: 'Organizational Controls',
        controls: 35,
        mapped: 28,
        coverage: 80.0
      },
      {
        domain: 'People Controls',
        controls: 8,
        mapped: 6,
        coverage: 75.0
      },
      {
        domain: 'Physical Controls',
        controls: 14,
        mapped: 12,
        coverage: 85.7
      },
      {
        domain: 'Technological Controls',
        controls: 57,
        mapped: 43,
        coverage: 75.4
      }
    ]
  },
  {
    framework_id: 'nist',
    framework_name: 'NIST CSF',
    total_controls: 108,
    mapped_controls: 72,
    coverage_percentage: 66.7,
    crosswalk_count: 134,
    average_confidence: 0.78,
    domains: [
      {
        domain: 'Identify',
        controls: 24,
        mapped: 18,
        coverage: 75.0
      },
      {
        domain: 'Protect',
        controls: 32,
        mapped: 22,
        coverage: 68.8
      },
      {
        domain: 'Detect',
        controls: 20,
        mapped: 14,
        coverage: 70.0
      },
      {
        domain: 'Respond',
        controls: 16,
        mapped: 10,
        coverage: 62.5
      },
      {
        domain: 'Recover',
        controls: 16,
        mapped: 8,
        coverage: 50.0
      }
    ]
  }
]

// =====================================================
// UTILITIES
// =====================================================

export const getRelationTypeLabel = (type: CrosswalkRelationType): string => {
  const labels = {
    equivalent: 'Equivalent',
    partial_overlap: 'Partial Overlap',
    related: 'Related',
    suggested: 'Suggested'
  }
  return labels[type] || type
}

export const getRelationTypeColor = (type: CrosswalkRelationType): string => {
  const colors = {
    equivalent: 'bg-green-100 text-green-800',
    partial_overlap: 'bg-yellow-100 text-yellow-800',
    related: 'bg-blue-100 text-blue-800',
    suggested: 'bg-gray-100 text-gray-800'
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}

export const getRelationTypeIcon = (type: CrosswalkRelationType) => {
  const icons = {
    equivalent: CheckCircle,
    partial_overlap: AlertTriangle,
    related: Link,
    suggested: HelpCircle
  }
  return icons[type] || HelpCircle
}

export const getConfidenceColor = (score: number): string => {
  if (score >= 0.8) return 'bg-green-100 text-green-800'
  if (score >= 0.6) return 'bg-yellow-100 text-yellow-800'
  if (score >= 0.4) return 'bg-orange-100 text-orange-800'
  return 'bg-red-100 text-red-800'
}

export const getConfidenceLabel = (score: number): string => {
  if (score >= 0.8) return 'High'
  if (score >= 0.6) return 'Medium'
  if (score >= 0.4) return 'Low'
  return 'Very Low'
}

export const calculateCrosswalkCoverage = (crosswalks: FrameworkCrosswalk[], totalControls: number): number => {
  if (totalControls === 0) return 0
  const uniqueMappedControls = new Set(crosswalks.map(c => c.source_control_id)).size
  return Math.round((uniqueMappedControls / totalControls) * 100)
}

export const calculateAverageConfidence = (crosswalks: FrameworkCrosswalk[]): number => {
  if (crosswalks.length === 0) return 0
  const totalConfidence = crosswalks.reduce((sum, c) => sum + c.confidence_score, 0)
  return Math.round((totalConfidence / crosswalks.length) * 100) / 100
}

// =====================================================
// AI INTEGRATION
// =====================================================

export interface CrosswalkAISuggestion {
  source_control: {
    id: string
    name: string
    description: string
    framework: string
  }
  target_control: {
    id: string
    name: string
    description: string
    framework: string
  }
  relation_type: CrosswalkRelationType
  confidence_score: number
  reasoning: string
  suggested_notes: string
}

export const generateCrosswalkSuggestions = async (
  sourceControl: any,
  targetFramework: any,
  controls: any[]
): Promise<CrosswalkAISuggestion[]> => {
  // Simulação de sugestões IA
  const suggestions: CrosswalkAISuggestion[] = []
  
  // Lógica de sugestão baseada em similaridade semântica
  for (const targetControl of controls) {
    const similarity = calculateSemanticSimilarity(sourceControl.description, targetControl.description)
    
    if (similarity > 0.7) {
      suggestions.push({
        source_control: {
          id: sourceControl.id,
          name: sourceControl.name,
          description: sourceControl.description,
          framework: sourceControl.framework
        },
        target_control: {
          id: targetControl.id,
          name: targetControl.name,
          description: targetControl.description,
          framework: targetControl.framework
        },
        relation_type: similarity > 0.9 ? 'equivalent' : similarity > 0.8 ? 'partial_overlap' : 'related',
        confidence_score: similarity,
        reasoning: `Similaridade semântica de ${Math.round(similarity * 100)}% entre os controles`,
        suggested_notes: `Sugestão automática baseada em análise semântica`
      })
    }
  }
  
  return suggestions.sort((a, b) => b.confidence_score - a.confidence_score)
}

export const calculateSemanticSimilarity = (text1: string, text2: string): number => {
  // Implementação simplificada de similaridade semântica
  // Em produção, usar LLM ou embeddings
  const words1 = text1.toLowerCase().split(/\s+/)
  const words2 = text2.toLowerCase().split(/\s+/)
  
  const intersection = words1.filter(word => words2.includes(word))
  const union = [...new Set([...words1, ...words2])]
  
  return intersection.length / union.length
}

// =====================================================
// EXPORT
// =====================================================

export default {
  FrameworkCrosswalkSchema,
  CrosswalkSuggestionSchema,
  FrameworkCrosswalkModelMeta,
  getFrameworkCrosswalkMockData,
  getCrosswalkAnalysisMockData,
  generateCrosswalkSuggestions
} 