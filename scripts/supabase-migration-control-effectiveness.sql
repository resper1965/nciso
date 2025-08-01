-- =====================================================
-- Migração: Criação da Tabela control_effectiveness
-- Epic 4 — Avaliações de Efetividade de Controles
-- =====================================================

-- Criar tabela control_effectiveness
CREATE TABLE control_effectiveness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    control_id UUID NOT NULL REFERENCES global_controls(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
    comentario TEXT,
    data_avaliacao TIMESTAMPTZ DEFAULT now(),
    tenant_id UUID NOT NULL,
    avaliador_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_control_effectiveness_control_id ON control_effectiveness(control_id);
CREATE INDEX idx_control_effectiveness_tenant_id ON control_effectiveness(tenant_id);
CREATE INDEX idx_control_effectiveness_avaliador_id ON control_effectiveness(avaliador_id);
CREATE INDEX idx_control_effectiveness_data_avaliacao ON control_effectiveness(data_avaliacao);
CREATE INDEX idx_control_effectiveness_score ON control_effectiveness(score);

-- Criar índice composto para consultas frequentes
CREATE INDEX idx_control_effectiveness_tenant_control ON control_effectiveness(tenant_id, control_id);
CREATE INDEX idx_control_effectiveness_tenant_score ON control_effectiveness(tenant_id, score);

-- Ativar Row Level Security
ALTER TABLE control_effectiveness ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
-- Política para SELECT - usuários podem ver apenas suas avaliações
CREATE POLICY select_effectiveness ON control_effectiveness 
    FOR SELECT 
    USING (tenant_id = (current_setting('request.jwt.claims', true)::json ->> 'tenant_id')::uuid);

-- Política para INSERT - usuários podem criar avaliações apenas para seu tenant
CREATE POLICY insert_effectiveness ON control_effectiveness 
    FOR INSERT 
    WITH CHECK (tenant_id = (current_setting('request.jwt.claims', true)::json ->> 'tenant_id')::uuid);

-- Política para UPDATE - usuários podem atualizar apenas suas avaliações
CREATE POLICY update_effectiveness ON control_effectiveness 
    FOR UPDATE 
    USING (tenant_id = (current_setting('request.jwt.claims', true)::json ->> 'tenant_id')::uuid);

-- Política para DELETE - usuários podem deletar apenas suas avaliações
CREATE POLICY delete_effectiveness ON control_effectiveness 
    FOR DELETE 
    USING (tenant_id = (current_setting('request.jwt.claims', true)::json ->> 'tenant_id')::uuid);

-- Criar trigger para updated_at
CREATE OR REPLACE FUNCTION update_control_effectiveness_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_control_effectiveness_updated_at
    BEFORE UPDATE ON control_effectiveness
    FOR EACH ROW
    EXECUTE FUNCTION update_control_effectiveness_updated_at();

-- Funções úteis para consultas
-- Função para obter média de efetividade por controle
CREATE OR REPLACE FUNCTION get_control_effectiveness_avg(control_uuid UUID, tenant_uuid UUID)
RETURNS TABLE (
    control_id UUID,
    avg_score NUMERIC,
    total_evaluations INTEGER,
    last_evaluation_date TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ce.control_id,
        ROUND(AVG(ce.score)::NUMERIC, 2) as avg_score,
        COUNT(*)::INTEGER as total_evaluations,
        MAX(ce.data_avaliacao) as last_evaluation_date
    FROM control_effectiveness ce
    WHERE ce.control_id = control_uuid 
        AND ce.tenant_id = tenant_uuid
    GROUP BY ce.control_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter estatísticas de efetividade por tenant
CREATE OR REPLACE FUNCTION get_effectiveness_stats(tenant_uuid UUID)
RETURNS TABLE (
    total_evaluations INTEGER,
    avg_score NUMERIC,
    controls_with_evaluations INTEGER,
    last_evaluation_date TIMESTAMPTZ,
    score_distribution JSON
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_evaluations,
        ROUND(AVG(ce.score)::NUMERIC, 2) as avg_score,
        COUNT(DISTINCT ce.control_id)::INTEGER as controls_with_evaluations,
        MAX(ce.data_avaliacao) as last_evaluation_date,
        json_build_object(
            'excellent', COUNT(*) FILTER (WHERE ce.score >= 90),
            'good', COUNT(*) FILTER (WHERE ce.score >= 70 AND ce.score < 90),
            'fair', COUNT(*) FILTER (WHERE ce.score >= 50 AND ce.score < 70),
            'poor', COUNT(*) FILTER (WHERE ce.score < 50)
        ) as score_distribution
    FROM control_effectiveness ce
    WHERE ce.tenant_id = tenant_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter controles com baixa efetividade
CREATE OR REPLACE FUNCTION get_low_effectiveness_controls(tenant_uuid UUID, min_score INTEGER DEFAULT 50)
RETURNS TABLE (
    control_id UUID,
    control_name TEXT,
    avg_score NUMERIC,
    total_evaluations INTEGER,
    last_evaluation_date TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ce.control_id,
        gc.name as control_name,
        ROUND(AVG(ce.score)::NUMERIC, 2) as avg_score,
        COUNT(*)::INTEGER as total_evaluations,
        MAX(ce.data_avaliacao) as last_evaluation_date
    FROM control_effectiveness ce
    JOIN global_controls gc ON ce.control_id = gc.id
    WHERE ce.tenant_id = tenant_uuid
    GROUP BY ce.control_id, gc.name
    HAVING AVG(ce.score) < min_score
    ORDER BY avg_score ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentários na tabela
COMMENT ON TABLE control_effectiveness IS 'Avaliações de efetividade dos controles de segurança';
COMMENT ON COLUMN control_effectiveness.id IS 'Identificador único da avaliação';
COMMENT ON COLUMN control_effectiveness.control_id IS 'Referência ao controle avaliado';
COMMENT ON COLUMN control_effectiveness.score IS 'Pontuação da efetividade (0-100)';
COMMENT ON COLUMN control_effectiveness.comentario IS 'Comentário sobre a avaliação';
COMMENT ON COLUMN control_effectiveness.data_avaliacao IS 'Data da avaliação';
COMMENT ON COLUMN control_effectiveness.tenant_id IS 'ID do tenant (para isolamento)';
COMMENT ON COLUMN control_effectiveness.avaliador_id IS 'ID do usuário que fez a avaliação'; 