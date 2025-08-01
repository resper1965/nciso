-- Create credentials registry table for n.ISMS Epic - Credentials Governance

-- Credentials registry table
CREATE TABLE IF NOT EXISTS credentials_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  access_type VARCHAR(20) NOT NULL CHECK (access_type IN ('read', 'write', 'admin', 'full')),
  justification TEXT NOT NULL,
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  tenant_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_user_or_team CHECK (
    (user_id IS NOT NULL AND team_id IS NULL) OR 
    (user_id IS NULL AND team_id IS NOT NULL)
  ),
  CONSTRAINT check_valid_dates CHECK (valid_until > valid_from)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_credentials_registry_asset_id ON credentials_registry(asset_id);
CREATE INDEX IF NOT EXISTS idx_credentials_registry_user_id ON credentials_registry(user_id);
CREATE INDEX IF NOT EXISTS idx_credentials_registry_team_id ON credentials_registry(team_id);
CREATE INDEX IF NOT EXISTS idx_credentials_registry_access_type ON credentials_registry(access_type);
CREATE INDEX IF NOT EXISTS idx_credentials_registry_is_active ON credentials_registry(is_active);
CREATE INDEX IF NOT EXISTS idx_credentials_registry_valid_until ON credentials_registry(valid_until);
CREATE INDEX IF NOT EXISTS idx_credentials_registry_approved_by ON credentials_registry(approved_by);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_credentials_registry_updated_at BEFORE UPDATE ON credentials_registry FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE credentials_registry ENABLE ROW LEVEL SECURITY;

-- RLS Policies for credentials_registry
CREATE POLICY "Users can view credentials for their tenant" ON credentials_registry
  FOR SELECT USING (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

CREATE POLICY "Users can insert credentials for their tenant" ON credentials_registry
  FOR INSERT WITH CHECK (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

CREATE POLICY "Users can update credentials for their tenant" ON credentials_registry
  FOR UPDATE USING (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

CREATE POLICY "Users can delete credentials for their tenant" ON credentials_registry
  FOR DELETE USING (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

-- Create teams table if not exists (for team-based credentials)
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  tenant_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for teams
CREATE INDEX IF NOT EXISTS idx_teams_tenant_id ON teams(tenant_id);

-- Create updated_at trigger for teams
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS for teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams
CREATE POLICY "Users can view teams for their tenant" ON teams
  FOR SELECT USING (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

CREATE POLICY "Users can insert teams for their tenant" ON teams
  FOR INSERT WITH CHECK (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

CREATE POLICY "Users can update teams for their tenant" ON teams
  FOR UPDATE USING (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

CREATE POLICY "Users can delete teams for their tenant" ON teams
  FOR DELETE USING (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

-- Insert sample teams
INSERT INTO teams (id, name, description, tenant_id) VALUES
('550e8400-e29b-41d4-a716-446655440010', 'IT Support Team', 'Equipe de suporte técnico', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440011', 'Security Team', 'Equipe de segurança', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440012', 'Development Team', 'Equipe de desenvolvimento', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440013', 'Operations Team', 'Equipe de operações', '550e8400-e29b-41d4-a716-446655440000');

-- Insert sample credentials registry
INSERT INTO credentials_registry (asset_id, user_id, team_id, access_type, justification, valid_from, valid_until, is_active, approved_by, approved_at, tenant_id) VALUES
-- Individual user credentials
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', NULL, 'admin', 'Administrador do sistema de rede corporativa', '2024-01-01', '2024-12-31', true, '550e8400-e29b-41d4-a716-446655440000', '2024-01-01 10:00:00+00', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', NULL, 'read', 'Acesso para backup e recuperação de dados', '2024-01-01', '2024-12-31', true, '550e8400-e29b-41d4-a716-446655440000', '2024-01-01 10:00:00+00', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', NULL, 'full', 'Desenvolvedor principal do sistema ERP', '2024-01-01', '2024-12-31', true, '550e8400-e29b-41d4-a716-446655440000', '2024-01-01 10:00:00+00', '550e8400-e29b-41d4-a716-446655440000'),

-- Team-based credentials
('550e8400-e29b-41d4-a716-446655440001', NULL, '550e8400-e29b-41d4-a716-446655440010', 'write', 'Equipe de suporte precisa de acesso para manutenção', '2024-01-01', '2024-12-31', true, '550e8400-e29b-41d4-a716-446655440000', '2024-01-01 10:00:00+00', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440002', NULL, '550e8400-e29b-41d4-a716-446655440011', 'admin', 'Equipe de segurança precisa de acesso administrativo para auditoria', '2024-01-01', '2024-12-31', true, '550e8400-e29b-41d4-a716-446655440000', '2024-01-01 10:00:00+00', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440003', NULL, '550e8400-e29b-41d4-a716-446655440012', 'write', 'Equipe de desenvolvimento precisa de acesso para manutenção do sistema', '2024-01-01', '2024-12-31', true, '550e8400-e29b-41d4-a716-446655440000', '2024-01-01 10:00:00+00', '550e8400-e29b-41d4-a716-446655440000'),

-- Pending approval credentials
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', NULL, 'read', 'Acesso temporário para análise de logs', '2024-06-01', '2024-06-30', true, NULL, NULL, '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440002', NULL, '550e8400-e29b-41d4-a716-446655440013', 'write', 'Equipe de operações precisa de acesso para monitoramento', '2024-06-01', '2024-12-31', true, NULL, NULL, '550e8400-e29b-41d4-a716-446655440000'),

-- Expired credentials
('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', NULL, 'admin', 'Acesso temporário expirado', '2024-01-01', '2024-05-31', false, '550e8400-e29b-41d4-a716-446655440000', '2024-01-01 10:00:00+00', '550e8400-e29b-41d4-a716-446655440000'),

-- Expiring soon credentials
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', NULL, 'full', 'Acesso de desenvolvedor expirando em breve', '2024-01-01', '2024-07-15', true, '550e8400-e29b-41d4-a716-446655440000', '2024-01-01 10:00:00+00', '550e8400-e29b-41d4-a716-446655440000');

COMMIT; 