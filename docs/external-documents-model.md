# 📄 Modelo de Integração de Documentos Externos - n.CISO

## 🎯 Visão Geral

Este documento descreve o modelo reutilizável para integração e persistência de documentos externos no n.CISO. O modelo foi implementado no módulo n.ISMS e pode ser replicado para outros módulos.

## 🏗️ Arquitetura

### Componentes Principais

1. **API Endpoints** (`/api/v1/isms/external-documents/`)
2. **Tabelas de Banco de Dados** (`isms_external_documents`, `isms_sync_audit_logs`)
3. **MCP Server Functions** (Model Context Protocol)
4. **Supabase Storage Integration**
5. **Security & RLS** (Row Level Security)

### Fluxo de Dados

```
Sistema Externo (SharePoint/OneDrive/GED)
    ↓
n8n Automation
    ↓
POST /api/v1/isms/external-documents/ingest
    ↓
Download & Validation
    ↓
Supabase Storage
    ↓
Database Record
    ↓
Audit Log
    ↓
IA Integration
```

## 📋 Implementação

### 1. Endpoints da API

#### POST `/api/v1/isms/external-documents/ingest`

**Payload:**
```json
{
  "tenant_id": "acme",
  "source": "sharepoint",
  "external_id": "xyz-123",
  "title": "Política de Acesso",
  "version": "1.3",
  "document_url": "https://...",
  "checksum": "sha256:...",
  "lang": "pt-BR",
  "policy_id": "uuid-optional",
  "description": "Descrição opcional",
  "tags": ["tag1", "tag2"]
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "External document ingested successfully",
  "data": {
    "id": "uuid",
    "title": "Política de Acesso",
    "version": "1.3",
    "source": "sharepoint",
    "external_id": "xyz-123",
    "checksum": "sha256:...",
    "file_size": 12345,
    "storage_path": "acme/xyz-123/1.3/document.pdf",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### GET `/api/v1/isms/external-documents`

**Parâmetros:**
- `tenant_id` (obrigatório)
- `policy_id` (opcional)
- `source` (opcional)
- `lang` (opcional)
- `limit` (padrão: 50)
- `offset` (padrão: 0)

#### GET `/api/v1/isms/external-documents/:id`

#### GET `/api/v1/isms/external-documents/:id/download`

#### DELETE `/api/v1/isms/external-documents/:id`

### 2. Estrutura do Banco de Dados

#### Tabela: `isms_external_documents`

```sql
CREATE TABLE isms_external_documents (
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
```

#### Tabela: `isms_sync_audit_logs`

```sql
CREATE TABLE isms_sync_audit_logs (
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
```

### 3. MCP Server Functions

#### `ingest_external_document(args)`

```javascript
async ingestExternalDocument(args) {
  // Validação de campos obrigatórios
  // Download do arquivo
  // Cálculo de checksum
  // Upload para Supabase Storage
  // Inserção no banco
  // Log de auditoria
}
```

#### `list_external_documents_by_policy(args)`

```javascript
async listExternalDocumentsByPolicy(args) {
  // Buscar documentos por política
  // Filtros por tenant, source, lang
  // Paginação
}
```

#### `download_document(args)`

```javascript
async downloadDocument(args) {
  // Buscar documento
  // Gerar URL assinada
  // Retornar link de download
}
```

#### `generate_embeddings(args)`

```javascript
async generateEmbeddings(args) {
  // Buscar documento
  // Gerar embeddings para IA
  // Retornar vetores
}
```

## 🔐 Segurança

### Autenticação e Autorização

- **JWT Token**: Obrigatório em todos os endpoints
- **Role Validation**: Apenas admin/manager podem ingerir documentos
- **Tenant Isolation**: Usuários só acessam documentos do seu tenant

### Row Level Security (RLS)

```sql
-- Políticas RLS para isms_external_documents
CREATE POLICY "Users can view own external documents" ON isms_external_documents
  FOR SELECT USING (auth.uid()::text = tenant_id OR tenant_id = 'public');

CREATE POLICY "Users can insert own external documents" ON isms_external_documents
  FOR INSERT WITH CHECK (auth.uid()::text = tenant_id);

CREATE POLICY "Users can update own external documents" ON isms_external_documents
  FOR UPDATE USING (auth.uid()::text = tenant_id);

CREATE POLICY "Users can delete own external documents" ON isms_external_documents
  FOR DELETE USING (auth.uid()::text = tenant_id);
```

### Validações

- **Checksum**: Validação SHA256 para integridade
- **Idioma**: pt-BR, en-US, es
- **Fonte**: sharepoint, onedrive, ged, google_drive, dropbox, box, other
- **Tamanho**: Limite configurável por tenant

## 🌐 Internacionalização (i18n)

### Idiomas Suportados

- **pt-BR**: Português do Brasil
- **en-US**: Inglês Americano
- **es**: Espanhol

### Estrutura de Storage

```
isms-documents/
├── [tenant_id]/
│   ├── [external_id]/
│   │   ├── [version]/
│   │   │   └── document.pdf
│   │   └── metadata.json
│   └── ...
```

## 📊 Monitoramento e Auditoria

### Logs de Sincronização

Cada operação gera um log com:
- **Ação**: ingest, update, delete, sync
- **Status**: success, failed, partial
- **Detalhes**: JSON com informações da operação
- **Timestamp**: Data/hora da operação

### Métricas Disponíveis

- Total de documentos por fonte
- Taxa de sucesso de sincronização
- Documentos por idioma
- Última sincronização por tenant

## 🔄 Replicação para Outros Módulos

### Passos para Replicar

1. **Copiar Estrutura de Arquivos:**
   ```
   src/api/[module]/external-documents.js
   scripts/create-[module]-external-documents-tables.sql
   scripts/test-[module]-external-documents.js
   ```

2. **Adaptar Nomes de Tabelas:**
   ```sql
   -- Exemplo para módulo Risk
   CREATE TABLE risk_external_documents (...)
   CREATE TABLE risk_sync_audit_logs (...)
   ```

3. **Atualizar MCP Server:**
   ```javascript
   // Adicionar funções específicas do módulo
   async ingestRiskExternalDocument(args) { ... }
   async listRiskExternalDocuments(args) { ... }
   ```

4. **Configurar Storage Bucket:**
   ```javascript
   const storageBucket = 'risk-documents';
   ```

5. **Atualizar Endpoints:**
   ```javascript
   router.use('/external-documents', externalDocumentsRouter);
   ```

### Módulos Candidatos

- **n.Risk**: Documentos de análise de risco
- **n.Audit**: Evidências de auditoria
- **n.Privacy**: Documentos de conformidade LGPD/GDPR
- **n.SecDevOps**: Relatórios de segurança

## 🧪 Testes

### Script de Teste

```bash
# Executar testes
node scripts/test-external-documents.js

# Testar apenas MCP
node -e "require('./scripts/test-external-documents.js').testMCPServer()"
```

### Cenários de Teste

1. **Ingestão Válida**: Documento com todos os campos obrigatórios
2. **Validações**: Campos inválidos, idiomas não suportados
3. **Download**: Geração de URLs assinadas
4. **MCP Server**: Funções via Model Context Protocol
5. **Segurança**: Acesso negado para usuários sem permissão

## 📈 Performance

### Otimizações Implementadas

- **Índices**: Otimizados para consultas por tenant, source, policy
- **Paginação**: Suporte a limit/offset
- **Cache**: URLs assinadas com TTL configurável
- **Compressão**: Arquivos PDF comprimidos no storage

### Métricas Esperadas

- **Ingestão**: < 30s por documento
- **Download**: < 5s para gerar URL
- **Listagem**: < 1s para 1000 documentos
- **Storage**: 99.9% disponibilidade

## 🚀 Deploy e Configuração

### Variáveis de Ambiente

```bash
# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-supabase-key

# Storage
SUPABASE_STORAGE_BUCKET=isms-documents

# Segurança
JWT_SECRET=your-jwt-secret

# Limites
MAX_FILE_SIZE=10485760  # 10MB
DOWNLOAD_URL_TTL=3600   # 1 hora
```

### Scripts de Setup

```bash
# Criar tabelas
psql -d your-database -f scripts/create-external-documents-tables.sql

# Configurar storage
supabase storage create isms-documents

# Testar funcionalidade
node scripts/test-external-documents.js
```

## 📚 Referências

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [n8n Automation Platform](https://n8n.io/)

---

**Versão**: 1.0.0  
**Última Atualização**: Janeiro 2024  
**Autor**: n.CISO Development Team 