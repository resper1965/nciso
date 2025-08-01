import { supabase } from '@/lib/supabase'
import { 
  Evaluation, 
  EvaluationFilters, 
  EvaluationFormData, 
  EvaluationListResponse, 
  EvaluationDetailResponse,
  Question,
  QuestionFormData,
  QuestionListResponse,
  EvaluationResponse,
  EvaluationResponseFormData,
  EvaluationStats,
  EvaluationTemplate
} from '@/lib/types/isms'

export class EvaluationsService {
  // Evaluation CRUD
  static async list(filters: EvaluationFilters = {}): Promise<EvaluationListResponse> {
    let query = supabase
      .from('evaluations')
      .select('*', { count: 'exact' })

    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    if (filters.status) {
      query = query.eq('status', filters.status)
    }

    if (filters.domain_id) {
      query = query.eq('domain_id', filters.domain_id)
    }

    if (filters.control_id) {
      query = query.eq('control_id', filters.control_id)
    }

    if (filters.evaluator_id) {
      query = query.eq('evaluator_id', filters.evaluator_id)
    }

    if (filters.start_date) {
      query = query.gte('start_date', filters.start_date)
    }

    if (filters.end_date) {
      query = query.lte('end_date', filters.end_date)
    }

    const page = filters.page || 1
    const limit = filters.limit || 10
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) throw error

    return {
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  }

  static async get(id: string): Promise<EvaluationDetailResponse> {
    const { data: evaluation, error: evalError } = await supabase
      .from('evaluations')
      .select('*')
      .eq('id', id)
      .single()

    if (evalError) throw evalError

    const { data: responses, error: respError } = await supabase
      .from('evaluation_responses')
      .select('*')
      .eq('evaluation_id', id)

    if (respError) throw respError

    const { data: questions, error: questError } = await supabase
      .from('questions')
      .select('*')
      .eq('domain_id', evaluation.domain_id)
      .eq('active', true)
      .order('order', { ascending: true })

    if (questError) throw questError

    const answeredQuestions = responses?.length || 0
    const totalQuestions = questions?.length || 0
    const evidenceCount = responses?.reduce((acc, resp) => acc + (resp.evidence_files?.length || 0), 0) || 0
    const scorePercentage = evaluation.percentage_score || 0

    return {
      evaluation,
      responses: responses || [],
      questions: questions || [],
      stats: {
        answered_questions: answeredQuestions,
        total_questions: totalQuestions,
        evidence_count: evidenceCount,
        score_percentage: scorePercentage
      }
    }
  }

  static async create(data: EvaluationFormData): Promise<Evaluation> {
    const { data: evaluation, error } = await supabase
      .from('evaluations')
      .insert({
        ...data,
        status: 'draft',
        evidence_count: 0,
        tenant_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single()

    if (error) throw error
    return evaluation
  }

  static async update(id: string, data: Partial<EvaluationFormData>): Promise<Evaluation> {
    const { data: evaluation, error } = await supabase
      .from('evaluations')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return evaluation
  }

  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('evaluations')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Question CRUD
  static async listQuestions(filters: { domain_id?: string; control_id?: string; active?: boolean } = {}): Promise<QuestionListResponse> {
    let query = supabase
      .from('questions')
      .select('*', { count: 'exact' })

    if (filters.domain_id) {
      query = query.eq('domain_id', filters.domain_id)
    }

    if (filters.control_id) {
      query = query.eq('control_id', filters.control_id)
    }

    if (filters.active !== undefined) {
      query = query.eq('active', filters.active)
    }

    const { data, error, count } = await query
      .order('order', { ascending: true })

    if (error) throw error

    return {
      data: data || [],
      total: count || 0
    }
  }

  static async getQuestion(id: string): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  static async createQuestion(data: QuestionFormData): Promise<Question> {
    const { data: question, error } = await supabase
      .from('questions')
      .insert({
        ...data,
        active: true,
        tenant_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single()

    if (error) throw error
    return question
  }

  static async updateQuestion(id: string, data: Partial<QuestionFormData>): Promise<Question> {
    const { data: question, error } = await supabase
      .from('questions')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return question
  }

  static async deleteQuestion(id: string): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Evaluation Responses
  static async saveResponse(evaluationId: string, questionId: string, data: EvaluationResponseFormData): Promise<EvaluationResponse> {
    const { data: response, error } = await supabase
      .from('evaluation_responses')
      .upsert({
        evaluation_id: evaluationId,
        question_id: questionId,
        response_value: data.response_value,
        response_text: data.response_text,
        evidence_files: data.evidence_files?.map(f => f.name) || [],
        notes: data.notes,
        score: this.calculateScore(data.response_value, data.response_text),
        max_score: 100
      })
      .select()
      .single()

    if (error) throw error

    // Update evaluation stats
    await this.updateEvaluationStats(evaluationId)

    return response
  }

  static async getResponses(evaluationId: string): Promise<EvaluationResponse[]> {
    const { data, error } = await supabase
      .from('evaluation_responses')
      .select('*')
      .eq('evaluation_id', evaluationId)

    if (error) throw error
    return data || []
  }

  // Evaluation Templates
  static async createTemplate(data: { name: string; description: string; domain_id: string; control_id?: string; questions: QuestionFormData[] }): Promise<EvaluationTemplate> {
    const { data: template, error } = await supabase
      .from('evaluation_templates')
      .insert({
        name: data.name,
        description: data.description,
        domain_id: data.domain_id,
        control_id: data.control_id,
        total_weight: data.questions.reduce((acc, q) => acc + q.weight, 0),
        active: true,
        tenant_id: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single()

    if (error) throw error

    // Create questions for this template
    for (const questionData of data.questions) {
      await this.createQuestion({
        ...questionData,
        domain_id: data.domain_id,
        control_id: data.control_id
      })
    }

    return template
  }

  // Statistics
  static async getStats(): Promise<EvaluationStats> {
    const { data: evaluations, error } = await supabase
      .from('evaluations')
      .select('*')

    if (error) throw error

    const totalEvaluations = evaluations?.length || 0
    const completedEvaluations = evaluations?.filter(e => e.status === 'completed').length || 0
    const averageScore = evaluations?.reduce((acc, e) => acc + (e.percentage_score || 0), 0) / totalEvaluations || 0

    const evaluationsByStatus = evaluations?.reduce((acc, e) => {
      acc[e.status] = (acc[e.status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const evaluationsByDomain = evaluations?.reduce((acc, e) => {
      acc[e.domain_id] = (acc[e.domain_id] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const recentEvaluations = evaluations?.slice(0, 5) || []

    return {
      total_evaluations: totalEvaluations,
      completed_evaluations: completedEvaluations,
      average_score: averageScore,
      evaluations_by_status: evaluationsByStatus,
      evaluations_by_domain: evaluationsByDomain,
      recent_evaluations: recentEvaluations
    }
  }

  // Helper methods
  private static calculateScore(responseValue: string | number | boolean, responseText?: string): number {
    if (typeof responseValue === 'boolean') {
      return responseValue ? 100 : 0
    }

    if (typeof responseValue === 'number') {
      return Math.min(Math.max(responseValue, 0), 100)
    }

    if (typeof responseValue === 'string') {
      // Simple scoring based on response length and content
      const length = responseValue.length
      const hasEvidence = responseText && responseText.length > 10
      return Math.min(length * 2 + (hasEvidence ? 20 : 0), 100)
    }

    return 0
  }

  private static async updateEvaluationStats(evaluationId: string): Promise<void> {
    const { data: responses, error } = await supabase
      .from('evaluation_responses')
      .select('score, max_score')
      .eq('evaluation_id', evaluationId)

    if (error) throw error

    const totalScore = responses?.reduce((acc, r) => acc + (r.score || 0), 0) || 0
    const maxScore = responses?.reduce((acc, r) => acc + (r.max_score || 100), 0) || 0
    const percentageScore = maxScore > 0 ? (totalScore / maxScore) * 100 : 0

    await supabase
      .from('evaluations')
      .update({
        total_score: totalScore,
        max_score: maxScore,
        percentage_score: percentageScore,
        evidence_count: responses?.length || 0
      })
      .eq('id', evaluationId)
  }

  // MCP Methods
  static async mcpList(filters: EvaluationFilters = {}): Promise<EvaluationListResponse> {
    return this.list(filters)
  }

  static async mcpGet(id: string): Promise<EvaluationDetailResponse> {
    return this.get(id)
  }

  static async mcpCreate(data: EvaluationFormData): Promise<Evaluation> {
    return this.create(data)
  }

  static async mcpUpdate(id: string, data: Partial<EvaluationFormData>): Promise<Evaluation> {
    return this.update(id, data)
  }

  static async mcpDelete(id: string): Promise<void> {
    return this.delete(id)
  }

  static async mcpGetReport(evaluationId: string): Promise<any> {
    const evaluation = await this.get(evaluationId)
    
    return {
      evaluation: evaluation.evaluation,
      questions: evaluation.questions,
      responses: evaluation.responses,
      stats: evaluation.stats,
      recommendations: this.generateRecommendations(evaluation),
      compliance_score: evaluation.stats.score_percentage,
      risk_level: this.calculateRiskLevel(evaluation.stats.score_percentage)
    }
  }

  private static generateRecommendations(evaluation: EvaluationDetailResponse): string[] {
    const recommendations: string[] = []
    const score = evaluation.stats.score_percentage

    if (score < 50) {
      recommendations.push('Implementar controles críticos imediatamente')
      recommendations.push('Revisar políticas de segurança')
      recommendations.push('Realizar treinamento de conscientização')
    } else if (score < 75) {
      recommendations.push('Melhorar controles existentes')
      recommendations.push('Implementar monitoramento contínuo')
      recommendations.push('Atualizar procedimentos de segurança')
    } else {
      recommendations.push('Manter controles atuais')
      recommendations.push('Implementar melhorias incrementais')
      recommendations.push('Considerar certificações adicionais')
    }

    return recommendations
  }

  private static calculateRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'low'
    if (score >= 60) return 'medium'
    if (score >= 40) return 'high'
    return 'critical'
  }
} 