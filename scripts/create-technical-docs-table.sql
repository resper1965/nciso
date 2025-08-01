-- Create technical documents table for n.ISMS Epic - Technical Documentation

-- Technical documents table
CREATE TABLE IF NOT EXISTS technical_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_name VARCHAR(255),
  file_path TEXT,
  file_size INTEGER DEFAULT 0,
  file_type VARCHAR(100),
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('infrastructure', 'application', 'engineering', 'security', 'architecture', 'procedure')),
  scope_id UUID REFERENCES isms_scopes(id) ON DELETE SET NULL,
  asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
  control_id UUID REFERENCES controls(id) ON DELETE SET NULL,
  version VARCHAR(20) DEFAULT '1.0',
  author_id UUID REFERENCES users(id),
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  tenant_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_technical_documents_scope_id ON technical_documents(scope_id);
CREATE INDEX IF NOT EXISTS idx_technical_documents_asset_id ON technical_documents(asset_id);
CREATE INDEX IF NOT EXISTS idx_technical_documents_control_id ON technical_documents(control_id);
CREATE INDEX IF NOT EXISTS idx_technical_documents_author_id ON technical_documents(author_id);
CREATE INDEX IF NOT EXISTS idx_technical_documents_document_type ON technical_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_technical_documents_is_public ON technical_documents(is_public);
CREATE INDEX IF NOT EXISTS idx_technical_documents_created_at ON technical_documents(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_technical_documents_updated_at BEFORE UPDATE ON technical_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE technical_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for technical_documents
CREATE POLICY "Users can view technical documents for their tenant" ON technical_documents
  FOR SELECT USING (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

CREATE POLICY "Users can insert technical documents for their tenant" ON technical_documents
  FOR INSERT WITH CHECK (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

CREATE POLICY "Users can update technical documents for their tenant" ON technical_documents
  FOR UPDATE USING (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

CREATE POLICY "Users can delete technical documents for their tenant" ON technical_documents
  FOR DELETE USING (tenant_id = (auth.jwt() ->> 'user_id')::uuid);

-- Insert sample technical documents
INSERT INTO technical_documents (title, description, file_name, file_path, file_size, file_type, document_type, scope_id, asset_id, version, author_id, tags, is_public, tenant_id) VALUES
-- Infrastructure Documents
('Arquitetura de Rede Corporativa', 'Documentação completa da arquitetura de rede da empresa', 'network-architecture.pdf', 'technical-docs/network-architecture.pdf', 2048576, 'application/pdf', 'infrastructure', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '2.1', '550e8400-e29b-41d4-a716-446655440000', ARRAY['rede', 'arquitetura', 'infraestrutura'], true, '550e8400-e29b-41d4-a716-446655440000'),
('Procedimento de Backup', 'Procedimentos de backup e recuperação de dados', 'backup-procedure.pdf', 'technical-docs/backup-procedure.pdf', 1536000, 'application/pdf', 'procedure', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '1.5', '550e8400-e29b-41d4-a716-446655440000', ARRAY['backup', 'procedimento', 'recuperação'], false, '550e8400-e29b-41d4-a716-446655440000'),

-- Application Documents
('Manual do Sistema ERP', 'Documentação técnica do sistema ERP corporativo', 'erp-manual.pdf', 'technical-docs/erp-manual.pdf', 5120000, 'application/pdf', 'application', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '3.0', '550e8400-e29b-41d4-a716-446655440000', ARRAY['erp', 'sistema', 'manual'], true, '550e8400-e29b-41d4-a716-446655440000'),
('API Documentation', 'Documentação da API REST do sistema', 'api-docs.json', 'technical-docs/api-docs.json', 256000, 'application/json', 'application', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '2.0', '550e8400-e29b-41d4-a716-446655440000', ARRAY['api', 'documentação', 'rest'], true, '550e8400-e29b-41d4-a716-446655440000'),

-- Security Documents
('Política de Segurança da Informação', 'Política corporativa de segurança da informação', 'security-policy.pdf', 'technical-docs/security-policy.pdf', 1024000, 'application/pdf', 'security', '550e8400-e29b-41d4-a716-446655440001', NULL, '1.0', '550e8400-e29b-41d4-a716-446655440000', ARRAY['política', 'segurança', 'corporativa'], false, '550e8400-e29b-41d4-a716-446655440000'),
('Procedimento de Resposta a Incidentes', 'Procedimentos para resposta a incidentes de segurança', 'incident-response.pdf', 'technical-docs/incident-response.pdf', 768000, 'application/pdf', 'security', '550e8400-e29b-41d4-a716-446655440001', NULL, '2.1', '550e8400-e29b-41d4-a716-446655440000', ARRAY['incidente', 'resposta', 'segurança'], false, '550e8400-e29b-41d4-a716-446655440000'),

-- Engineering Documents
('Padrões de Desenvolvimento', 'Padrões e boas práticas de desenvolvimento', 'dev-standards.md', 'technical-docs/dev-standards.md', 128000, 'text/markdown', 'engineering', '550e8400-e29b-41d4-a716-446655440001', NULL, '1.2', '550e8400-e29b-41d4-a716-446655440000', ARRAY['desenvolvimento', 'padrões', 'boas-práticas'], true, '550e8400-e29b-41d4-a716-446655440000'),
('Arquitetura de Software', 'Documentação da arquitetura de software', 'software-architecture.pdf', 'technical-docs/software-architecture.pdf', 4096000, 'application/pdf', 'architecture', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '1.8', '550e8400-e29b-41d4-a716-446655440000', ARRAY['arquitetura', 'software', 'design'], true, '550e8400-e29b-41d4-a716-446655440000'),

-- Procedure Documents
('Procedimento de Deploy', 'Procedimentos para deploy em produção', 'deploy-procedure.pdf', 'technical-docs/deploy-procedure.pdf', 512000, 'application/pdf', 'procedure', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', '1.3', '550e8400-e29b-41d4-a716-446655440000', ARRAY['deploy', 'produção', 'procedimento'], false, '550e8400-e29b-41d4-a716-446655440000'),
('Checklist de Segurança', 'Checklist para auditoria de segurança', 'security-checklist.pdf', 'technical-docs/security-checklist.pdf', 256000, 'application/pdf', 'procedure', '550e8400-e29b-41d4-a716-446655440001', NULL, '1.0', '550e8400-e29b-41d4-a716-446655440000', ARRAY['checklist', 'auditoria', 'segurança'], false, '550e8400-e29b-41d4-a716-446655440000');

-- Create Supabase Storage bucket for documents (if not exists)
-- Note: This needs to be done through Supabase dashboard or API
-- INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false);

-- Create storage policies for documents bucket
-- CREATE POLICY "Users can view documents for their tenant" ON storage.objects
--   FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can insert documents for their tenant" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can update documents for their tenant" ON storage.objects
--   FOR UPDATE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- CREATE POLICY "Users can delete documents for their tenant" ON storage.objects
--   FOR DELETE USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

COMMIT; 