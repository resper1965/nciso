-- =============================================================================
-- 🛡️ n.CISO - Schema do Supabase
-- =============================================================================
-- Execute este script no SQL Editor do painel do Supabase

-- =============================================================================
-- 📊 TABELAS PRINCIPAIS
-- =============================================================================

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de políticas
CREATE TABLE IF NOT EXISTS policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'draft',
  version VARCHAR(20) DEFAULT '1.0',
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de controles
CREATE TABLE IF NOT EXISTS controls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255) NOT NULL,
  policy_id UUID REFERENCES policies(id),
  title VARCHAR(500) NOT NULL,
  description TEXT,
  control_type VARCHAR(100) NOT NULL,
  effectiveness_score INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active',
  implementation_date DATE,
  review_date DATE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de domínios hierárquicos
CREATE TABLE IF NOT EXISTS domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255) NOT NULL,
  parent_id UUID REFERENCES domains(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  level INTEGER DEFAULT 1,
  path VARCHAR(1000),
  status VARCHAR(50) DEFAULT 'active',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de avaliações
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255) NOT NULL,
  control_id UUID REFERENCES controls(id),
  assessor_id UUID REFERENCES users(id),
  assessment_date DATE NOT NULL,
  score INTEGER NOT NULL,
  comments TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de riscos
CREATE TABLE IF NOT EXISTS risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  likelihood INTEGER NOT NULL,
  impact INTEGER NOT NULL,
  risk_score INTEGER GENERATED ALWAYS AS (likelihood * impact) STORED,
  status VARCHAR(50) DEFAULT 'active',
  mitigation_plan TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de auditorias
CREATE TABLE IF NOT EXISTS audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  audit_type VARCHAR(100) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'planned',
  auditor_id UUID REFERENCES users(id),
  findings TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de incidentes
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  severity VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'open',
  reported_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de tickets
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT,
  priority VARCHAR(50) DEFAULT 'medium',
  status VARCHAR(50) DEFAULT 'open',
  category VARCHAR(100),
  created_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 🔐 ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para usuários
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Políticas RLS para políticas
CREATE POLICY "Users can view policies from same tenant" ON policies
  FOR SELECT USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert policies in own tenant" ON policies
  FOR INSERT WITH CHECK (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update policies in own tenant" ON policies
  FOR UPDATE USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete policies in own tenant" ON policies
  FOR DELETE USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Políticas RLS para controles
CREATE POLICY "Users can view controls from same tenant" ON controls
  FOR SELECT USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert controls in own tenant" ON controls
  FOR INSERT WITH CHECK (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update controls in own tenant" ON controls
  FOR UPDATE USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete controls in own tenant" ON controls
  FOR DELETE USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Políticas RLS para domínios
CREATE POLICY "Users can view domains from same tenant" ON domains
  FOR SELECT USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can insert domains in own tenant" ON domains
  FOR INSERT WITH CHECK (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update domains in own tenant" ON domains
  FOR UPDATE USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete domains in own tenant" ON domains
  FOR DELETE USING (tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- =============================================================================
-- 📊 ÍNDICES PARA PERFORMANCE
-- =============================================================================

-- Índices para tenant_id (filtro principal)
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_policies_tenant_id ON policies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_controls_tenant_id ON controls(tenant_id);
CREATE INDEX IF NOT EXISTS idx_domains_tenant_id ON domains(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assessments_tenant_id ON assessments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_risks_tenant_id ON risks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audits_tenant_id ON audits(tenant_id);
CREATE INDEX IF NOT EXISTS idx_incidents_tenant_id ON incidents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tickets_tenant_id ON tickets(tenant_id);

-- Índices para status
CREATE INDEX IF NOT EXISTS idx_policies_status ON policies(status);
CREATE INDEX IF NOT EXISTS idx_controls_status ON controls(status);
CREATE INDEX IF NOT EXISTS idx_domains_status ON domains(status);
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);
CREATE INDEX IF NOT EXISTS idx_risks_status ON risks(status);
CREATE INDEX IF NOT EXISTS idx_audits_status ON audits(status);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

-- Índices para datas
CREATE INDEX IF NOT EXISTS idx_policies_created_at ON policies(created_at);
CREATE INDEX IF NOT EXISTS idx_controls_created_at ON controls(created_at);
CREATE INDEX IF NOT EXISTS idx_domains_created_at ON domains(created_at);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at);
CREATE INDEX IF NOT EXISTS idx_risks_created_at ON risks(created_at);
CREATE INDEX IF NOT EXISTS idx_audits_created_at ON audits(created_at);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);

-- =============================================================================
-- 🔄 FUNÇÕES E TRIGGERS
-- =============================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_controls_updated_at BEFORE UPDATE ON controls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON domains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON risks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audits_updated_at BEFORE UPDATE ON audits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 📊 DADOS INICIAIS (OPCIONAL)
-- =============================================================================

-- Inserir usuário de desenvolvimento (opcional)
INSERT INTO users (email, name, tenant_id, role) 
VALUES ('dev@nciso.com', 'Development User', 'dev-tenant', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Inserir domínio raiz (opcional)
INSERT INTO domains (tenant_id, name, description, level, path)
VALUES ('dev-tenant', 'Segurança da Informação', 'Domínio raiz para gestão de segurança', 1, '/1')
ON CONFLICT DO NOTHING;

-- =============================================================================
-- ✅ SCRIPT CONCLUÍDO
-- =============================================================================
-- Execute este script no SQL Editor do painel do Supabase
-- Após a execução, as tabelas estarão prontas para uso 