-- Create evaluations tables for n.ISMS Story 5: Avaliações Estruturadas

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
  control_id UUID REFERENCES controls(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('multiple_choice', 'yes_no', 'scale', 'text', 'file')),
  options TEXT[], -- For multiple choice questions
  scale_min INTEGER DEFAULT 1,
  scale_max INTEGER DEFAULT 5,
  scale_labels TEXT[], -- Custom labels for scale questions
  required BOOLEAN DEFAULT false,
  weight INTEGER DEFAULT 1 CHECK (weight >= 1 AND weight <= 10),
  order_index INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  tenant_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evaluations table
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  scope_id UUID REFERENCES isms_scopes(id) ON DELETE CASCADE,
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
  control_id UUID REFERENCES controls(id) ON DELETE SET NULL,
  evaluator_id UUID REFERENCES users(id),
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'reviewed')),
  start_date DATE NOT NULL,
  end_date DATE,
  total_score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 0,
  percentage_score DECIMAL(5,2) DEFAULT 0,
  evidence_count INTEGER DEFAULT 0,
  notes TEXT,
  tenant_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evaluation responses table
CREATE TABLE IF NOT EXISTS evaluation_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID REFERENCES evaluations(id) ON DELETE CASCADE,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  response_value TEXT, -- Can be string, number, or boolean
  response_text TEXT,
  evidence_files TEXT[], -- Array of file names/paths
  score INTEGER DEFAULT 0,
  max_score INTEGER DEFAULT 100,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(evaluation_id, question_id)
);

-- Evaluation templates table
CREATE TABLE IF NOT EXISTS evaluation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
  control_id UUID REFERENCES controls(id) ON DELETE SET NULL,
  total_weight INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  tenant_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_questions_domain_id ON questions(domain_id);
CREATE INDEX IF NOT EXISTS idx_questions_control_id ON questions(control_id);
CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(active);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(order_index);

CREATE INDEX IF NOT EXISTS idx_evaluations_scope_id ON evaluations(scope_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_domain_id ON evaluations(domain_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_control_id ON evaluations(control_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_status ON evaluations(status);
CREATE INDEX IF NOT EXISTS idx_evaluations_evaluator_id ON evaluations(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_start_date ON evaluations(start_date);

CREATE INDEX IF NOT EXISTS idx_evaluation_responses_evaluation_id ON evaluation_responses(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_responses_question_id ON evaluation_responses(question_id);

CREATE INDEX IF NOT EXISTS idx_evaluation_templates_domain_id ON evaluation_templates(domain_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_templates_active ON evaluation_templates(active);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_evaluations_updated_at BEFORE UPDATE ON evaluations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_evaluation_responses_updated_at BEFORE UPDATE ON evaluation_responses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_evaluation_templates_updated_at BEFORE UPDATE ON evaluation_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for questions
CREATE POLICY "Users can view questions for their tenant" ON questions
  FOR SELECT USING (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

CREATE POLICY "Users can insert questions for their tenant" ON questions
  FOR INSERT WITH CHECK (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

CREATE POLICY "Users can update questions for their tenant" ON questions
  FOR UPDATE USING (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

CREATE POLICY "Users can delete questions for their tenant" ON questions
  FOR DELETE USING (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

-- RLS Policies for evaluations
CREATE POLICY "Users can view evaluations for their tenant" ON evaluations
  FOR SELECT USING (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

CREATE POLICY "Users can insert evaluations for their tenant" ON evaluations
  FOR INSERT WITH CHECK (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

CREATE POLICY "Users can update evaluations for their tenant" ON evaluations
  FOR UPDATE USING (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

CREATE POLICY "Users can delete evaluations for their tenant" ON evaluations
  FOR DELETE USING (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

-- RLS Policies for evaluation_responses
CREATE POLICY "Users can view evaluation responses for their tenant" ON evaluation_responses
  FOR SELECT USING (
    evaluation_id IN (
      SELECT id FROM evaluations WHERE tenant_id = (auth.jwt() ->> 'user_id')::uuid
    )
  );

CREATE POLICY "Users can insert evaluation responses for their tenant" ON evaluation_responses
  FOR INSERT WITH CHECK (
    evaluation_id IN (
      SELECT id FROM evaluations WHERE tenant_id = (auth.jwt() ->> 'user_id')::uuid
    )
  );

CREATE POLICY "Users can update evaluation responses for their tenant" ON evaluation_responses
  FOR UPDATE USING (
    evaluation_id IN (
      SELECT id FROM evaluations WHERE tenant_id = (auth.jwt() ->> 'user_id')::uuid
    )
  );

CREATE POLICY "Users can delete evaluation responses for their tenant" ON evaluation_responses
  FOR DELETE USING (
    evaluation_id IN (
      SELECT id FROM evaluations WHERE tenant_id = (auth.jwt() ->> 'user_id')::uuid
    )
  );

-- RLS Policies for evaluation_templates
CREATE POLICY "Users can view evaluation templates for their tenant" ON evaluation_templates
  FOR SELECT USING (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

CREATE POLICY "Users can insert evaluation templates for their tenant" ON evaluation_templates
  FOR INSERT WITH CHECK (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

CREATE POLICY "Users can update evaluation templates for their tenant" ON evaluation_templates
  FOR UPDATE USING (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

CREATE POLICY "Users can delete evaluation templates for their tenant" ON evaluation_templates
  FOR DELETE USING (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

-- Insert sample questions for different domains
INSERT INTO questions (domain_id, question_text, question_type, required, weight, order_index, active, tenant_id) VALUES
-- Security Policy Questions
('550e8400-e29b-41d4-a716-446655440001', 'A organização possui uma política de segurança da informação documentada?', 'yes_no', true, 5, 1, true, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440001', 'A política de segurança é revisada anualmente?', 'yes_no', true, 3, 2, true, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440001', 'Como você avalia a efetividade da política de segurança?', 'scale', false, 2, 3, true, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440001', 'Descreva os principais pontos da política de segurança:', 'text', false, 4, 4, true, '550e8400-e29b-41d4-a716-446655440000'),

-- Access Control Questions
('550e8400-e29b-41d4-a716-446655440002', 'Existe um processo formal de gerenciamento de acesso?', 'yes_no', true, 5, 1, true, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440002', 'Os usuários são autenticados antes de acessar sistemas?', 'yes_no', true, 4, 2, true, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440002', 'Qual o nível de segurança do controle de acesso?', 'multiple_choice', false, 3, 3, true, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440002', 'Upload de evidências de controle de acesso:', 'file', false, 2, 4, true, '550e8400-e29b-41d4-a716-446655440000'),

-- Asset Management Questions
('550e8400-e29b-41d4-a716-446655440003', 'Existe um inventário atualizado de ativos de TI?', 'yes_no', true, 4, 1, true, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440003', 'Os ativos são classificados por criticidade?', 'yes_no', true, 3, 2, true, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440003', 'Qual a frequência de atualização do inventário?', 'multiple_choice', false, 2, 3, true, '550e8400-e29b-41d4-a716-446655440000'),

-- Incident Management Questions
('550e8400-e29b-41d4-a716-446655440004', 'Existe um processo de resposta a incidentes?', 'yes_no', true, 5, 1, true, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440004', 'Qual o tempo médio de resposta a incidentes?', 'scale', false, 4, 2, true, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440004', 'Descreva o último incidente de segurança:', 'text', false, 3, 3, true, '550e8400-e29b-41d4-a716-446655440000');

-- Update questions with options for multiple choice questions
UPDATE questions SET 
  options = ARRAY['Baixo', 'Médio', 'Alto', 'Crítico'],
  scale_labels = ARRAY['Muito Ineficaz', 'Ineficaz', 'Neutro', 'Eficaz', 'Muito Eficaz'],
  scale_min = 1,
  scale_max = 5
WHERE question_text LIKE '%nível de segurança%';

UPDATE questions SET 
  options = ARRAY['Mensal', 'Trimestral', 'Semestral', 'Anual'],
  scale_labels = ARRAY['Muito Lento', 'Lento', 'Adequado', 'Rápido', 'Muito Rápido'],
  scale_min = 1,
  scale_max = 5
WHERE question_text LIKE '%frequência de atualização%';

UPDATE questions SET 
  scale_labels = ARRAY['Muito Lento', 'Lento', 'Adequado', 'Rápido', 'Muito Rápido'],
  scale_min = 1,
  scale_max = 5
WHERE question_text LIKE '%tempo médio de resposta%';

-- Insert sample evaluations
INSERT INTO evaluations (name, description, scope_id, domain_id, evaluator_id, status, start_date, total_score, max_score, percentage_score, evidence_count, notes, tenant_id) VALUES
('Avaliação de Segurança - Q1 2024', 'Avaliação trimestral de controles de segurança', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'completed', '2024-01-15', 85, 100, 85.0, 12, 'Avaliação concluída com sucesso', '550e8400-e29b-41d4-a716-446655440000'),
('Avaliação de Controles de Acesso', 'Avaliação específica de controles de acesso', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'in_progress', '2024-02-01', 45, 100, 45.0, 5, 'Avaliação em andamento', '550e8400-e29b-41d4-a716-446655440000'),
('Avaliação de Gestão de Ativos', 'Avaliação do processo de gestão de ativos', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'draft', '2024-02-15', 0, 100, 0.0, 0, 'Avaliação planejada', '550e8400-e29b-41d4-a716-446655440000');

-- Insert sample evaluation responses
INSERT INTO evaluation_responses (evaluation_id, question_id, response_value, response_text, evidence_files, score, max_score, notes) VALUES
-- Responses for first evaluation (Security Policy)
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'true', NULL, NULL, 100, 100, 'Política documentada e acessível'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'true', NULL, NULL, 100, 100, 'Revisão anual realizada'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '4', NULL, NULL, 80, 100, 'Avaliação positiva dos stakeholders'),
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440004', NULL, 'A política inclui diretrizes claras sobre confidencialidade, integridade e disponibilidade dos dados. Todos os funcionários receberam treinamento sobre a política.', NULL, 90, 100, 'Descrição detalhada fornecida'),

-- Responses for second evaluation (Access Control)
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440005', 'true', NULL, NULL, 100, 100, 'Processo formal implementado'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', 'true', NULL, NULL, 100, 100, 'Autenticação obrigatória'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440007', 'Alto', NULL, NULL, 75, 100, 'Controle de acesso robusto'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440008', NULL, NULL, ARRAY['access_control_evidence.pdf'], 60, 100, 'Evidências anexadas');

-- Insert sample evaluation templates
INSERT INTO evaluation_templates (name, description, domain_id, total_weight, active, tenant_id) VALUES
('Template ISO 27001 - Políticas de Segurança', 'Template para avaliação de políticas de segurança baseado na ISO 27001', '550e8400-e29b-41d4-a716-446655440001', 14, true, '550e8400-e29b-41d4-a716-446655440000'),
('Template Controles de Acesso', 'Template para avaliação de controles de acesso', '550e8400-e29b-41d4-a716-446655440002', 14, true, '550e8400-e29b-41d4-a716-446655440000'),
('Template Gestão de Ativos', 'Template para avaliação de gestão de ativos', '550e8400-e29b-41d4-a716-446655440003', 9, true, '550e8400-e29b-41d4-a716-446655440000'),
('Template Gestão de Incidentes', 'Template para avaliação de gestão de incidentes', '550e8400-e29b-41d4-a716-446655440004', 12, true, '550e8400-e29b-41d4-a716-446655440000');

COMMIT; 