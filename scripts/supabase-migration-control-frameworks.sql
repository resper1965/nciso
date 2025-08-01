-- Migration: create_control_frameworks
-- Description: Cria tabela relacional para mapeamento entre controles e frameworks
-- Epic: Epic 2 — Mapeamento de Controles x Frameworks

-- Criar tabela control_frameworks
CREATE TABLE IF NOT EXISTS control_frameworks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  control_id UUID NOT NULL REFERENCES global_controls(id) ON DELETE CASCADE,
  framework_id UUID NOT NULL REFERENCES frameworks(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_control_frameworks_control_id ON control_frameworks(control_id);
CREATE INDEX IF NOT EXISTS idx_control_frameworks_framework_id ON control_frameworks(framework_id);
CREATE INDEX IF NOT EXISTS idx_control_frameworks_tenant_id ON control_frameworks(tenant_id);
CREATE INDEX IF NOT EXISTS idx_control_frameworks_composite ON control_frameworks(control_id, framework_id);

-- Criar constraint único para evitar duplicatas
CREATE UNIQUE INDEX IF NOT EXISTS idx_control_frameworks_unique 
ON control_frameworks(control_id, framework_id, tenant_id);

-- Ativar RLS (Row Level Security)
ALTER TABLE control_frameworks ENABLE ROW LEVEL SECURITY;

-- Políticas de Segurança por Tenant
CREATE POLICY "select_own_control_frameworks" ON control_frameworks 
FOR SELECT USING (
  tenant_id = (current_setting('request.jwt.claims', true)::json ->> 'tenant_id')::uuid
);

CREATE POLICY "insert_own_control_frameworks" ON control_frameworks 
FOR INSERT WITH CHECK (
  tenant_id = (current_setting('request.jwt.claims', true)::json ->> 'tenant_id')::uuid
);

CREATE POLICY "update_own_control_frameworks" ON control_frameworks 
FOR UPDATE USING (
  tenant_id = (current_setting('request.jwt.claims', true)::json ->> 'tenant_id')::uuid
);

CREATE POLICY "delete_own_control_frameworks" ON control_frameworks 
FOR DELETE USING (
  tenant_id = (current_setting('request.jwt.claims', true)::json ->> 'tenant_id')::uuid
);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_control_frameworks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_control_frameworks_updated_at
  BEFORE UPDATE ON control_frameworks
  FOR EACH ROW
  EXECUTE FUNCTION update_control_frameworks_updated_at();

-- Funções úteis para consultas
CREATE OR REPLACE FUNCTION get_controls_by_framework(framework_uuid UUID)
RETURNS TABLE (
  control_id UUID,
  control_name TEXT,
  control_type TEXT,
  control_status TEXT,
  framework_id UUID,
  framework_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as control_id,
    c.name as control_name,
    c.type as control_type,
    c.status as control_status,
    f.id as framework_id,
    f.name as framework_name
  FROM global_controls c
  INNER JOIN control_frameworks cf ON c.id = cf.control_id
  INNER JOIN frameworks f ON cf.framework_id = f.id
  WHERE cf.framework_id = framework_uuid
    AND c.tenant_id = (current_setting('request.jwt.claims', true)::json ->> 'tenant_id')::uuid
    AND cf.tenant_id = (current_setting('request.jwt.claims', true)::json ->> 'tenant_id')::uuid
  ORDER BY c.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_frameworks_by_control(control_uuid UUID)
RETURNS TABLE (
  framework_id UUID,
  framework_name TEXT,
  framework_version TEXT,
  framework_description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id as framework_id,
    f.name as framework_name,
    f.version as framework_version,
    f.description as framework_description
  FROM frameworks f
  INNER JOIN control_frameworks cf ON f.id = cf.framework_id
  WHERE cf.control_id = control_uuid
    AND cf.tenant_id = (current_setting('request.jwt.claims', true)::json ->> 'tenant_id')::uuid
  ORDER BY f.name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_control_framework_stats()
RETURNS TABLE (
  total_controls INTEGER,
  total_frameworks INTEGER,
  total_mappings INTEGER,
  controls_with_frameworks INTEGER,
  frameworks_with_controls INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM global_controls WHERE tenant_id = (current_setting('request.jwt.claims', true)::json ->> 'tenant_id')::uuid) as total_controls,
    (SELECT COUNT(*) FROM frameworks WHERE tenant_id = (current_setting('request.jwt.claims', true)::json ->> 'tenant_id')::uuid) as total_frameworks,
    (SELECT COUNT(*) FROM control_frameworks WHERE tenant_id = (current_setting('request.jwt.claims', true)::json ->> 'tenant_id')::uuid) as total_mappings,
    (SELECT COUNT(DISTINCT control_id) FROM control_frameworks WHERE tenant_id = (current_setting('request.jwt.claims', true)::json ->> 'tenant_id')::uuid) as controls_with_frameworks,
    (SELECT COUNT(DISTINCT framework_id) FROM control_frameworks WHERE tenant_id = (current_setting('request.jwt.claims', true)::json ->> 'tenant_id')::uuid) as frameworks_with_controls;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 