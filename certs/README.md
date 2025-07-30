# 🔐 Certificados SSL

## 📋 Estrutura de Arquivos

Coloque seus certificados SSL aqui:

- `supabase.crt` - Certificado do servidor
- `supabase.key` - Chave privada
- `ca.crt` - Certificado da autoridade certificadora

## ⚠️ Segurança

- **NUNCA** commite certificados no git
- Mantenha as chaves privadas seguras
- Use variáveis de ambiente para produção

## 🔧 Como Configurar

1. Obtenha os certificados do Supabase
2. Coloque os arquivos neste diretório
3. Configure as permissões adequadas
4. Teste a conexão SSL

## 🧪 Teste

```bash
npm run test:ssl
```
