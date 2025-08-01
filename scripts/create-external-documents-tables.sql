-- =============================================================================
-- 📊 TABELA DE DOCUMENTOS EXTERNOS
-- =============================================================================
CREATE TABLE IF NOT EXISTS isms_external_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255) NOT NULL,
  source VARCHAR(100) NOT NULL CHECK (source IN ('sharepoint', 'onedrive', 'ged', 'google_drive', 'dropbox', 'box', 'other')),
  external_id VARCHAR(255) NOT NULL,
  title VARCHAR(500) NOT NULL,
  version VARCHAR(20) DEFAULT '1.0',
  document_url TEXT NOT NULL,
  document_path TEXT,
  checksum VARCHAR(100) NOT NULL,
  lang VARCHAR(10) NOT NULL DEFAULT 'pt-BR' CHECK (lang IN ('pt-BR', 'en-US', 'es')),
  policy_id UUID REFERENCES isms_policies(id) ON DELETE SET NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  file_size BIGINT,
  file_type VARCHAR(100) DEFAULT 'application/pdf',
  is_external BOOLEAN DEFAULT true,
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_isms_external_documents_tenant_id ON isms_external_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_isms_external_documents_source ON isms_external_documents(source);
CREATE INDEX IF NOT EXISTS idx_isms_external_documents_external_id ON isms_external_documents(external_id);
CREATE INDEX IF NOT EXISTS idx_isms_external_documents_policy_id ON isms_external_documents(policy_id);
CREATE INDEX IF NOT EXISTS idx_isms_external_documents_lang ON isms_external_documents(lang);
CREATE INDEX IF NOT EXISTS idx_isms_external_documents_created_at ON isms_external_documents(created_at);
CREATE INDEX IF NOT EXISTS idx_isms_external_documents_last_synced_at ON isms_external_documents(last_synced_at);

-- Índice único para evitar duplicatas
CREATE UNIQUE INDEX IF NOT EXISTS idx_isms_external_documents_unique 
ON isms_external_documents(tenant_id, source, external_id, version);

-- =============================================================================
-- 📊 TABELA DE LOGS DE SINCRONIZAÇÃO
-- =============================================================================
CREATE TABLE IF NOT EXISTS isms_sync_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id VARCHAR(255) NOT NULL,
  action VARCHAR(100) NOT NULL CHECK (action IN ('document_ingested', 'document_updated', 'document_deleted', 'sync_started', 'sync_completed', 'sync_failed')),
  source VARCHAR(100),
  external_id VARCHAR(255),
  document_id UUID REFERENCES isms_external_documents(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'failed', 'partial')),
  details JSONB,
  error_message TEXT,
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para logs
CREATE INDEX IF NOT EXISTS idx_isms_sync_audit_logs_tenant_id ON isms_sync_audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_isms_sync_audit_logs_action ON isms_sync_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_isms_sync_audit_logs_status ON isms_sync_audit_logs(status);
CREATE INDEX IF NOT EXISTS idx_isms_sync_audit_logs_created_at ON isms_sync_audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_isms_sync_audit_logs_document_id ON isms_sync_audit_logs(document_id);

-- =============================================================================
-- 📊 ATUALIZAÇÃO DA TABELA DE DOCUMENTOS EXISTENTE
-- =============================================================================

-- Adicionar campo is_external à tabela isms_documents se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'isms_documents' 
    AND column_name = 'is_external'
  ) THEN
    ALTER TABLE isms_documents ADD COLUMN is_external BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Adicionar campo external_document_id à tabela isms_documents se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'isms_documents' 
    AND column_name = 'external_document_id'
  ) THEN
    ALTER TABLE isms_documents ADD COLUMN external_document_id UUID REFERENCES isms_external_documents(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =============================================================================
-- 🔐 ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Habilitar RLS nas tabelas
ALTER TABLE isms_external_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE isms_sync_audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para isms_external_documents
CREATE POLICY "Users can view own external documents" ON isms_external_documents
  FOR SELECT USING (auth.uid()::text = tenant_id OR tenant_id = 'public');

CREATE POLICY "Users can insert own external documents" ON isms_external_documents
  FOR INSERT WITH CHECK (auth.uid()::text = tenant_id);

CREATE POLICY "Users can update own external documents" ON isms_external_documents
  FOR UPDATE USING (auth.uid()::text = tenant_id);

CREATE POLICY "Users can delete own external documents" ON isms_external_documents
  FOR DELETE USING (auth.uid()::text = tenant_id);

-- Políticas RLS para isms_sync_audit_logs
CREATE POLICY "Users can view own sync logs" ON isms_sync_audit_logs
  FOR SELECT USING (auth.uid()::text = tenant_id OR tenant_id = 'public');

CREATE POLICY "Users can insert own sync logs" ON isms_sync_audit_logs
  FOR INSERT WITH CHECK (auth.uid()::text = tenant_id);

-- =============================================================================
-- 🔄 TRIGGERS E FUNÇÕES
-- =============================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_isms_external_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_isms_external_documents_updated_at
  BEFORE UPDATE ON isms_external_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_isms_external_documents_updated_at();

-- Função para validar checksum
CREATE OR REPLACE FUNCTION validate_checksum_format(checksum TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Validar formato sha256:hash
  RETURN checksum ~ '^sha256:[a-fA-F0-9]{64}$';
END;
$$ LANGUAGE plpgsql;

-- Constraint para validar checksum
ALTER TABLE isms_external_documents 
ADD CONSTRAINT check_checksum_format 
CHECK (validate_checksum_format(checksum));

-- =============================================================================
-- 📊 FUNÇÕES ÚTEIS
-- =============================================================================

-- Função para listar documentos externos por política
CREATE OR REPLACE FUNCTION get_external_documents_by_policy(policy_uuid UUID, tenant_id_param VARCHAR)
RETURNS TABLE (
  id UUID,
  title VARCHAR(500),
  version VARCHAR(20),
  source VARCHAR(100),
  external_id VARCHAR(255),
  lang VARCHAR(10),
  file_size BIGINT,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ed.id,
    ed.title,
    ed.version,
    ed.source,
    ed.external_id,
    ed.lang,
    ed.file_size,
    ed.created_at
  FROM isms_external_documents ed
  WHERE ed.policy_id = policy_uuid 
    AND ed.tenant_id = tenant_id_param
  ORDER BY ed.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para contar documentos por fonte
CREATE OR REPLACE FUNCTION count_documents_by_source(tenant_id_param VARCHAR)
RETURNS TABLE (
  source VARCHAR(100),
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ed.source,
    COUNT(*) as count
  FROM isms_external_documents ed
  WHERE ed.tenant_id = tenant_id_param
  GROUP BY ed.source
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter estatísticas de sincronização
CREATE OR REPLACE FUNCTION get_sync_statistics(tenant_id_param VARCHAR, days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  total_documents BIGINT,
  documents_this_period BIGINT,
  successful_syncs BIGINT,
  failed_syncs BIGINT,
  last_sync_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM isms_external_documents WHERE tenant_id = tenant_id_param) as total_documents,
    (SELECT COUNT(*) FROM isms_external_documents 
     WHERE tenant_id = tenant_id_param 
     AND created_at >= NOW() - INTERVAL '1 day' * days_back) as documents_this_period,
    (SELECT COUNT(*) FROM isms_sync_audit_logs 
     WHERE tenant_id = tenant_id_param 
     AND status = 'success' 
     AND created_at >= NOW() - INTERVAL '1 day' * days_back) as successful_syncs,
    (SELECT COUNT(*) FROM isms_sync_audit_logs 
     WHERE tenant_id = tenant_id_param 
     AND status = 'failed' 
     AND created_at >= NOW() - INTERVAL '1 day' * days_back) as failed_syncs,
    (SELECT MAX(created_at) FROM isms_sync_audit_logs WHERE tenant_id = tenant_id_param) as last_sync_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- 📊 VIEWS ÚTEIS
-- =============================================================================

-- View para documentos externos com informações da política
CREATE OR REPLACE VIEW v_isms_external_documents_with_policy AS
SELECT 
  ed.*,
  ip.title as policy_title,
  ip.status as policy_status,
  ip.version as policy_version
FROM isms_external_documents ed
LEFT JOIN isms_policies ip ON ed.policy_id = ip.id;

-- View para logs de sincronização com detalhes
CREATE OR REPLACE VIEW v_isms_sync_logs_detailed AS
SELECT 
  sal.*,
  ed.title as document_title,
  ed.source as document_source,
  ed.external_id as document_external_id
FROM isms_sync_audit_logs sal
LEFT JOIN isms_external_documents ed ON sal.document_id = ed.id;

-- =============================================================================
-- 📊 COMENTÁRIOS
-- =============================================================================

COMMENT ON TABLE isms_external_documents IS 'Tabela para armazenar documentos externos ingeridos no sistema ISMS';
COMMENT ON TABLE isms_sync_audit_logs IS 'Tabela para logs de auditoria de sincronização de documentos externos';
COMMENT ON COLUMN isms_external_documents.source IS 'Fonte do documento (sharepoint, onedrive, ged, etc.)';
COMMENT ON COLUMN isms_external_documents.external_id IS 'ID único do documento no sistema externo';
COMMENT ON COLUMN isms_external_documents.checksum IS 'Checksum SHA256 do arquivo para validação de integridade';
COMMENT ON COLUMN isms_external_documents.lang IS 'Idioma do documento (pt-BR, en-US, es)';
COMMENT ON COLUMN isms_external_documents.is_external IS 'Flag indicando que é um documento externo';
COMMENT ON COLUMN isms_external_documents.last_synced_at IS 'Data da última sincronização com o sistema externo';

-- =============================================================================
-- ✅ SCRIPT CONCLUÍDO
-- =============================================================================

-- Verificar se as tabelas foram criadas corretamente
SELECT 
  'isms_external_documents' as table_name,
  COUNT(*) as row_count
FROM isms_external_documents
UNION ALL
SELECT 
  'isms_sync_audit_logs' as table_name,
  COUNT(*) as row_count
FROM isms_sync_audit_logs; 