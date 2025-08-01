-- Create privileged access table for n.ISMS Epic - Privileged Access Management

-- Privileged access table
CREATE TABLE IF NOT EXISTS privileged_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  scope_type VARCHAR(50) NOT NULL CHECK (scope_type IN ('system', 'database', 'network', 'application', 'infrastructure')),
  scope_id VARCHAR(255) NOT NULL,
  access_level VARCHAR(20) NOT NULL CHECK (access_level IN ('read', 'write', 'admin', 'super_admin')),
  justification TEXT NOT NULL,
  valid_from DATE NOT NULL,
  valid_until DATE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  last_audit_date TIMESTAMP WITH TIME ZONE,
  audit_notes TEXT,
  tenant_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT check_valid_dates CHECK (valid_until > valid_from)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_privileged_access_user_id ON privileged_access(user_id);
CREATE INDEX IF NOT EXISTS idx_privileged_access_scope_type ON privileged_access(scope_type);
CREATE INDEX IF NOT EXISTS idx_privileged_access_scope_id ON privileged_access(scope_id);
CREATE INDEX IF NOT EXISTS idx_privileged_access_access_level ON privileged_access(access_level);
CREATE INDEX IF NOT EXISTS idx_privileged_access_is_active ON privileged_access(is_active);
CREATE INDEX IF NOT EXISTS idx_privileged_access_valid_until ON privileged_access(valid_until);
CREATE INDEX IF NOT EXISTS idx_privileged_access_approved_by ON privileged_access(approved_by);
CREATE INDEX IF NOT EXISTS idx_privileged_access_last_audit_date ON privileged_access(last_audit_date);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_privileged_access_updated_at BEFORE UPDATE ON privileged_access FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE privileged_access ENABLE ROW LEVEL SECURITY;

-- RLS Policies for privileged_access
CREATE POLICY "Users can view privileged access for their tenant" ON privileged_access
  FOR SELECT USING (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

CREATE POLICY "Users can insert privileged access for their tenant" ON privileged_access
  FOR INSERT WITH CHECK (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

CREATE POLICY "Users can update privileged access for their tenant" ON privileged_access
  FOR UPDATE USING (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

CREATE POLICY "Users can delete privileged access for their tenant" ON privileged_access
  FOR DELETE USING (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

-- Insert sample privileged access
INSERT INTO privileged_access (user_id, scope_type, scope_id, access_level, justification, valid_from, valid_until, is_active, approved_by, approved_at, last_audit_date, audit_notes, tenant_id) VALUES
-- System administrators
('550e8400-e29b-41d4-a716-446655440000', 'system', 'prod-server-01', 'super_admin', 'System administrator for production server maintenance', '2024-01-01', '2024-12-31', true, '550e8400-e29b-41d4-a716-446655440000', '2024-01-01 10:00:00+00', '2024-03-15 14:30:00+00', 'Quarterly audit completed - access still required for system maintenance', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440000', 'system', 'prod-server-02', 'admin', 'Database administrator for production database', '2024-01-01', '2024-12-31', true, '550e8400-e29b-41d4-a716-446655440000', '2024-01-01 10:00:00+00', '2024-04-01 09:15:00+00', 'Monthly audit - access justified for database management', '550e8400-e29b-41d4-a716-446655440000'),

-- Database access
('550e8400-e29b-41d4-a716-446655440000', 'database', 'postgres-prod', 'admin', 'Database administrator for production PostgreSQL', '2024-01-01', '2024-12-31', true, '550e8400-e29b-41d4-a716-446655440000', '2024-01-01 10:00:00+00', '2024-03-20 16:45:00+00', 'Audit completed - access required for database administration', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440000', 'database', 'mysql-prod', 'write', 'Application developer access to production MySQL', '2024-01-01', '2024-12-31', true, '550e8400-e29b-41d4-a716-446655440000', '2024-01-01 10:00:00+00', NULL, NULL, '550e8400-e29b-41d4-a716-446655440000'),

-- Network access
('550e8400-e29b-41d4-a716-446655440000', 'network', 'core-switch-01', 'admin', 'Network administrator for core network infrastructure', '2024-01-01', '2024-12-31', true, '550e8400-e29b-41d4-a716-446655440000', '2024-01-01 10:00:00+00', '2024-02-28 11:20:00+00', 'Network audit completed - access required for infrastructure management', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440000', 'network', 'firewall-prod', 'super_admin', 'Security administrator for production firewall', '2024-01-01', '2024-12-31', true, '550e8400-e29b-41d4-a716-446655440000', '2024-01-01 10:00:00+00', '2024-04-10 13:30:00+00', 'Security audit completed - access justified for firewall management', '550e8400-e29b-41d4-a716-446655440000'),

-- Application access
('550e8400-e29b-41d4-a716-446655440000', 'application', 'erp-system', 'admin', 'ERP system administrator for business operations', '2024-01-01', '2024-12-31', true, '550e8400-e29b-41d4-a716-446655440000', '2024-01-01 10:00:00+00', '2024-03-25 15:45:00+00', 'Application audit completed - access required for ERP administration', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440000', 'application', 'crm-system', 'write', 'Sales team access to CRM system', '2024-01-01', '2024-12-31', true, '550e8400-e29b-41d4-a716-446655440000', '2024-01-01 10:00:00+00', NULL, NULL, '550e8400-e29b-41d4-a716-446655440000'),

-- Infrastructure access
('550e8400-e29b-41d4-a716-446655440000', 'infrastructure', 'k8s-cluster-prod', 'admin', 'Kubernetes cluster administrator for production workloads', '2024-01-01', '2024-12-31', true, '550e8400-e29b-41d4-a716-446655440000', '2024-01-01 10:00:00+00', '2024-04-05 10:30:00+00', 'Infrastructure audit completed - access required for container orchestration', '550e8400-e29b-41d4-a716-446655440000'),
('550e8400-e29b-41d4-a716-446655440000', 'infrastructure', 'storage-array-01', 'super_admin', 'Storage administrator for production storage array', '2024-01-01', '2024-12-31', true, '550e8400-e29b-41d4-a716-446655440000', '2024-01-01 10:00:00+00', '2024-03-30 14:15:00+00', 'Storage audit completed - access justified for storage management', '550e8400-e29b-41d4-a716-446655440000'),

-- Expired access
('550e8400-e29b-41d4-a716-446655440000', 'system', 'dev-server-01', 'admin', 'Development server access (expired)', '2024-01-01', '2024-05-31', false, '550e8400-e29b-41d4-a716-446655440000', '2024-01-01 10:00:00+00', '2024-05-15 09:00:00+00', 'Access expired and revoked', '550e8400-e29b-41d4-a716-446655440000'),

-- Expiring soon access
('550e8400-e29b-41d4-a716-446655440000', 'database', 'backup-db', 'write', 'Backup database access (expiring soon)', '2024-01-01', '2024-07-15', true, '550e8400-e29b-41d4-a716-446655440000', '2024-01-01 10:00:00+00', '2024-04-01 16:30:00+00', 'Access expiring soon - review required', '550e8400-e29b-41d4-a716-446655440000'),

-- Needs audit access
('550e8400-e29b-41d4-a716-446655440000', 'application', 'test-app', 'read', 'Test application access (needs audit)', '2024-01-01', '2024-12-31', true, '550e8400-e29b-41d4-a716-446655440000', '2024-01-01 10:00:00+00', '2024-01-15 11:00:00+00', 'Initial audit completed', '550e8400-e29b-41d4-a716-446655440000');

COMMIT; 