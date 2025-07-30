-- =============================================================================
-- 🛡️ n.CISO - Schema para Governança de Acesso e Convites
-- =============================================================================
-- Execute este script no SQL Editor do painel do Supabase

-- =============================================================================
-- 📊 TABELAS DE GOVERNANÇA
-- =============================================================================

-- Tabela de organizações (tenants)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email_domain VARCHAR(255) NOT NULL UNIQUE,
  contact_email VARCHAR(255) NOT NULL,
  logo_url TEXT,
  status VARCHAR(50) DEFAULT 'active',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de convites
CREATE TABLE IF NOT EXISTS invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  accepted BOOLEAN DEFAULT FALSE,
  created_by UUID, -- Removida referência à tabela users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 🔍 ÍNDICES PARA PERFORMANCE
-- =============================================================================

-- Índices para tenants
CREATE INDEX IF NOT EXISTS idx_tenants_email_domain ON tenants(email_domain);
CREATE INDEX IF NOT EXISTS idx_tenants_status ON tenants(status);
CREATE INDEX IF NOT EXISTS idx_tenants_created_at ON tenants(created_at);

-- Índices para invites
CREATE INDEX IF NOT EXISTS idx_invites_email ON invites(email);
CREATE INDEX IF NOT EXISTS idx_invites_tenant_id ON invites(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invites_token ON invites(token);
CREATE INDEX IF NOT EXISTS idx_invites_expires_at ON invites(expires_at);
CREATE INDEX IF NOT EXISTS idx_invites_accepted ON invites(accepted);
CREATE INDEX IF NOT EXISTS idx_invites_created_by ON invites(created_by);

-- =============================================================================
-- 🔐 RLS (ROW LEVEL SECURITY)
-- =============================================================================

-- Habilitar RLS nas tabelas
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Políticas para tenants (simplificadas)
CREATE POLICY "tenants_select_policy" ON tenants
  FOR SELECT USING (true);

CREATE POLICY "tenants_insert_policy" ON tenants
  FOR INSERT WITH CHECK (true);

CREATE POLICY "tenants_update_policy" ON tenants
  FOR UPDATE USING (true);

CREATE POLICY "tenants_delete_policy" ON tenants
  FOR DELETE USING (true);

-- Políticas para invites (simplificadas)
CREATE POLICY "invites_select_policy" ON invites
  FOR SELECT USING (true);

CREATE POLICY "invites_insert_policy" ON invites
  FOR INSERT WITH CHECK (true);

CREATE POLICY "invites_update_policy" ON invites
  FOR UPDATE USING (true);

CREATE POLICY "invites_delete_policy" ON invites
  FOR DELETE USING (true);

-- =============================================================================
-- 🔄 TRIGGERS PARA AUDITORIA
-- =============================================================================

-- Função para atualizar updated_at (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at em tenants
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar updated_at em invites
CREATE TRIGGER update_invites_updated_at BEFORE UPDATE ON invites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- 🛡️ FUNÇÕES AUXILIARES
-- =============================================================================

-- Função para validar domínio de e-mail
CREATE OR REPLACE FUNCTION validate_email_domain(
  user_email VARCHAR,
  tenant_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM tenants 
    WHERE id = tenant_id 
    AND email_domain = split_part(user_email, '@', 2)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para gerar token de convite
CREATE OR REPLACE FUNCTION generate_invite_token() 
RETURNS VARCHAR AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se convite expirou
CREATE OR REPLACE FUNCTION is_invite_expired(invite_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM invites 
    WHERE id = invite_id 
    AND expires_at < NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 📊 DADOS INICIAIS (OPCIONAL)
-- =============================================================================

-- Inserir tenant padrão para desenvolvimento
INSERT INTO tenants (name, email_domain, contact_email, logo_url) 
VALUES (
  'n.CISO Development',
  'nciso.dev',
  'admin@nciso.dev',
  'https://via.placeholder.com/150x50/00ade0/ffffff?text=n.CISO'
) ON CONFLICT (email_domain) DO NOTHING;

-- =============================================================================
-- ✅ VERIFICAÇÃO FINAL
-- =============================================================================

-- Verificar se as tabelas foram criadas
SELECT 
  'tenants' as table_name,
  COUNT(*) as row_count
FROM tenants
UNION ALL
SELECT 
  'invites' as table_name,
  COUNT(*) as row_count
FROM invites; 