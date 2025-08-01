-- =============================================================================
-- Script para criar tabelas de frameworks no Supabase
-- =============================================================================

-- Criar tabela de frameworks
CREATE TABLE IF NOT EXISTS frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  description TEXT,
  controls_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de controles de framework
CREATE TABLE IF NOT EXISTS framework_controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id UUID REFERENCES frameworks(id) ON DELETE CASCADE,
  code VARCHAR(100) NOT NULL, -- ex: "A.9.2.1", "ID.AM-1", "APO01.01"
  name VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(100),
  domain VARCHAR(100),
  priority VARCHAR(50) CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  type VARCHAR(50) CHECK (type IN ('preventive', 'corrective', 'detective', 'deterrent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_frameworks_name ON frameworks(name);
CREATE INDEX IF NOT EXISTS idx_frameworks_is_active ON frameworks(is_active);
CREATE INDEX IF NOT EXISTS idx_frameworks_created_at ON frameworks(created_at);

CREATE INDEX IF NOT EXISTS idx_framework_controls_framework_id ON framework_controls(framework_id);
CREATE INDEX IF NOT EXISTS idx_framework_controls_code ON framework_controls(code);
CREATE INDEX IF NOT EXISTS idx_framework_controls_domain ON framework_controls(domain);
CREATE INDEX IF NOT EXISTS idx_framework_controls_type ON framework_controls(type);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_frameworks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_framework_controls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER update_frameworks_updated_at_trigger
  BEFORE UPDATE ON frameworks
  FOR EACH ROW
  EXECUTE FUNCTION update_frameworks_updated_at();

CREATE TRIGGER update_framework_controls_updated_at_trigger
  BEFORE UPDATE ON framework_controls
  FOR EACH ROW
  EXECUTE FUNCTION update_framework_controls_updated_at();

-- Políticas RLS (Row Level Security)
ALTER TABLE frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE framework_controls ENABLE ROW LEVEL SECURITY;

-- Políticas para frameworks
CREATE POLICY "Users can view all frameworks" ON frameworks
  FOR SELECT USING (true);

CREATE POLICY "Users can insert frameworks" ON frameworks
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update frameworks" ON frameworks
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete frameworks" ON frameworks
  FOR DELETE USING (true);

-- Políticas para framework_controls
CREATE POLICY "Users can view all framework controls" ON framework_controls
  FOR SELECT USING (true);

CREATE POLICY "Users can insert framework controls" ON framework_controls
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update framework controls" ON framework_controls
  FOR UPDATE USING (true);

CREATE POLICY "Users can delete framework controls" ON framework_controls
  FOR DELETE USING (true);

-- Inserir frameworks padrão
INSERT INTO frameworks (name, version, description, controls_count, is_active) VALUES
(
  'ISO 27001',
  '2022',
  'Information Security Management System (ISMS) controls based on ISO/IEC 27001:2022',
  93,
  true
),
(
  'NIST CSF',
  '2.0',
  'NIST Cybersecurity Framework for improving critical infrastructure cybersecurity',
  108,
  true
),
(
  'COBIT',
  '2019',
  'Control Objectives for Information and Related Technologies framework',
  40,
  true
)
ON CONFLICT (name) DO NOTHING;

-- Inserir alguns controles de exemplo para ISO 27001
INSERT INTO framework_controls (framework_id, code, name, description, category, domain, priority, type) 
SELECT 
  f.id,
  c.code,
  c.name,
  c.description,
  c.category,
  c.domain,
  c.priority,
  c.type
FROM frameworks f
CROSS JOIN (VALUES
  ('A.9.2.1', 'User Registration and De-registration', 'A formal user registration and de-registration process shall be implemented to enable assignment of access rights.', 'Access Control', 'access_control', 'high', 'preventive'),
  ('A.9.2.3', 'Access Rights Management', 'The allocation and use of privileged access rights shall be restricted and controlled.', 'Access Control', 'access_control', 'high', 'preventive'),
  ('A.12.1.2', 'Change Management', 'Changes to information processing facilities and systems shall be controlled.', 'Operations Security', 'operations', 'critical', 'preventive'),
  ('A.13.2.1', 'Network Security Management', 'Networks shall be managed and controlled to protect information in systems and applications.', 'Communications Security', 'communications', 'high', 'preventive'),
  ('A.16.1.1', 'Incident Management Process', 'Management shall establish a process to report, assess, analyze and respond to information security incidents.', 'Information Security Incident Management', 'incident_management', 'high', 'detective')
) AS c(code, name, description, category, domain, priority, type)
WHERE f.name = 'ISO 27001';

-- Inserir alguns controles de exemplo para NIST CSF
INSERT INTO framework_controls (framework_id, code, name, description, category, domain, priority, type) 
SELECT 
  f.id,
  c.code,
  c.name,
  c.description,
  c.category,
  c.domain,
  c.priority,
  c.type
FROM frameworks f
CROSS JOIN (VALUES
  ('ID.AM-1', 'Asset Inventory', 'Physical devices and systems within the organization are inventoried.', 'Asset Management', 'asset_management', 'medium', 'detective'),
  ('PR.AC-1', 'Identity Management', 'Identities and credentials are issued, managed, verified, revoked, and audited for authorized devices, users and processes.', 'Access Control', 'access_control', 'high', 'preventive'),
  ('DE.CM-1', 'Network Monitoring', 'The network is monitored to detect potential cybersecurity events.', 'Detection Process', 'communications', 'high', 'detective')
) AS c(code, name, description, category, domain, priority, type)
WHERE f.name = 'NIST CSF';

-- Inserir alguns controles de exemplo para COBIT
INSERT INTO framework_controls (framework_id, code, name, description, category, domain, priority, type) 
SELECT 
  f.id,
  c.code,
  c.name,
  c.description,
  c.category,
  c.domain,
  c.priority,
  c.type
FROM frameworks f
CROSS JOIN (VALUES
  ('APO01.01', 'IT Strategy Committee', 'Establish and maintain an IT strategy committee to provide strategic direction and ensure alignment with business objectives.', 'Strategic Alignment', 'security_architecture', 'medium', 'preventive'),
  ('BAI01.01', 'Program Management', 'Establish and maintain a program management framework to ensure that all IT-related programs are managed in alignment with business objectives.', 'Program Management', 'operations', 'medium', 'preventive')
) AS c(code, name, description, category, domain, priority, type)
WHERE f.name = 'COBIT';

-- Atualizar contagem de controles
UPDATE frameworks 
SET controls_count = (
  SELECT COUNT(*) 
  FROM framework_controls 
  WHERE framework_controls.framework_id = frameworks.id
);

-- Comentários nas tabelas
COMMENT ON TABLE frameworks IS 'Tabela de frameworks de controle de segurança';
COMMENT ON COLUMN frameworks.id IS 'Identificador único do framework';
COMMENT ON COLUMN frameworks.name IS 'Nome do framework';
COMMENT ON COLUMN frameworks.version IS 'Versão do framework';
COMMENT ON COLUMN frameworks.description IS 'Descrição do framework';
COMMENT ON COLUMN frameworks.controls_count IS 'Número de controles no framework';
COMMENT ON COLUMN frameworks.is_active IS 'Se o framework está ativo';
COMMENT ON COLUMN frameworks.created_at IS 'Data de criação';
COMMENT ON COLUMN frameworks.updated_at IS 'Data da última atualização';

COMMENT ON TABLE framework_controls IS 'Tabela de controles específicos de cada framework';
COMMENT ON COLUMN framework_controls.id IS 'Identificador único do controle';
COMMENT ON COLUMN framework_controls.framework_id IS 'Referência ao framework';
COMMENT ON COLUMN framework_controls.code IS 'Código do controle (ex: A.9.2.1)';
COMMENT ON COLUMN framework_controls.name IS 'Nome do controle';
COMMENT ON COLUMN framework_controls.description IS 'Descrição do controle';
COMMENT ON COLUMN framework_controls.category IS 'Categoria do controle';
COMMENT ON COLUMN framework_controls.domain IS 'Domínio de segurança';
COMMENT ON COLUMN framework_controls.priority IS 'Prioridade do controle';
COMMENT ON COLUMN framework_controls.type IS 'Tipo do controle';

-- Verificar se as tabelas foram criadas corretamente
SELECT 
  'frameworks' as table_name,
  COUNT(*) as total_frameworks,
  COUNT(CASE WHEN is_active THEN 1 END) as active_frameworks
FROM frameworks
UNION ALL
SELECT 
  'framework_controls' as table_name,
  COUNT(*) as total_controls,
  COUNT(DISTINCT framework_id) as frameworks_with_controls
FROM framework_controls; 