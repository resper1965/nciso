# 📊 API de Efetividade dos Controles

## Epic 4 — Avaliações de Efetividade de Controles

### 🎯 Objetivo
API REST completa para gerenciar avaliações de efetividade dos controles, incluindo CRUD, estatísticas e relatórios.

---

## 🚀 Endpoints Disponíveis

### Base URL
```
/api/controls/effectiveness
```

---

## 📋 Endpoints

### 1. **GET /** - Listar Avaliações
Lista todas as avaliações de efetividade com filtros e paginação.

**URL:** `GET /api/controls/effectiveness`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Query Parameters:**
- `control_id` (UUID, opcional): Filtrar por controle específico
- `page` (number, padrão: 1): Página da paginação
- `limit` (number, padrão: 20): Itens por página
- `score_min` (number, opcional): Score mínimo
- `score_max` (number, opcional): Score máximo
- `data_inicio` (string, opcional): Data de início (ISO)
- `data_fim` (string, opcional): Data de fim (ISO)
- `avaliador_id` (UUID, opcional): Filtrar por avaliador

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "control_id": "uuid",
      "score": 85,
      "comentario": "Controle implementado corretamente",
      "data_avaliacao": "2025-01-27T10:00:00Z",
      "tenant_id": "uuid",
      "avaliador_id": "uuid",
      "created_at": "2025-01-27T10:00:00Z",
      "updated_at": "2025-01-27T10:00:00Z",
      "global_controls": {
        "id": "uuid",
        "name": "Controle de Acesso",
        "type": "preventive",
        "status": "active"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "pages": 3
  }
}
```

---

### 2. **GET /:id** - Buscar Avaliação Específica
Retorna uma avaliação específica por ID.

**URL:** `GET /api/controls/effectiveness/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "control_id": "uuid",
    "score": 85,
    "comentario": "Controle implementado corretamente",
    "data_avaliacao": "2025-01-27T10:00:00Z",
    "tenant_id": "uuid",
    "avaliador_id": "uuid",
    "global_controls": {
      "id": "uuid",
      "name": "Controle de Acesso",
      "type": "preventive",
      "status": "active"
    }
  }
}
```

---

### 3. **POST /** - Criar Avaliação
Cria uma nova avaliação de efetividade.

**URL:** `POST /api/controls/effectiveness`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**
```json
{
  "control_id": "uuid",
  "score": 85,
  "comentario": "Controle implementado corretamente",
  "data_avaliacao": "2025-01-27T10:00:00Z"
}
```

**Campos Obrigatórios:**
- `control_id`: UUID do controle
- `score`: Número entre 0 e 100

**Campos Opcionais:**
- `comentario`: Texto descritivo
- `data_avaliacao`: Data da avaliação (ISO)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "control_id": "uuid",
    "score": 85,
    "comentario": "Controle implementado corretamente",
    "data_avaliacao": "2025-01-27T10:00:00Z",
    "tenant_id": "uuid",
    "avaliador_id": "uuid"
  },
  "message": "Avaliação criada com sucesso"
}
```

---

### 4. **PUT /:id** - Atualizar Avaliação
Atualiza uma avaliação existente.

**URL:** `PUT /api/controls/effectiveness/:id`

**Body:**
```json
{
  "score": 95,
  "comentario": "Avaliação atualizada"
}
```

**Campos Opcionais:**
- `score`: Número entre 0 e 100
- `comentario`: Texto descritivo
- `data_avaliacao`: Data da avaliação (ISO)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "score": 95,
    "comentario": "Avaliação atualizada",
    "updated_at": "2025-01-27T10:00:00Z"
  },
  "message": "Avaliação atualizada com sucesso"
}
```

---

### 5. **DELETE /:id** - Deletar Avaliação
Remove uma avaliação específica.

**URL:** `DELETE /api/controls/effectiveness/:id`

**Response:**
```json
{
  "success": true,
  "message": "Avaliação deletada com sucesso"
}
```

---

### 6. **GET /stats** - Estatísticas de Efetividade
Retorna estatísticas gerais ou de um controle específico.

**URL:** `GET /api/controls/effectiveness/stats`

**Query Parameters:**
- `control_id` (UUID, opcional): Para estatísticas de controle específico

**Response (Geral):**
```json
{
  "success": true,
  "data": {
    "total_evaluations": 150,
    "avg_score": 78.5,
    "controls_with_evaluations": 45,
    "last_evaluation_date": "2025-01-27T10:00:00Z",
    "score_distribution": {
      "excellent": 25,
      "good": 60,
      "fair": 45,
      "poor": 20
    }
  }
}
```

**Response (Controle Específico):**
```json
{
  "success": true,
  "data": {
    "control_id": "uuid",
    "avg_score": 85.2,
    "total_evaluations": 5,
    "last_evaluation_date": "2025-01-27T10:00:00Z"
  }
}
```

---

### 7. **GET /low-effectiveness** - Controles com Baixa Efetividade
Lista controles com efetividade abaixo do threshold.

**URL:** `GET /api/controls/effectiveness/low-effectiveness`

**Query Parameters:**
- `min_score` (number, padrão: 50): Score mínimo para considerar "baixa efetividade"

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "control_id": "uuid",
      "control_name": "Controle de Acesso",
      "avg_score": 45.5,
      "total_evaluations": 3,
      "last_evaluation_date": "2025-01-27T10:00:00Z"
    }
  ],
  "filters": {
    "min_score": 50
  }
}
```

---

## 🔒 Segurança

### Autenticação
- **JWT Token**: Obrigatório em todos os endpoints
- **Tenant Isolation**: Dados isolados por tenant_id
- **Role-based Access**: Permissões baseadas em roles

### Roles Permitidos
- **admin**: Acesso completo
- **manager**: CRUD de avaliações
- **auditor**: Leitura e criação de avaliações
- **user**: Apenas leitura

### Validações
- **Score**: Entre 0 e 100
- **UUID**: Validação de formato
- **Tenant**: Verificação de propriedade
- **Controle**: Existência e pertencimento ao tenant

---

## 📊 Códigos de Status

### Sucesso
- `200 OK`: Operação bem-sucedida
- `201 Created`: Recurso criado
- `204 No Content`: Deletado com sucesso

### Erro do Cliente
- `400 Bad Request`: Dados inválidos
- `401 Unauthorized`: Token inválido/missing
- `403 Forbidden`: Permissão insuficiente
- `404 Not Found`: Recurso não encontrado

### Erro do Servidor
- `500 Internal Server Error`: Erro interno

---

## 🛠️ Exemplos de Uso

### Criar Avaliação
```bash
curl -X POST http://localhost:3000/api/controls/effectiveness \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "control_id": "123e4567-e89b-12d3-a456-426614174000",
    "score": 85,
    "comentario": "Controle implementado corretamente"
  }'
```

### Listar com Filtros
```bash
curl -X GET "http://localhost:3000/api/controls/effectiveness?score_min=80&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Buscar Estatísticas
```bash
curl -X GET http://localhost:3000/api/controls/effectiveness/stats \
  -H "Authorization: Bearer <token>"
```

### Controles com Baixa Efetividade
```bash
curl -X GET "http://localhost:3000/api/controls/effectiveness/low-effectiveness?min_score=70" \
  -H "Authorization: Bearer <token>"
```

---

## 📈 Funcionalidades Avançadas

### Paginação
- Suporte a paginação com `page` e `limit`
- Retorna metadados de paginação
- Ordenação por data de avaliação (mais recente primeiro)

### Filtros
- Por controle específico
- Por faixa de score
- Por período de data
- Por avaliador

### Estatísticas
- Média geral de efetividade
- Distribuição por faixas (excellent, good, fair, poor)
- Controles com avaliações
- Data da última avaliação

### Relatórios
- Controles com baixa efetividade
- Threshold configurável
- Ordenação por score crescente

---

## 🔍 Logs e Auditoria

### Ações Registradas
- `list_evaluations`: Listagem de avaliações
- `get_evaluation`: Busca de avaliação específica
- `create_evaluation`: Criação de avaliação
- `update_evaluation`: Atualização de avaliação
- `delete_evaluation`: Remoção de avaliação
- `get_effectiveness_stats`: Consulta de estatísticas
- `get_low_effectiveness_controls`: Relatório de baixa efetividade

### Dados de Log
- Ação realizada
- Detalhes da operação
- Tenant ID
- User ID
- Timestamp

---

## 🧪 Testes

### Script de Teste
```bash
node scripts/test-effectiveness-api.js
```

### Testes Incluídos
- ✅ Listagem de avaliações
- ✅ Criação de avaliação
- ✅ Busca de avaliação específica
- ✅ Atualização de avaliação
- ✅ Estatísticas de efetividade
- ✅ Controles com baixa efetividade
- ✅ Filtros na listagem
- ✅ Validação de dados
- ✅ Autenticação
- ✅ Permissões

---

## 📝 Próximos Passos

1. **Componentes UI**: Formulários de avaliação
2. **Comandos MCP**: Integração com MCP Server
3. **Relatórios Visuais**: Dashboards de efetividade
4. **Notificações**: Alertas de baixa efetividade
5. **Exportação**: Relatórios em PDF/Excel

---

**Status**: ✅ API Completa  
**Versão**: 1.0.0  
**Data**: 2025-01-27 