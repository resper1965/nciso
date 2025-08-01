-- Script para criar as tabelas do módulo ISMS
-- Execute este script no Supabase SQL Editor

-- ===== TABELA DE ORGANIZAÇÕES =====
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('company', 'department', 'unit', 'division')),
  parent_id UUID REFERENCES organizations(id),
  description TEXT,
  tenant_id VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para organizations
CREATE INDEX IF NOT EXISTS idx_organizations_tenant_id ON organizations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_organizations_parent_id ON organizations(parent_id);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(type);
CREATE INDEX IF NOT EXISTS idx_organizations_is_active ON organizations(is_active);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_organizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_organizations_updated_at();

-- ===== TABELA DE DOMÍNIOS =====
CREATE TABLE IF NOT EXISTS domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES domains(id),
  path VARCHAR(500) NOT NULL, -- breadcrumb path
  level INTEGER NOT NULL DEFAULT 1,
  tenant_id VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para domains
CREATE INDEX IF NOT EXISTS idx_domains_tenant_id ON domains(tenant_id);
CREATE INDEX IF NOT EXISTS idx_domains_parent_id ON domains(parent_id);
CREATE INDEX IF NOT EXISTS idx_domains_path ON domains(path);
CREATE INDEX IF NOT EXISTS idx_domains_level ON domains(level);
CREATE INDEX IF NOT EXISTS idx_domains_is_active ON domains(is_active);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_domains_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_domains_updated_at
  BEFORE UPDATE ON domains
  FOR EACH ROW
  EXECUTE FUNCTION update_domains_updated_at();

-- ===== TABELA DE ATIVOS =====
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('physical', 'digital', 'person', 'software', 'infrastructure', 'data')),
  owner_id UUID REFERENCES auth.users(id),
  classification JSONB NOT NULL DEFAULT '{"confidentiality": "low", "integrity": "low", "availability": "low"}',
  description TEXT,
  location VARCHAR(255),
  value DECIMAL(15,2),
  organization_id UUID REFERENCES organizations(id),
  tenant_id VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para assets
CREATE INDEX IF NOT EXISTS idx_assets_tenant_id ON assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assets_owner_id ON assets(owner_id);
CREATE INDEX IF NOT EXISTS idx_assets_organization_id ON assets(organization_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_is_active ON assets(is_active);
CREATE INDEX IF NOT EXISTS idx_assets_classification ON assets USING GIN(classification);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_assets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_assets_updated_at();

-- ===== TABELA DE ESCOPOS ISMS =====
CREATE TABLE IF NOT EXISTS isms_scopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  coverage TEXT NOT NULL, -- abrangência
  applicable_units TEXT[] DEFAULT '{}', -- unidades aplicáveis
  organization_id UUID REFERENCES organizations(id) NOT NULL,
  domain_ids UUID[] DEFAULT '{}', -- IDs dos domínios
  tenant_id VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para isms_scopes
CREATE INDEX IF NOT EXISTS idx_isms_scopes_tenant_id ON isms_scopes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_isms_scopes_organization_id ON isms_scopes(organization_id);
CREATE INDEX IF NOT EXISTS idx_isms_scopes_is_active ON isms_scopes(is_active);
CREATE INDEX IF NOT EXISTS idx_isms_scopes_domain_ids ON isms_scopes USING GIN(domain_ids);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_isms_scopes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_isms_scopes_updated_at
  BEFORE UPDATE ON isms_scopes
  FOR EACH ROW
  EXECUTE FUNCTION update_isms_scopes_updated_at();

-- ===== TABELA DE AVALIAÇÕES =====
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  domain_id UUID REFERENCES domains(id),
  control_ids UUID[] DEFAULT '{}', -- IDs dos controles
  questionnaire_data JSONB DEFAULT '{}', -- dados do questionário
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'reviewed')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  evidence_files TEXT[] DEFAULT '{}', -- URLs dos arquivos de evidência
  evaluator_id UUID REFERENCES auth.users(id),
  tenant_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para evaluations
CREATE INDEX IF NOT EXISTS idx_evaluations_tenant_id ON evaluations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_domain_id ON evaluations(domain_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_evaluator_id ON evaluations(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_status ON evaluations(status);
CREATE INDEX IF NOT EXISTS idx_evaluations_control_ids ON evaluations USING GIN(control_ids);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_evaluations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_evaluations_updated_at
  BEFORE UPDATE ON evaluations
  FOR EACH ROW
  EXECUTE FUNCTION update_evaluations_updated_at();

-- ===== RLS POLICIES =====

-- Organizations RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organizations in their tenant" ON organizations
  FOR SELECT USING (tenant_id = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Users can insert organizations in their tenant" ON organizations
  FOR INSERT WITH CHECK (tenant_id = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Users can update organizations in their tenant" ON organizations
  FOR UPDATE USING (tenant_id = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Users can delete organizations in their tenant" ON organizations
  FOR DELETE USING (tenant_id = auth.jwt() ->> 'tenant_id');

-- Domains RLS
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view domains in their tenant" ON domains
  FOR SELECT USING (tenant_id = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Users can insert domains in their tenant" ON domains
  FOR INSERT WITH CHECK (tenant_id = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Users can update domains in their tenant" ON domains
  FOR UPDATE USING (tenant_id = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Users can delete domains in their tenant" ON domains
  FOR DELETE USING (tenant_id = auth.jwt() ->> 'tenant_id');

-- Assets RLS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assets in their tenant" ON assets
  FOR SELECT USING (tenant_id = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Users can insert assets in their tenant" ON assets
  FOR INSERT WITH CHECK (tenant_id = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Users can update assets in their tenant" ON assets
  FOR UPDATE USING (tenant_id = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Users can delete assets in their tenant" ON assets
  FOR DELETE USING (tenant_id = auth.jwt() ->> 'tenant_id');

-- ISMS Scopes RLS
ALTER TABLE isms_scopes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view isms scopes in their tenant" ON isms_scopes
  FOR SELECT USING (tenant_id = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Users can insert isms scopes in their tenant" ON isms_scopes
  FOR INSERT WITH CHECK (tenant_id = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Users can update isms scopes in their tenant" ON isms_scopes
  FOR UPDATE USING (tenant_id = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Users can delete isms scopes in their tenant" ON isms_scopes
  FOR DELETE USING (tenant_id = auth.jwt() ->> 'tenant_id');

-- Evaluations RLS
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view evaluations in their tenant" ON evaluations
  FOR SELECT USING (tenant_id = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Users can insert evaluations in their tenant" ON evaluations
  FOR INSERT WITH CHECK (tenant_id = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Users can update evaluations in their tenant" ON evaluations
  FOR UPDATE USING (tenant_id = auth.jwt() ->> 'tenant_id');

CREATE POLICY "Users can delete evaluations in their tenant" ON evaluations
  FOR DELETE USING (tenant_id = auth.jwt() ->> 'tenant_id');

-- ===== DADOS DE EXEMPLO =====

-- Organizações de exemplo
INSERT INTO organizations (name, type, description, tenant_id) VALUES
('Empresa Exemplo Ltda', 'company', 'Empresa principal do sistema', 'default'),
('TI', 'department', 'Departamento de Tecnologia da Informação', 'default'),
('Segurança', 'unit', 'Unidade de Segurança da Informação', 'default'),
('Infraestrutura', 'unit', 'Unidade de Infraestrutura', 'default'),
('Desenvolvimento', 'unit', 'Unidade de Desenvolvimento', 'default'),
('RH', 'department', 'Departamento de Recursos Humanos', 'default'),
('Financeiro', 'department', 'Departamento Financeiro', 'default');

-- Atualizar parent_id das organizações
UPDATE organizations SET parent_id = (SELECT id FROM organizations WHERE name = 'TI' AND type = 'department') WHERE name IN ('Segurança', 'Infraestrutura', 'Desenvolvimento');
UPDATE organizations SET parent_id = (SELECT id FROM organizations WHERE name = 'Empresa Exemplo Ltda' AND type = 'company') WHERE name IN ('TI', 'RH', 'Financeiro');

-- Domínios de exemplo (baseados nos 14 domínios de segurança)
INSERT INTO domains (name, description, path, level, tenant_id) VALUES
('Políticas de Segurança', 'Políticas e procedimentos de segurança da informação', 'Políticas de Segurança', 1, 'default'),
('Organização da Segurança', 'Estrutura organizacional para segurança da informação', 'Organização da Segurança', 1, 'default'),
('Gestão de Recursos Humanos', 'Segurança em recursos humanos', 'Gestão de Recursos Humanos', 1, 'default'),
('Gestão de Ativos', 'Inventário e classificação de ativos', 'Gestão de Ativos', 1, 'default'),
('Controle de Acesso', 'Controle de acesso lógico e físico', 'Controle de Acesso', 1, 'default'),
('Criptografia', 'Controles criptográficos', 'Criptografia', 1, 'default'),
('Segurança Física e Ambiental', 'Proteção física e ambiental', 'Segurança Física e Ambiental', 1, 'default'),
('Segurança Operacional', 'Procedimentos e responsabilidades operacionais', 'Segurança Operacional', 1, 'default'),
('Segurança das Comunicações', 'Segurança em redes e comunicações', 'Segurança das Comunicações', 1, 'default'),
('Aquisição, Desenvolvimento e Manutenção de Sistemas', 'Segurança no ciclo de vida dos sistemas', 'Aquisição, Desenvolvimento e Manutenção de Sistemas', 1, 'default'),
('Relacionamentos com Fornecedores', 'Segurança em relacionamentos com terceiros', 'Relacionamentos com Fornecedores', 1, 'default'),
('Gestão de Incidentes de Segurança', 'Gestão de incidentes e melhorias', 'Gestão de Incidentes de Segurança', 1, 'default'),
('Aspectos de Segurança da Informação na Gestão da Continuidade do Negócio', 'Continuidade do negócio', 'Aspectos de Segurança da Informação na Gestão da Continuidade do Negócio', 1, 'default'),
('Conformidade', 'Conformidade com requisitos legais e regulamentares', 'Conformidade', 1, 'default');

-- Subdomínios de exemplo
INSERT INTO domains (name, description, parent_id, path, level, tenant_id) VALUES
('Políticas de Segurança da Informação', 'Políticas de segurança da informação', (SELECT id FROM domains WHERE name = 'Políticas de Segurança'), 'Políticas de Segurança > Políticas de Segurança da Informação', 2, 'default'),
('Controle de Acesso Lógico', 'Controle de acesso a sistemas', (SELECT id FROM domains WHERE name = 'Controle de Acesso'), 'Controle de Acesso > Controle de Acesso Lógico', 2, 'default'),
('Controle de Acesso Físico', 'Controle de acesso físico', (SELECT id FROM domains WHERE name = 'Controle de Acesso'), 'Controle de Acesso > Controle de Acesso Físico', 2, 'default');

-- Ativos de exemplo
INSERT INTO assets (name, type, classification, description, organization_id, tenant_id) VALUES
('Servidor Principal', 'infrastructure', '{"confidentiality": "high", "integrity": "high", "availability": "critical"}', 'Servidor principal da empresa', (SELECT id FROM organizations WHERE name = 'Infraestrutura'), 'default'),
('Base de Dados RH', 'data', '{"confidentiality": "critical", "integrity": "high", "availability": "high"}', 'Base de dados de recursos humanos', (SELECT id FROM organizations WHERE name = 'RH'), 'default'),
('Sistema ERP', 'software', '{"confidentiality": "high", "integrity": "high", "availability": "high"}', 'Sistema ERP da empresa', (SELECT id FROM organizations WHERE name = 'Desenvolvimento'), 'default'),
('João Silva', 'person', '{"confidentiality": "medium", "integrity": "medium", "availability": "medium"}', 'Administrador de sistemas', (SELECT id FROM organizations WHERE name = 'TI'), 'default'),
('Datacenter', 'physical', '{"confidentiality": "high", "integrity": "high", "availability": "critical"}', 'Datacenter principal', (SELECT id FROM organizations WHERE name = 'Infraestrutura'), 'default');

-- Escopos ISMS de exemplo
INSERT INTO isms_scopes (name, description, coverage, applicable_units, organization_id, domain_ids, tenant_id) VALUES
('Escopo Principal', 'Escopo principal do SGSI da empresa', 'Toda a empresa e suas operações', ARRAY[(SELECT id::text FROM organizations WHERE name = 'TI'), (SELECT id::text FROM organizations WHERE name = 'RH')], (SELECT id FROM organizations WHERE name = 'Empresa Exemplo Ltda'), ARRAY[(SELECT id FROM domains WHERE name = 'Políticas de Segurança'), (SELECT id FROM domains WHERE name = 'Controle de Acesso')], 'default'),
('Escopo TI', 'Escopo específico para TI', 'Departamento de TI e suas operações', ARRAY[(SELECT id::text FROM organizations WHERE name = 'Segurança'), (SELECT id::text FROM organizations WHERE name = 'Infraestrutura')], (SELECT id FROM organizations WHERE name = 'TI'), ARRAY[(SELECT id FROM domains WHERE name = 'Segurança Operacional'), (SELECT id FROM domains WHERE name = 'Aquisição, Desenvolvimento e Manutenção de Sistemas')], 'default');

-- Mensagem de conclusão
SELECT 'Tabelas ISMS criadas com sucesso!' as message; 