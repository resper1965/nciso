# 🛡️ Instruções Manuais para Configuração do Supabase

## 📋 Passo a Passo para Criar as Tabelas

### 1. Acessar o Supabase
1. Abra seu navegador
2. Vá para: https://supabase.com/dashboard/project/pszfqqmmljekibmcgmig
3. Faça login se necessário

### 2. Abrir o SQL Editor
1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique em **"New query"** (botão azul)

### 3. Copiar e Colar o SQL
1. Abra o arquivo `supabase-schema-ready.sql` no seu computador
2. Selecione todo o conteúdo (Ctrl+A)
3. Copie (Ctrl+C)
4. Cole no SQL Editor do Supabase (Ctrl+V)

### 4. Executar o Script
1. Clique no botão **"Run"** (botão azul)
2. Aguarde a execução
3. Você deve ver a mensagem: `✅ Schema n.CISO criado com sucesso!`

### 5. Verificar as Tabelas
1. No menu lateral, clique em **"Table Editor"**
2. Você deve ver as seguintes tabelas criadas:
   - ✅ organizations
   - ✅ assets
   - ✅ evaluations
   - ✅ technical_documents
   - ✅ teams
   - ✅ credentials_registry
   - ✅ privileged_access

### 6. Testar a Conexão
Execute no terminal:
```bash
cd /home/nciso/nciso
python3 test-supabase-python.py
```

## 📄 Conteúdo do SQL para Copiar

Aqui está o SQL completo que você precisa copiar e colar:

```sql
-- =============================================================================
-- 🛡️ n.CISO - Schema Completo do Supabase
-- =============================================================================
-- Copie e cole este código no SQL Editor do Supabase
-- Projeto: pszfqqmmljekibmcgmig

-- =============================================================================
-- 📊 TABELA DE ORGANIZAÇÕES
-- =============================================================================
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

-- =============================================================================
-- 📊 TABELA DE ATIVOS
-- =============================================================================
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('physical', 'digital', 'person', 'software', 'infrastructure', 'data')),
  description TEXT,
  owner_id UUID,
  classification JSONB NOT NULL DEFAULT '{"confidentiality": "low", "integrity": "low", "availability": "low"}',
  value DECIMAL(15,2),
  location VARCHAR(255),
  organization_id UUID REFERENCES organizations(id),
  tenant_id VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para assets
CREATE INDEX IF NOT EXISTS idx_assets_tenant_id ON assets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_assets_organization_id ON assets(organization_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
CREATE INDEX IF NOT EXISTS idx_assets_is_active ON assets(is_active);

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

-- =============================================================================
-- 📊 TABELA DE AVALIAÇÕES
-- =============================================================================
CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  scope_id UUID,
  domain_id UUID,
  control_id UUID,
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'reviewed')),
  percentage_score DECIMAL(5,2),
  evidence_count INTEGER DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  tenant_id VARCHAR(255) NOT NULL,
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para evaluations
CREATE INDEX IF NOT EXISTS idx_evaluations_tenant_id ON evaluations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_status ON evaluations(status);
CREATE INDEX IF NOT EXISTS idx_evaluations_start_date ON evaluations(start_date);

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

-- =============================================================================
-- 📊 TABELA DE DOCUMENTOS TÉCNICOS
-- =============================================================================
CREATE TABLE IF NOT EXISTS technical_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('policy', 'procedure', 'standard', 'guideline', 'template', 'manual', 'checklist')),
  version VARCHAR(20) DEFAULT '1.0',
  content TEXT,
  file_path VARCHAR(500),
  file_size BIGINT,
  file_type VARCHAR(100),
  tags TEXT[],
  scope_id UUID,
  asset_id UUID REFERENCES assets(id),
  control_id UUID,
  status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'active', 'inactive')),
  tenant_id VARCHAR(255) NOT NULL,
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para technical_documents
CREATE INDEX IF NOT EXISTS idx_technical_documents_tenant_id ON technical_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_technical_documents_document_type ON technical_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_technical_documents_status ON technical_documents(status);
CREATE INDEX IF NOT EXISTS idx_technical_documents_scope_id ON technical_documents(scope_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_technical_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_technical_documents_updated_at
  BEFORE UPDATE ON technical_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_technical_documents_updated_at();

-- =============================================================================
-- 📊 TABELA DE EQUIPES
-- =============================================================================
CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  organization_id UUID REFERENCES organizations(id),
  tenant_id VARCHAR(255) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para teams
CREATE INDEX IF NOT EXISTS idx_teams_tenant_id ON teams(tenant_id);
CREATE INDEX IF NOT EXISTS idx_teams_organization_id ON teams(organization_id);
CREATE INDEX IF NOT EXISTS idx_teams_is_active ON teams(is_active);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_teams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_teams_updated_at();

-- =============================================================================
-- 📊 TABELA DE REGISTRO DE CREDENCIAIS
-- =============================================================================
CREATE TABLE IF NOT EXISTS credentials_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id),
  holder_type VARCHAR(20) NOT NULL CHECK (holder_type IN ('user', 'team')),
  holder_id VARCHAR(255) NOT NULL,
  access_type VARCHAR(20) NOT NULL CHECK (access_type IN ('read', 'write', 'admin', 'full')),
  justification TEXT,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'inactive', 'expired', 'revoked')),
  approved_by VARCHAR(255),
  approved_at TIMESTAMP WITH TIME ZONE,
  revoked_by VARCHAR(255),
  revoked_at TIMESTAMP WITH TIME ZONE,
  tenant_id VARCHAR(255) NOT NULL,
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para credentials_registry
CREATE INDEX IF NOT EXISTS idx_credentials_registry_tenant_id ON credentials_registry(tenant_id);
CREATE INDEX IF NOT EXISTS idx_credentials_registry_asset_id ON credentials_registry(asset_id);
CREATE INDEX IF NOT EXISTS idx_credentials_registry_holder_type ON credentials_registry(holder_type);
CREATE INDEX IF NOT EXISTS idx_credentials_registry_status ON credentials_registry(status);
CREATE INDEX IF NOT EXISTS idx_credentials_registry_valid_until ON credentials_registry(valid_until);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_credentials_registry_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_credentials_registry_updated_at
  BEFORE UPDATE ON credentials_registry
  FOR EACH ROW
  EXECUTE FUNCTION update_credentials_registry_updated_at();

-- =============================================================================
-- 📊 TABELA DE ACESSO PRIVILEGIADO
-- =============================================================================
CREATE TABLE IF NOT EXISTS privileged_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  scope_type VARCHAR(50) NOT NULL CHECK (scope_type IN ('system', 'database', 'application', 'network', 'infrastructure')),
  scope_id VARCHAR(255) NOT NULL,
  access_level VARCHAR(20) NOT NULL CHECK (access_level IN ('read', 'write', 'admin', 'full')),
  justification TEXT,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'inactive', 'expired', 'revoked')),
  approved_by VARCHAR(255),
  approved_at TIMESTAMP WITH TIME ZONE,
  revoked_by VARCHAR(255),
  revoked_at TIMESTAMP WITH TIME ZONE,
  last_audit_date TIMESTAMP WITH TIME ZONE,
  audit_notes TEXT,
  tenant_id VARCHAR(255) NOT NULL,
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para privileged_access
CREATE INDEX IF NOT EXISTS idx_privileged_access_tenant_id ON privileged_access(tenant_id);
CREATE INDEX IF NOT EXISTS idx_privileged_access_user_id ON privileged_access(user_id);
CREATE INDEX IF NOT EXISTS idx_privileged_access_scope_type ON privileged_access(scope_type);
CREATE INDEX IF NOT EXISTS idx_privileged_access_status ON privileged_access(status);
CREATE INDEX IF NOT EXISTS idx_privileged_access_valid_until ON privileged_access(valid_until);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_privileged_access_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_privileged_access_updated_at
  BEFORE UPDATE ON privileged_access
  FOR EACH ROW
  EXECUTE FUNCTION update_privileged_access_updated_at();

-- =============================================================================
-- 📊 DADOS DE EXEMPLO
-- =============================================================================

-- Inserir organizações de exemplo
INSERT INTO organizations (name, type, description, tenant_id, is_active) VALUES
('n.CISO Corporation', 'company', 'Empresa principal do sistema n.CISO', 'demo-tenant', true),
('Departamento de TI', 'department', 'Departamento de Tecnologia da Informação', 'demo-tenant', true),
('Equipe de Segurança', 'unit', 'Equipe responsável pela segurança da informação', 'demo-tenant', true);

-- Inserir ativos de exemplo
INSERT INTO assets (name, type, description, classification, value, organization_id, tenant_id, is_active) VALUES
('Servidor Principal', 'infrastructure', 'Servidor principal da empresa', '{"confidentiality": "high", "integrity": "high", "availability": "critical"}', 50000.00, (SELECT id FROM organizations WHERE name = 'Departamento de TI' LIMIT 1), 'demo-tenant', true),
('Base de Dados Cliente', 'data', 'Base de dados com informações dos clientes', '{"confidentiality": "critical", "integrity": "high", "availability": "high"}', 100000.00, (SELECT id FROM organizations WHERE name = 'Departamento de TI' LIMIT 1), 'demo-tenant', true),
('Aplicação Web', 'software', 'Aplicação web principal', '{"confidentiality": "medium", "integrity": "high", "availability": "high"}', 25000.00, (SELECT id FROM organizations WHERE name = 'Departamento de TI' LIMIT 1), 'demo-tenant', true);

-- Inserir equipes de exemplo
INSERT INTO teams (name, description, organization_id, tenant_id, is_active) VALUES
('Equipe de Desenvolvimento', 'Equipe responsável pelo desenvolvimento de software', (SELECT id FROM organizations WHERE name = 'Departamento de TI' LIMIT 1), 'demo-tenant', true),
('Equipe de Operações', 'Equipe responsável pelas operações de TI', (SELECT id FROM organizations WHERE name = 'Departamento de TI' LIMIT 1), 'demo-tenant', true);

-- =============================================================================
-- ✅ SCHEMA COMPLETO CRIADO
-- =============================================================================

SELECT '✅ Schema n.CISO criado com sucesso!' as status;
```

## 🧪 Após Executar o SQL

Execute este comando para testar:

```bash
cd /home/nciso/nciso
python3 test-supabase-python.py
```

### Resultado Esperado:

```
🧪 Testando conexão com Supabase...

📋 Teste 1: Verificar conexão
✅ Conexão estabelecida com sucesso!

📋 Teste 2: Criar organização de teste
✅ Dados inseridos com sucesso!

📋 Teste 3: Ler dados inseridos
✅ Dados lidos com sucesso!

📋 Teste 4: Limpar dados de teste
✅ Dados de teste removidos com sucesso!

📋 Teste 5: Verificar tabelas disponíveis
✅ Tabela 'organizations': Disponível
✅ Tabela 'assets': Disponível
✅ Tabela 'evaluations': Disponível
✅ Tabela 'technical_documents': Disponível
✅ Tabela 'credentials_registry': Disponível
✅ Tabela 'privileged_access': Disponível
✅ Tabela 'teams': Disponível

🎉 Teste de conexão concluído!
✅ Inserção de dados: Funcionando
✅ Leitura de dados: Funcionando
✅ Exclusão de dados: Funcionando
```

## 🎯 Próximos Passos

Após criar as tabelas:

1. **Teste a aplicação:**
   ```bash
   cd /home/nciso/nciso
   npm run dev
   ```

2. **Acesse o dashboard:**
   - URL: http://localhost:3000/isms
   - Verifique se todos os módulos estão funcionando

3. **Teste as funcionalidades:**
   - Criar organizações
   - Registrar ativos
   - Criar credenciais
   - Gerenciar acessos privilegiados

---

**✅ Execute o SQL no Supabase e depois teste a conexão!** 