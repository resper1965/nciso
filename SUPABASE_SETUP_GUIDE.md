# 🛡️ Guia de Configuração do Supabase - n.CISO

## 📋 Pré-requisitos

- Acesso ao painel do Supabase
- Projeto: `pszfqqmmljekibmcgmig`
- URL: https://pszfqqmmljekibmcgmig.supabase.co

## 🔧 Passos para Configuração

### 1. Acessar o SQL Editor

1. Acesse: https://supabase.com/dashboard/project/pszfqqmmljekibmcgmig
2. No menu lateral, clique em **"SQL Editor"**
3. Clique em **"New query"**

### 2. Executar o Script Completo

1. Copie todo o conteúdo do arquivo `scripts/supabase-complete-schema.sql`
2. Cole no SQL Editor do Supabase
3. Clique em **"Run"**

### 3. Verificar a Execução

Após executar o script, você deve ver:
```
✅ Schema n.CISO criado com sucesso!
```

## 📊 Tabelas Criadas

O script criará as seguintes tabelas:

### ✅ Tabelas Principais
- **organizations** - Organizações e hierarquia
- **assets** - Ativos com classificação CIA
- **evaluations** - Avaliações estruturadas
- **technical_documents** - Documentos técnicos
- **teams** - Equipes
- **credentials_registry** - Registro de credenciais
- **privileged_access** - Acesso privilegiado

### ✅ Tabelas Existentes (já funcionando)
- **domains** - Domínios hierárquicos
- **policies** - Políticas de segurança
- **controls** - Controles organizacionais

## 🧪 Testar a Configuração

Após executar o script, teste a conexão:

```bash
cd /home/nciso/nciso
python3 test-supabase-python.py
```

### Resultado Esperado

```
🧪 Testando conexão com Supabase...

📋 Configuração:
URL: https://pszfqqmmljekibmcgmig.supabase.co
Key: ✅ Configurada

📋 Teste 1: Verificar conexão
✅ Conexão estabelecida com sucesso!

📋 Teste 2: Criar organização de teste
✅ Dados inseridos com sucesso!
ID criado: [UUID]

📋 Teste 3: Ler dados inseridos
✅ Dados lidos com sucesso!
Organização: Organização de Teste n.CISO

📋 Teste 4: Limpar dados de teste
✅ Dados de teste removidos com sucesso!

📋 Teste 5: Verificar tabelas disponíveis
✅ Tabela 'organizations': Disponível
✅ Tabela 'assets': Disponível
✅ Tabela 'domains': Disponível
✅ Tabela 'evaluations': Disponível
✅ Tabela 'technical_documents': Disponível
✅ Tabela 'credentials_registry': Disponível
✅ Tabela 'privileged_access': Disponível
✅ Tabela 'policies': Disponível
✅ Tabela 'controls': Disponível

🎉 Teste de conexão concluído!

📊 Resumo:
✅ Cliente Supabase: Funcionando
✅ Conexão: Estabelecida
✅ Autenticação: Configurada
✅ Inserção de dados: Funcionando
✅ Leitura de dados: Funcionando
✅ Exclusão de dados: Funcionando
```

## 🔐 Configurações de Segurança

### RLS (Row Level Security)

O script configura RLS em todas as tabelas com políticas baseadas em `tenant_id`. Para desenvolvimento, você pode:

1. **Desabilitar RLS temporariamente:**
```sql
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE assets DISABLE ROW LEVEL SECURITY;
-- ... (repita para outras tabelas)
```

2. **Ou criar políticas mais permissivas:**
```sql
CREATE POLICY "allow_all" ON organizations FOR ALL USING (true);
CREATE POLICY "allow_all" ON assets FOR ALL USING (true);
-- ... (repita para outras tabelas)
```

## 📊 Dados de Exemplo

O script inclui dados de exemplo:

### Organizações
- n.CISO Corporation (empresa)
- Departamento de TI (departamento)
- Equipe de Segurança (unidade)

### Ativos
- Servidor Principal (infraestrutura)
- Base de Dados Cliente (dados)
- Aplicação Web (software)

### Equipes
- Equipe de Desenvolvimento
- Equipe de Operações

## 🚀 Próximos Passos

Após a configuração bem-sucedida:

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

## 🔧 Troubleshooting

### Erro: "relation does not exist"
- Verifique se o script foi executado completamente
- Execute novamente o script SQL

### Erro: "permission denied"
- Verifique as políticas RLS
- Temporariamente desabilite RLS para testes

### Erro: "authentication failed"
- Verifique as credenciais no arquivo `.env`
- Confirme se as chaves estão corretas

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs do Supabase
2. Execute o script de teste novamente
3. Verifique as configurações de RLS
4. Consulte a documentação do Supabase

---

**✅ Configuração concluída quando todos os testes passarem!** 