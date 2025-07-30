# 🛡️ n.CISO Frontend

Frontend React/Next.js para a plataforma n.CISO - Gestão de Segurança da Informação.

## 🚀 Tecnologias

- **Next.js 14** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **ShadCN UI** - Componentes
- **Radix UI** - Primitivos acessíveis
- **i18next** - Internacionalização
- **Supabase** - Autenticação e banco
- **React Query** - Gerenciamento de estado
- **Lucide React** - Ícones

## 🎨 Design System

- **Cores**: Gray scale + Primary (#00ade0)
- **Tipografia**: Montserrat
- **Tema**: Escuro/Claro automático
- **Responsivo**: Mobile-first
- **Acessibilidade**: WCAG 2.1

## 📁 Estrutura

```
src/
├── app/                 # App Router (Next.js 14)
│   ├── login/          # Página de login
│   ├── dashboard/      # Dashboard principal
│   └── layout.tsx      # Layout raiz
├── components/         # Componentes React
│   └── ui/            # Componentes base
├── lib/               # Utilitários e configurações
│   ├── constants.ts   # Constantes do Design System
│   ├── i18n.ts       # Configuração i18n
│   ├── supabase.ts   # Cliente Supabase
│   ├── utils.ts      # Utilitários
│   └── query-client.ts # React Query
└── styles/           # Estilos globais
```

## 🚀 Como Executar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Executar em Desenvolvimento
```bash
npm run dev
```

### 4. Acessar
- **URL**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Dashboard**: http://localhost:3000/dashboard

## 🔐 Autenticação

O frontend usa **Supabase Auth** para autenticação:

- **Login**: Email/senha
- **Sessão**: Persistente
- **Proteção**: Rotas protegidas
- **Logout**: Limpeza automática

## 🌍 Internacionalização

Suporte a múltiplos idiomas:

- **pt-BR** (padrão)
- **en-US**
- **es**

### Uso
```tsx
import { useTranslation } from 'react-i18next'

const { t } = useTranslation()
t('auth.login') // "Entrar"
```

## 📊 Componentes

### MCPTable
Tabela avançada para listagem de dados:

```tsx
<MCPTable
  title="Políticas"
  data={policies}
  columns={columns}
  loading={loading}
  onSearch={handleSearch}
  onAdd={handleAdd}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

### Design System
Componentes base seguindo o Design System:

- `Button` - Botões com variantes
- `Input` - Campos de entrada
- `Card` - Cards com header/content/footer
- `MCPTable` - Tabela avançada

## 🎨 Tema

### Cores
```css
/* Primary */
--primary-50: #e6f7ff
--primary-500: #00ade0
--primary-900: #005d80

/* Gray Scale */
--gray-50: #f9fafb
--gray-900: #111827
```

### Modo Escuro
- **Automático**: Detecta preferência do sistema
- **Manual**: Toggle no header
- **Persistente**: Salva no localStorage

## 📱 Responsividade

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔧 Scripts

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Linting
npm run type-check   # Verificação de tipos
```

## 🚀 Deploy

### Vercel (Recomendado)
1. Conectar repositório
2. Configurar variáveis de ambiente
3. Deploy automático

### Outros
```bash
npm run build
npm run start
```

## 📋 Checklist

- [x] ✅ Projeto Next.js criado
- [x] ✅ TypeScript configurado
- [x] ✅ Tailwind CSS configurado
- [x] ✅ Design System implementado
- [x] ✅ i18n configurado (pt-BR, en-US, es)
- [x] ✅ Supabase Auth integrado
- [x] ✅ React Query configurado
- [x] ✅ Página de login criada
- [x] ✅ Dashboard com MCPTable
- [x] ✅ Tema escuro implementado
- [x] ✅ Componentes base criados
- [x] ✅ Responsividade implementada

## 🎯 Próximos Passos

1. **Conectar API Real**: Integrar com backend
2. **MCP Client**: Implementar cliente MCP
3. **Funcionalidades**: CRUD completo
4. **Testes**: Unit e E2E
5. **Deploy**: Produção

## 📞 Suporte

Para dúvidas ou problemas:
- **Issues**: GitHub
- **Documentação**: README.md
- **Design System**: Figma
