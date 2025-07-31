-- Schema para o módulo ISMS
-- Execute este SQL no Supabase SQL Editor

-- Tabela de políticas
CREATE TABLE IF NOT EXISTS isms_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'active', 'archived')),
  version TEXT DEFAULT '1.0',
  owner TEXT,
  tenant_id UUID REFERENCES auth.users(id),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de controles
CREATE TABLE IF NOT EXISTS isms_controls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  effectiveness INTEGER DEFAULT 0 CHECK (effectiveness >= 0 AND effectiveness <= 100),
  status TEXT DEFAULT 'not_implemented' CHECK (status IN ('not_implemented', 'partial', 'implemented', 'planned')),
  last_assessment TIMESTAMP WITH TIME ZONE,
  tenant_id UUID REFERENCES auth.users(id),
  policy_ids UUID[],
  domain_id UUID,
  framework_mappings JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de domínios
CREATE TABLE IF NOT EXISTS isms_domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES isms_domains(id),
  tenant_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de frameworks
CREATE TABLE IF NOT EXISTS isms_frameworks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  version TEXT,
  tenant_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de avaliações
CREATE TABLE IF NOT EXISTS isms_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  control_id UUID REFERENCES isms_controls(id) ON DELETE CASCADE,
  effectiveness INTEGER NOT NULL CHECK (effectiveness >= 0 AND effectiveness <= 100),
  notes TEXT,
  assessor TEXT,
  assessment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  tenant_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de documentos
CREATE TABLE IF NOT EXISTS isms_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size INTEGER,
  policy_id UUID REFERENCES isms_policies(id),
  control_id UUID REFERENCES isms_controls(id),
  tenant_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE isms_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE isms_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE isms_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE isms_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE isms_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE isms_documents ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view own policies" ON isms_policies
  FOR SELECT USING (auth.uid() = tenant_id);

CREATE POLICY "Users can insert own policies" ON isms_policies
  FOR INSERT WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Users can update own policies" ON isms_policies
  FOR UPDATE USING (auth.uid() = tenant_id);

CREATE POLICY "Users can delete own policies" ON isms_policies
  FOR DELETE USING (auth.uid() = tenant_id);

-- Controles
CREATE POLICY "Users can view own controls" ON isms_controls
  FOR SELECT USING (auth.uid() = tenant_id);

CREATE POLICY "Users can insert own controls" ON isms_controls
  FOR INSERT WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Users can update own controls" ON isms_controls
  FOR UPDATE USING (auth.uid() = tenant_id);

CREATE POLICY "Users can delete own controls" ON isms_controls
  FOR DELETE USING (auth.uid() = tenant_id);

-- Domínios
CREATE POLICY "Users can view own domains" ON isms_domains
  FOR SELECT USING (auth.uid() = tenant_id);

CREATE POLICY "Users can insert own domains" ON isms_domains
  FOR INSERT WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Users can update own domains" ON isms_domains
  FOR UPDATE USING (auth.uid() = tenant_id);

CREATE POLICY "Users can delete own domains" ON isms_domains
  FOR DELETE USING (auth.uid() = tenant_id);

-- Frameworks
CREATE POLICY "Users can view own frameworks" ON isms_frameworks
  FOR SELECT USING (auth.uid() = tenant_id);

CREATE POLICY "Users can insert own frameworks" ON isms_frameworks
  FOR INSERT WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Users can update own frameworks" ON isms_frameworks
  FOR UPDATE USING (auth.uid() = tenant_id);

CREATE POLICY "Users can delete own frameworks" ON isms_frameworks
  FOR DELETE USING (auth.uid() = tenant_id);

-- Avaliações
CREATE POLICY "Users can view own assessments" ON isms_assessments
  FOR SELECT USING (auth.uid() = tenant_id);

CREATE POLICY "Users can insert own assessments" ON isms_assessments
  FOR INSERT WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Users can update own assessments" ON isms_assessments
  FOR UPDATE USING (auth.uid() = tenant_id);

CREATE POLICY "Users can delete own assessments" ON isms_assessments
  FOR DELETE USING (auth.uid() = tenant_id);

-- Documentos
CREATE POLICY "Users can view own documents" ON isms_documents
  FOR SELECT USING (auth.uid() = tenant_id);

CREATE POLICY "Users can insert own documents" ON isms_documents
  FOR INSERT WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Users can update own documents" ON isms_documents
  FOR UPDATE USING (auth.uid() = tenant_id);

CREATE POLICY "Users can delete own documents" ON isms_documents
  FOR DELETE USING (auth.uid() = tenant_id);

-- Funções para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_isms_policies_updated_at BEFORE UPDATE ON isms_policies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_isms_controls_updated_at BEFORE UPDATE ON isms_controls
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_isms_domains_updated_at BEFORE UPDATE ON isms_domains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_isms_frameworks_updated_at BEFORE UPDATE ON isms_frameworks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_isms_documents_updated_at BEFORE UPDATE ON isms_documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados iniciais
INSERT INTO isms_policies (title, description, content, status, version, owner, tenant_id, tags) VALUES
('Política de Senhas', 'Política para definição e gestão de senhas', 'Conteúdo da política de senhas...', 'active', '2.1', 'CISO', auth.uid(), ARRAY['segurança', 'acesso']),
('Política de Acesso Remoto', 'Política para acesso remoto seguro', 'Conteúdo da política de acesso remoto...', 'active', '1.5', 'CISO', auth.uid(), ARRAY['remoto', 'vpn']),
('Política de Backup', 'Política para backup de dados', 'Conteúdo da política de backup...', 'draft', '1.0', 'CISO', auth.uid(), ARRAY['backup', 'dados']);

INSERT INTO isms_controls (name, description, category, effectiveness, status, last_assessment, tenant_id, policy_ids) VALUES
('Controle de Acesso', 'Controle de acesso a sistemas', 'Access Control', 85, 'implemented', NOW(), auth.uid(), ARRAY[(SELECT id FROM isms_policies WHERE title = 'Política de Senhas' LIMIT 1)]),
('Criptografia de Dados', 'Criptografia de dados sensíveis', 'Cryptography', 72, 'partial', NOW(), auth.uid(), ARRAY[(SELECT id FROM isms_policies WHERE title = 'Política de Acesso Remoto' LIMIT 1)]),
('Monitoramento de Rede', 'Monitoramento de tráfego de rede', 'Network Security', 90, 'implemented', NOW(), auth.uid(), ARRAY[(SELECT id FROM isms_policies WHERE title = 'Política de Senhas' LIMIT 1), (SELECT id FROM isms_policies WHERE title = 'Política de Acesso Remoto' LIMIT 1)]);

INSERT INTO isms_domains (name, description, tenant_id) VALUES
('Governança', 'Domínio de governança de segurança', auth.uid()),
('Operações', 'Domínio de operações de segurança', auth.uid()),
('Tecnologia', 'Domínio de tecnologia de segurança', auth.uid());

INSERT INTO isms_frameworks (name, description, version, tenant_id) VALUES
('ISO 27001', 'Sistema de Gestão da Segurança da Informação', '2013', auth.uid()),
('NIST Cybersecurity Framework', 'Framework de cibersegurança do NIST', '1.1', auth.uid()),
('COBIT 2019', 'Framework de governança de TI', '2019', auth.uid()),
('PCI DSS', 'Padrão de segurança de dados do setor de cartões de pagamento', '4.0', auth.uid());

INSERT INTO isms_assessments (control_id, effectiveness, notes, assessor, assessment_date, tenant_id) VALUES
((SELECT id FROM isms_controls WHERE name = 'Controle de Acesso' LIMIT 1), 85, 'Controle implementado com sucesso', 'João Silva', NOW(), auth.uid()),
((SELECT id FROM isms_controls WHERE name = 'Criptografia de Dados' LIMIT 1), 72, 'Controle parcialmente implementado', 'Maria Santos', NOW(), auth.uid()),
((SELECT id FROM isms_controls WHERE name = 'Monitoramento de Rede' LIMIT 1), 90, 'Controle totalmente implementado', 'Pedro Costa', NOW(), auth.uid()); 