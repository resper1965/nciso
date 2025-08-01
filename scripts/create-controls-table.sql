-- =============================================================================
-- Script para criar a tabela de controles no Supabase
-- =============================================================================

-- Criar tabela de controles
CREATE TABLE IF NOT EXISTS controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('preventive', 'corrective', 'detective', 'deterrent')),
  domain VARCHAR(100) NOT NULL CHECK (domain IN (
    'access_control',
    'asset_management',
    'business_continuity',
    'communications',
    'compliance',
    'cryptography',
    'human_resources',
    'incident_management',
    'operations',
    'physical_security',
    'risk_management',
    'security_architecture',
    'supplier_relationships',
    'system_development'
  )),
  framework VARCHAR(50) NOT NULL CHECK (framework IN ('iso27001', 'nist', 'cobit', 'custom')),
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('active', 'inactive', 'draft', 'archived')),
  effectiveness INTEGER NOT NULL DEFAULT 50 CHECK (effectiveness >= 0 AND effectiveness <= 100),
  priority VARCHAR(50) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  owner VARCHAR(255),
  tenant_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_controls_tenant_id ON controls(tenant_id);
CREATE INDEX IF NOT EXISTS idx_controls_type ON controls(type);
CREATE INDEX IF NOT EXISTS idx_controls_domain ON controls(domain);
CREATE INDEX IF NOT EXISTS idx_controls_framework ON controls(framework);
CREATE INDEX IF NOT EXISTS idx_controls_status ON controls(status);
CREATE INDEX IF NOT EXISTS idx_controls_priority ON controls(priority);
CREATE INDEX IF NOT EXISTS idx_controls_effectiveness ON controls(effectiveness);
CREATE INDEX IF NOT EXISTS idx_controls_created_at ON controls(created_at);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_controls_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_controls_updated_at_trigger
  BEFORE UPDATE ON controls
  FOR EACH ROW
  EXECUTE FUNCTION update_controls_updated_at();

-- Políticas RLS (Row Level Security)
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;

-- Política para usuários autenticados verem apenas controles do seu tenant
CREATE POLICY "Users can view controls from their tenant" ON controls
  FOR SELECT USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::text
  );

-- Política para usuários autenticados inserirem controles no seu tenant
CREATE POLICY "Users can insert controls in their tenant" ON controls
  FOR INSERT WITH CHECK (
    tenant_id = (auth.jwt() ->> 'tenant_id')::text
  );

-- Política para usuários autenticados atualizarem controles do seu tenant
CREATE POLICY "Users can update controls from their tenant" ON controls
  FOR UPDATE USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::text
  );

-- Política para usuários autenticados excluírem controles do seu tenant
CREATE POLICY "Users can delete controls from their tenant" ON controls
  FOR DELETE USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::text
  );

-- Inserir alguns controles de exemplo (ISO 27001)
INSERT INTO controls (name, description, type, domain, framework, status, effectiveness, priority, tenant_id) VALUES
(
  'A.9.2.1 - User Registration and De-registration',
  'A formal user registration and de-registration process shall be implemented to enable assignment of access rights.',
  'preventive',
  'access_control',
  'iso27001',
  'active',
  85,
  'high',
  'demo-tenant'
),
(
  'A.9.2.3 - Access Rights Management',
  'The allocation and use of privileged access rights shall be restricted and controlled.',
  'preventive',
  'access_control',
  'iso27001',
  'active',
  75,
  'high',
  'demo-tenant'
),
(
  'A.12.1.2 - Change Management',
  'Changes to information processing facilities and systems shall be controlled.',
  'preventive',
  'operations',
  'iso27001',
  'active',
  90,
  'critical',
  'demo-tenant'
),
(
  'A.13.2.1 - Network Security Management',
  'Networks shall be managed and controlled to protect information in systems and applications.',
  'preventive',
  'communications',
  'iso27001',
  'active',
  80,
  'high',
  'demo-tenant'
),
(
  'A.16.1.1 - Incident Management Process',
  'Management shall establish a process to report, assess, analyze and respond to information security incidents.',
  'detective',
  'incident_management',
  'iso27001',
  'active',
  70,
  'high',
  'demo-tenant'
);

-- Inserir controles NIST CSF
INSERT INTO controls (name, description, type, domain, framework, status, effectiveness, priority, tenant_id) VALUES
(
  'ID.AM-1 - Asset Inventory',
  'Physical devices and systems within the organization are inventoried.',
  'detective',
  'asset_management',
  'nist',
  'active',
  65,
  'medium',
  'demo-tenant'
),
(
  'PR.AC-1 - Identity Management',
  'Identities and credentials are issued, managed, verified, revoked, and audited for authorized devices, users and processes.',
  'preventive',
  'access_control',
  'nist',
  'active',
  85,
  'high',
  'demo-tenant'
),
(
  'DE.CM-1 - Network Monitoring',
  'The network is monitored to detect potential cybersecurity events.',
  'detective',
  'communications',
  'nist',
  'active',
  75,
  'high',
  'demo-tenant'
);

-- Inserir controles COBIT
INSERT INTO controls (name, description, type, domain, framework, status, effectiveness, priority, tenant_id) VALUES
(
  'APO01.01 - IT Strategy Committee',
  'Establish and maintain an IT strategy committee to provide strategic direction and ensure alignment with business objectives.',
  'preventive',
  'security_architecture',
  'cobit',
  'active',
  60,
  'medium',
  'demo-tenant'
),
(
  'BAI01.01 - Program Management',
  'Establish and maintain a program management framework to ensure that all IT-related programs are managed in alignment with business objectives.',
  'preventive',
  'operations',
  'cobit',
  'active',
  70,
  'medium',
  'demo-tenant'
);

-- Comentários na tabela
COMMENT ON TABLE controls IS 'Tabela de controles de segurança da informação';
COMMENT ON COLUMN controls.id IS 'Identificador único do controle';
COMMENT ON COLUMN controls.name IS 'Nome do controle';
COMMENT ON COLUMN controls.description IS 'Descrição detalhada do controle';
COMMENT ON COLUMN controls.type IS 'Tipo do controle: preventive, corrective, detective, deterrent';
COMMENT ON COLUMN controls.domain IS 'Domínio de segurança ao qual o controle pertence';
COMMENT ON COLUMN controls.framework IS 'Framework de segurança: iso27001, nist, cobit, custom';
COMMENT ON COLUMN controls.status IS 'Status do controle: active, inactive, draft, archived';
COMMENT ON COLUMN controls.effectiveness IS 'Efetividade do controle (0-100%)';
COMMENT ON COLUMN controls.priority IS 'Prioridade do controle: low, medium, high, critical';
COMMENT ON COLUMN controls.owner IS 'Responsável pelo controle';
COMMENT ON COLUMN controls.tenant_id IS 'Identificador do tenant (multi-tenancy)';
COMMENT ON COLUMN controls.created_at IS 'Data de criação do registro';
COMMENT ON COLUMN controls.updated_at IS 'Data da última atualização';

-- Verificar se a tabela foi criada corretamente
SELECT 
  'controls' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN framework = 'iso27001' THEN 1 END) as iso27001_controls,
  COUNT(CASE WHEN framework = 'nist' THEN 1 END) as nist_controls,
  COUNT(CASE WHEN framework = 'cobit' THEN 1 END) as cobit_controls
FROM controls; 