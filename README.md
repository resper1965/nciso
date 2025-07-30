# 🛡️ n.CISO - Information Security Management Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-orange.svg)](https://supabase.com/)

> **n.CISO** é uma plataforma completa de gestão de segurança da informação, desenvolvida com tecnologias modernas e arquitetura multi-tenant.

## 🚀 **Características Principais**

- **🔐 Autenticação JWT** com Supabase
- **🏢 Arquitetura Multi-tenant** com isolamento de dados
- **🌐 Interface Moderna** com React/Next.js
- **📊 Dashboard Interativo** com métricas em tempo real
- **🔒 Políticas de Segurança** (RLS) no banco de dados
- **🌍 Suporte Multi-idioma** (pt-BR, en-US, es)
- **📱 Design Responsivo** com Tailwind CSS
- **🐳 Containerização** com Docker
- **🚀 Deploy Automatizado** para VPS

## 🏗️ **Arquitetura**

```
n.CISO Platform
├── 🎯 Backend (Node.js/Express)
│   ├── API RESTful
│   ├── Middleware de Autenticação
│   ├── MCP Server (Model Context Protocol)
│   └── Integração Supabase
├── 🎨 Frontend (React/Next.js)
│   ├── Design System
│   ├── Componentes UI
│   ├── Páginas Responsivas
│   └── i18n Internacionalização
├── 🗄️ Banco de Dados (Supabase/PostgreSQL)
│   ├── Tabelas Multi-tenant
│   ├── Políticas RLS
│   ├── Funções Auxiliares
│   └── Triggers Automatizados
└── 🐳 Infraestrutura (Docker)
    ├── Containers Isolados
    ├── Nginx Reverse Proxy
    ├── SSL Automático
    └── Deploy VPS
```

## 🛠️ **Tecnologias**

### **Backend**
- **Node.js 18+** - Runtime JavaScript
- **Express.js** - Framework Web
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Banco de Dados
- **JWT** - Autenticação
- **Zod** - Validação de Schemas
- **Winston** - Logging
- **Helmet.js** - Segurança

### **Frontend**
- **React 18** - Biblioteca UI
- **Next.js 14** - Framework React
- **TypeScript** - Tipagem Estática
- **Tailwind CSS** - Framework CSS
- **ShadCN UI** - Componentes
- **i18next** - Internacionalização
- **React Query** - Gerenciamento de Estado
- **Axios** - Cliente HTTP

### **DevOps**
- **Docker** - Containerização
- **Docker Compose** - Orquestração
- **Nginx** - Reverse Proxy
- **SSL/TLS** - Criptografia
- **Git** - Controle de Versão

## 📦 **Instalação**

### **Pré-requisitos**
- Node.js 18+
- npm ou yarn
- Git
- Docker (opcional)

### **1. Clone o Repositório**
```bash
git clone https://github.com/resper1965/nciso.git
cd nciso
```

### **2. Instale as Dependências**
```bash
# Backend
npm install

# Frontend
cd nciso-frontend
npm install
cd ..
```

### **3. Configure as Variáveis de Ambiente**
```bash
# Copie o arquivo de exemplo
cp .env.example .env

# Edite com suas credenciais Supabase
nano .env
```

### **4. Configure o Supabase**
```bash
# Aplique o schema do banco de dados
npm run apply:schema

# Verifique a conexão
npm run test:connection
```

### **5. Inicie o Desenvolvimento**
```bash
# Backend apenas
npm run dev

# Frontend apenas
cd nciso-frontend && npm run dev

# Fullstack (backend + frontend)
npm run start:fullstack
```

## 🚀 **Deploy em Produção**

### **Opção 1: VPS com EasyPanel**
```bash
# Configure para EasyPanel
npm run setup:easypanel

# Siga as instruções em EASYPANEL_INSTRUCTIONS.md
```

### **Opção 2: VPS Manual**
```bash
# Deploy automatizado
npm run deploy:vps

# Ou manualmente
chmod +x scripts/deploy-vps.sh
./scripts/deploy-vps.sh
```

### **Opção 3: Docker Compose**
```bash
# Build e deploy
docker-compose up -d

# Verificar status
docker-compose ps
```

## 📊 **Estrutura do Projeto**

```
nciso-v1/
├── 📁 src/
│   ├── 📁 api/           # Backend API
│   ├── 📁 config/        # Configurações
│   ├── 📁 middleware/    # Middlewares
│   ├── 📁 mcp/          # MCP Server
│   └── 📁 utils/        # Utilitários
├── 📁 nciso-frontend/   # Frontend Next.js
├── 📁 scripts/          # Scripts de automação
├── 📁 docs/            # Documentação
├── 🐳 Dockerfile.*     # Containers
├── 📋 docker-compose.yml
└── 📖 README.md
```

## 🔧 **Scripts Disponíveis**

### **Desenvolvimento**
```bash
npm run dev              # Backend em desenvolvimento
npm run start:fullstack  # Backend + Frontend
npm run test:connection  # Testar conexão Supabase
npm run check:schema     # Verificar schema DB
```

### **Deploy**
```bash
npm run setup:easypanel  # Configurar EasyPanel
npm run deploy:vps       # Deploy VPS
npm run status           # Status do projeto
```

### **Testes**
```bash
npm run test:policies    # Testar API Policies
npm run test:invites     # Testar API Invites
npm run check:backend    # Verificar Backend
```

## 🗄️ **Schema do Banco de Dados**

### **Tabelas Principais**
- **`users`** - Usuários do sistema
- **`tenants`** - Organizações/empresas
- **`policies`** - Políticas de segurança
- **`controls`** - Controles de segurança
- **`domains`** - Domínios de segurança
- **`assessments`** - Avaliações de risco
- **`risks`** - Riscos identificados
- **`audits`** - Auditorias
- **`incidents`** - Incidentes de segurança
- **`tickets`** - Tickets de suporte
- **`invites`** - Convites para organização

### **Políticas RLS**
- Isolamento multi-tenant
- Controle de acesso por role
- Auditoria automática

## 🔐 **Segurança**

- **JWT Authentication** com Supabase
- **Row Level Security (RLS)** no PostgreSQL
- **HTTPS** obrigatório em produção
- **Helmet.js** para headers de segurança
- **Rate Limiting** para APIs
- **Input Validation** com Zod
- **SQL Injection Protection**

## 🌍 **Internacionalização**

Suporte para múltiplos idiomas:
- **🇧🇷 Português (pt-BR)** - Padrão
- **🇺🇸 Inglês (en-US)** - Internacional
- **🇪🇸 Espanhol (es)** - Latino

## 📈 **Monitoramento**

- **Logs Estruturados** com Winston
- **Health Checks** automáticos
- **Métricas de Performance**
- **Alertas de Erro**

## 🤝 **Contribuição**

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 **Licença**

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 **Suporte**

- **📧 Email**: suporte@nciso.com
- **🐛 Issues**: [GitHub Issues](https://github.com/resper1965/nciso/issues)
- **📖 Docs**: [Documentação](https://docs.nciso.com)

## 🙏 **Agradecimentos**

- **Supabase** - Backend-as-a-Service
- **Vercel** - Deploy e hosting
- **Tailwind CSS** - Framework CSS
- **ShadCN UI** - Componentes
- **Heroicons** - Ícones

---

**🛡️ n.CISO** - Transformando a gestão de segurança da informação
