-- =============================================================================
-- 📊 TABELAS DO CATÁLOGO DE CONTROLES (n.Controls)
-- =============================================================================

-- Tabela de frameworks de controle
CREATE TABLE IF NOT EXISTS control_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL, -- ISO 27001, NIST, COBIT, etc.
  version VARCHAR(20),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de domínios de controle
CREATE TABLE IF NOT EXISTS control_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID REFERENCES control_frameworks(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES control_domains(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela principal de controles globais
CREATE TABLE IF NOT EXISTS global_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('preventive', 'corrective', 'detective', 'deterrent')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'inactive', 'draft', 'archived')),
  frameworks TEXT[] NOT NULL DEFAULT '{}',
  domain TEXT NOT NULL CHECK (domain IN (
    'access_control', 'asset_management', 'business_continuity', 'communications',
    'compliance', 'cryptography', 'human_resources', 'incident_management',
    'operations', 'physical_security', 'risk_management', 'security_architecture',
    'supplier_relationships', 'system_development'
  )),
  effectiveness INTEGER DEFAULT 0 CHECK (effectiveness >= 0 AND effectiveness <= 100),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  owner TEXT,
  created_by UUID,
  updated_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de mapeamentos de controles
CREATE TABLE IF NOT EXISTS control_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_control_id UUID NOT NULL REFERENCES global_controls(id) ON DELETE CASCADE,
  target_control_id UUID NOT NULL REFERENCES global_controls(id) ON DELETE CASCADE,
  mapping_type VARCHAR(50) CHECK (mapping_type IN ('equivalent', 'subset', 'superset')),
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de avaliações de efetividade
CREATE TABLE IF NOT EXISTS control_effectiveness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id UUID NOT NULL REFERENCES global_controls(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  justification TEXT,
  assessed_by UUID,
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  next_assessment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de logs de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(100) NOT NULL,
  details JSONB,
  user_id UUID,
  tenant_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 📊 ÍNDICES PARA PERFORMANCE
-- =============================================================================

-- Índices para global_controls
CREATE INDEX IF NOT EXISTS idx_global_controls_tenant_id ON global_controls(tenant_id);
CREATE INDEX IF NOT EXISTS idx_global_controls_type ON global_controls(type);
CREATE INDEX IF NOT EXISTS idx_global_controls_status ON global_controls(status);
CREATE INDEX IF NOT EXISTS idx_global_controls_domain ON global_controls(domain);
CREATE INDEX IF NOT EXISTS idx_global_controls_priority ON global_controls(priority);
CREATE INDEX IF NOT EXISTS idx_global_controls_created_at ON global_controls(created_at);
CREATE INDEX IF NOT EXISTS idx_global_controls_frameworks ON global_controls USING GIN(frameworks);

-- Índices para control_effectiveness
CREATE INDEX IF NOT EXISTS idx_control_effectiveness_control_id ON control_effectiveness(control_id);
CREATE INDEX IF NOT EXISTS idx_control_effectiveness_tenant_id ON control_effectiveness(tenant_id);
CREATE INDEX IF NOT EXISTS idx_control_effectiveness_assessment_date ON control_effectiveness(assessment_date);

-- Índices para audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- =============================================================================
-- 🔐 ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Habilitar RLS nas tabelas
ALTER TABLE global_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_effectiveness ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para global_controls
CREATE POLICY "tenant_select_controls" ON global_controls
  FOR SELECT USING (tenant_id = (current_setting('request.jwt.claims'::text, true)::json ->> 'tenant_id')::uuid);

CREATE POLICY "tenant_insert_controls" ON global_controls
  FOR INSERT WITH CHECK (tenant_id = (current_setting('request.jwt.claims'::text, true)::json ->> 'tenant_id')::uuid);

CREATE POLICY "tenant_update_controls" ON global_controls
  FOR UPDATE USING (tenant_id = (current_setting('request.jwt.claims'::text, true)::json ->> 'tenant_id')::uuid);

CREATE POLICY "tenant_delete_controls" ON global_controls
  FOR DELETE USING (tenant_id = (current_setting('request.jwt.claims'::text, true)::json ->> 'tenant_id')::uuid);

-- Políticas RLS para control_effectiveness
CREATE POLICY "tenant_select_effectiveness" ON control_effectiveness
  FOR SELECT USING (tenant_id = (current_setting('request.jwt.claims'::text, true)::json ->> 'tenant_id')::uuid);

CREATE POLICY "tenant_insert_effectiveness" ON control_effectiveness
  FOR INSERT WITH CHECK (tenant_id = (current_setting('request.jwt.claims'::text, true)::json ->> 'tenant_id')::uuid);

CREATE POLICY "tenant_update_effectiveness" ON control_effectiveness
  FOR UPDATE USING (tenant_id = (current_setting('request.jwt.claims'::text, true)::json ->> 'tenant_id')::uuid);

CREATE POLICY "tenant_delete_effectiveness" ON control_effectiveness
  FOR DELETE USING (tenant_id = (current_setting('request.jwt.claims'::text, true)::json ->> 'tenant_id')::uuid);

-- Políticas RLS para audit_logs
CREATE POLICY "tenant_select_audit_logs" ON audit_logs
  FOR SELECT USING (tenant_id = (current_setting('request.jwt.claims'::text, true)::json ->> 'tenant_id')::uuid);

CREATE POLICY "tenant_insert_audit_logs" ON audit_logs
  FOR INSERT WITH CHECK (tenant_id = (current_setting('request.jwt.claims'::text, true)::json ->> 'tenant_id')::uuid);

-- =============================================================================
-- 🔄 TRIGGERS E FUNÇÕES
-- =============================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_global_controls_updated_at
  BEFORE UPDATE ON global_controls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_control_frameworks_updated_at
  BEFORE UPDATE ON control_frameworks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_control_domains_updated_at
  BEFORE UPDATE ON control_domains
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 📊 FUNÇÕES ÚTEIS
-- =============================================================================

-- Função para obter estatísticas de controles por tenant
CREATE OR REPLACE FUNCTION get_control_stats(tenant_id_param UUID)
RETURNS TABLE (
  total_controls BIGINT,
  active_controls BIGINT,
  average_effectiveness NUMERIC,
  controls_by_type JSONB,
  controls_by_status JSONB,
  controls_by_priority JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_controls,
    COUNT(*) FILTER (WHERE status = 'active') as active_controls,
    ROUND(AVG(effectiveness), 2) as average_effectiveness,
    jsonb_object_agg(type, count) FILTER (WHERE type IS NOT NULL) as controls_by_type,
    jsonb_object_agg(status, count) FILTER (WHERE status IS NOT NULL) as controls_by_status,
    jsonb_object_agg(priority, count) FILTER (WHERE priority IS NOT NULL) as controls_by_priority
  FROM (
    SELECT 
      type,
      status,
      priority,
      COUNT(*) as count
    FROM global_controls
    WHERE tenant_id = tenant_id_param
    GROUP BY type, status, priority
  ) stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para buscar controles por framework
CREATE OR REPLACE FUNCTION get_controls_by_framework(tenant_id_param UUID, framework_param TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  type TEXT,
  status TEXT,
  effectiveness INTEGER,
  priority TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gc.id,
    gc.name,
    gc.type,
    gc.status,
    gc.effectiveness,
    gc.priority
  FROM global_controls gc
  WHERE gc.tenant_id = tenant_id_param
    AND framework_param = ANY(gc.frameworks)
  ORDER BY gc.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 📊 DADOS INICIAIS
-- =============================================================================

-- Inserir frameworks padrão
INSERT INTO control_frameworks (name, version, description) VALUES
  ('ISO 27001', '2022', 'Sistema de Gestão de Segurança da Informação'),
  ('NIST CSF', '2.0', 'Cybersecurity Framework'),
  ('COBIT', '2019', 'Control Objectives for Information and Related Technologies'),
  ('Custom', '1.0', 'Framework customizado da organização')
ON CONFLICT (name) DO NOTHING;

-- Inserir domínios padrão
INSERT INTO control_domains (name, description) VALUES
  ('Controle de Acesso', 'Controles de acesso físico e lógico'),
  ('Gestão de Ativos', 'Controles para gestão de ativos de informação'),
  ('Continuidade de Negócio', 'Controles para continuidade de negócio'),
  ('Comunicações', 'Controles de segurança de comunicações'),
  ('Conformidade', 'Controles de conformidade legal e regulatória'),
  ('Criptografia', 'Controles de criptografia e proteção de dados'),
  ('Recursos Humanos', 'Controles de segurança para recursos humanos'),
  ('Gestão de Incidentes', 'Controles para gestão de incidentes de segurança'),
  ('Operações', 'Controles de operações de segurança'),
  ('Segurança Física', 'Controles de segurança física'),
  ('Gestão de Riscos', 'Controles para gestão de riscos'),
  ('Arquitetura de Segurança', 'Controles de arquitetura de segurança'),
  ('Relacionamentos com Fornecedores', 'Controles para gestão de fornecedores'),
  ('Desenvolvimento de Sistemas', 'Controles para desenvolvimento seguro')
ON CONFLICT (name) DO NOTHING;

-- =============================================================================
-- 📊 COMENTÁRIOS
-- =============================================================================

COMMENT ON TABLE global_controls IS 'Tabela principal de controles de segurança';
COMMENT ON TABLE control_frameworks IS 'Frameworks de controle de segurança';
COMMENT ON TABLE control_domains IS 'Domínios de controle de segurança';
COMMENT ON TABLE control_effectiveness IS 'Avaliações de efetividade dos controles';
COMMENT ON TABLE audit_logs IS 'Logs de auditoria das ações do sistema';

COMMENT ON COLUMN global_controls.type IS 'Tipo do controle: preventive, corrective, detective, deterrent';
COMMENT ON COLUMN global_controls.status IS 'Status do controle: active, inactive, draft, archived';
COMMENT ON COLUMN global_controls.frameworks IS 'Array de frameworks aplicáveis ao controle';
COMMENT ON COLUMN global_controls.effectiveness IS 'Efetividade do controle (0-100)';
COMMENT ON COLUMN global_controls.priority IS 'Prioridade do controle: low, medium, high, critical';

-- =============================================================================
-- ✅ SCRIPT CONCLUÍDO
-- =============================================================================

-- Verificar se as tabelas foram criadas corretamente
SELECT 
  'global_controls' as table_name,
  COUNT(*) as row_count
FROM global_controls
UNION ALL
SELECT 
  'control_frameworks' as table_name,
  COUNT(*) as row_count
FROM control_frameworks
UNION ALL
SELECT 
  'control_domains' as table_name,
  COUNT(*) as row_count
FROM control_domains; 