# 🛡️ n.CISO - MCP Server do Supabase

## 📋 Visão Geral

O **MCP Server do Supabase** é um servidor Model Context Protocol que fornece acesso seguro e padronizado aos dados do n.CISO através do Supabase. Este servidor permite que ferramentas de IA acessem e manipulem dados de segurança de forma estruturada.

## 🚀 Instalação

### 1. Dependências
```bash
npm install @modelcontextprotocol/sdk @supabase/supabase-js
```

### 2. Configuração do Ambiente
```bash
# Adicione ao seu .env
SUPABASE_URL=sua_url_do_supabase
SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 3. Executar o Servidor
```bash
# Desenvolvimento
npm run mcp:dev

# Produção
npm run mcp:start
```

## 🛠️ Ferramentas Disponíveis

### 1. **list_policies**
Lista todas as políticas de segurança do tenant.

**Parâmetros:**
- `tenant_id` (obrigatório): ID do tenant
- `status` (opcional): Filtrar por status (draft, pending, approved, rejected)
- `limit` (opcional): Limite de resultados (padrão: 50)

**Exemplo:**
```json
{
  "tenant_id": "dev-tenant",
  "status": "approved",
  "limit": 10
}
```

### 2. **create_policy**
Cria uma nova política de segurança.

**Parâmetros:**
- `tenant_id` (obrigatório): ID do tenant
- `name` (obrigatório): Nome da política
- `content` (obrigatório): Conteúdo da política
- `description` (opcional): Descrição da política
- `version` (opcional): Versão da política (padrão: "1.0")
- `created_by` (obrigatório): ID do usuário criador

**Exemplo:**
```json
{
  "tenant_id": "dev-tenant",
  "name": "Política de Segurança da Informação",
  "description": "Política geral de segurança",
  "content": "Esta política estabelece as diretrizes...",
  "version": "1.0",
  "created_by": "user-123"
}
```

### 3. **list_controls**
Lista todos os controles de segurança do tenant.

**Parâmetros:**
- `tenant_id` (obrigatório): ID do tenant
- `control_type` (opcional): Filtrar por tipo (preventive, detective, corrective)
- `implementation_status` (opcional): Filtrar por status (planned, implemented, tested, operational)
- `limit` (opcional): Limite de resultados (padrão: 50)

### 4. **create_control**
Cria um novo controle de segurança.

**Parâmetros:**
- `tenant_id` (obrigatório): ID do tenant
- `name` (obrigatório): Nome do controle
- `control_type` (obrigatório): Tipo do controle (preventive, detective, corrective)
- `created_by` (obrigatório): ID do usuário criador
- `description` (opcional): Descrição do controle
- `implementation_status` (opcional): Status de implementação (padrão: "planned")
- `effectiveness_score` (opcional): Score de efetividade 0-100 (padrão: 0)
- `domain_id` (opcional): ID do domínio associado

### 5. **list_domains**
Lista todos os domínios hierárquicos do tenant.

**Parâmetros:**
- `tenant_id` (obrigatório): ID do tenant
- `level` (opcional): Filtrar por nível hierárquico (1-3)
- `parent_id` (opcional): Filtrar por domínio pai

### 6. **create_domain**
Cria um novo domínio hierárquico.

**Parâmetros:**
- `tenant_id` (obrigatório): ID do tenant
- `name` (obrigatório): Nome do domínio
- `created_by` (obrigatório): ID do usuário criador
- `description` (opcional): Descrição do domínio
- `parent_id` (opcional): ID do domínio pai

### 7. **effectiveness_report**
Gera relatório de efetividade dos controles.

**Parâmetros:**
- `tenant_id` (obrigatório): ID do tenant
- `domain_id` (opcional): Filtrar por domínio específico
- `control_type` (opcional): Filtrar por tipo de controle

**Retorna:**
```json
{
  "total_controls": 25,
  "implemented_controls": 18,
  "operational_controls": 15,
  "average_effectiveness": 78.5,
  "low_effectiveness_count": 3,
  "implementation_rate": 72,
  "operational_rate": 60
}
```

### 8. **health_check**
Verifica a saúde da conexão com Supabase.

**Parâmetros:** Nenhum

**Retorna:**
```json
{
  "success": true,
  "status": "connected",
  "message": "Conexão com Supabase funcionando",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔐 Segurança

### Multi-tenant
- Todas as operações são isoladas por `tenant_id`
- Validação obrigatória de tenant em todas as ferramentas
- Prevenção de vazamento de dados entre tenants

### Autenticação
- Validação de JWT tokens (preparado para implementação)
- Controle de permissões por usuário
- Logs de auditoria para ações sensíveis

### Validação de Dados
- Schemas JSON para validação de entrada
- Validação de tipos e ranges
- Sanitização de dados de entrada

## 🏗️ Arquitetura

### Estrutura de Dados
```
nciso-v1/
├── src/
│   └── mcp/
│       ├── supabase-server.js    # Servidor MCP principal
│       ├── mcp-config.json      # Configuração MCP
│       └── README.md            # Esta documentação
```

### Fluxo de Dados
1. **Cliente MCP** → **MCP Server** → **Supabase** → **PostgreSQL**
2. **Validação** de entrada com schemas JSON
3. **Isolamento** por tenant
4. **Resposta** estruturada com status e dados

### Tratamento de Erros
- **Erros de conexão**: Fallback para modo desenvolvimento
- **Erros de validação**: Respostas detalhadas com mensagens
- **Erros de permissão**: Controle de acesso granular
- **Logs**: Rastreamento completo de operações

## 🧪 Testes

### Teste de Conexão
```bash
# Testar health check
curl -X POST http://localhost:3000/api/v1/mcp/health_check
```

### Teste de Criação
```bash
# Criar política de teste
curl -X POST http://localhost:3000/api/v1/mcp/create_policy \
  -H "Content-Type: application/json" \
  -d '{
    "tenant_id": "test-tenant",
    "name": "Política de Teste",
    "content": "Conteúdo de teste",
    "created_by": "test-user"
  }'
```

## 📊 Monitoramento

### Métricas Disponíveis
- **Conexões ativas** com Supabase
- **Operações por minuto** por ferramenta
- **Taxa de erro** por operação
- **Tempo de resposta** médio

### Logs
- **INFO**: Operações bem-sucedidas
- **WARN**: Avisos de configuração
- **ERROR**: Erros de conexão ou validação
- **DEBUG**: Detalhes de debugging

## 🔧 Configuração Avançada

### Variáveis de Ambiente
```bash
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua_chave_anonima

# MCP Server
MCP_LOG_LEVEL=info
MCP_TIMEOUT=30000
MCP_MAX_CONNECTIONS=100
```

### Configuração de Desenvolvimento
```javascript
// Modo desenvolvimento sem Supabase
if (!process.env.SUPABASE_URL) {
  console.warn('⚠️  Modo desenvolvimento ativado')
  // Usar dados mock
}
```

## 🚀 Deploy

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "mcp:start"]
```

### Kubernetes
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nciso-mcp-server
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nciso-mcp-server
  template:
    metadata:
      labels:
        app: nciso-mcp-server
    spec:
      containers:
      - name: mcp-server
        image: nciso/mcp-server:latest
        ports:
        - containerPort: 3000
        env:
        - name: SUPABASE_URL
          valueFrom:
            secretKeyRef:
              name: supabase-secret
              key: url
        - name: SUPABASE_ANON_KEY
          valueFrom:
            secretKeyRef:
              name: supabase-secret
              key: anon-key
```

## 🤝 Contribuição

1. **Fork** o projeto
2. **Crie** uma branch para sua feature
3. **Implemente** a funcionalidade
4. **Teste** com dados reais
5. **Documente** as mudanças
6. **Abra** um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**🛡️ n.CISO** - MCP Server do Supabase implementado com sucesso! 