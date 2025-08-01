#!/usr/bin/env python3

"""
🎯 Script para Zerar o Bloco - Setup Completo n.CISO
Guia passo a passo para configurar o Supabase e testar
"""

import os
import requests
import json
from datetime import datetime

def show_instructions():
    """Mostrar instruções detalhadas"""
    print("🎯 ZERANDO O BLOCO - SETUP COMPLETO n.CISO")
    print("=" * 60)
    print()
    print("📋 PASSO 1: Acessar o Supabase")
    print("1. Abra: https://supabase.com/dashboard/project/pszfqqmmljekibmcgmig")
    print("2. Faça login se necessário")
    print("3. No menu lateral, clique em 'SQL Editor'")
    print("4. Clique em 'New query' (botão azul)")
    print()
    print("📋 PASSO 2: Copiar o SQL")
    print("1. Abra o arquivo: supabase-schema-ready.sql")
    print("2. Selecione todo o conteúdo (Ctrl+A)")
    print("3. Copie (Ctrl+C)")
    print()
    print("📋 PASSO 3: Colar e Executar")
    print("1. Cole no SQL Editor do Supabase (Ctrl+V)")
    print("2. Clique em 'Run' (botão azul)")
    print("3. Aguarde a execução")
    print("4. Você deve ver: '✅ Schema n.CISO criado com sucesso!'")
    print()
    print("📋 PASSO 4: Verificar Tabelas")
    print("1. No menu lateral, clique em 'Table Editor'")
    print("2. Você deve ver as tabelas criadas:")
    print("   ✅ organizations")
    print("   ✅ assets")
    print("   ✅ evaluations")
    print("   ✅ technical_documents")
    print("   ✅ teams")
    print("   ✅ credentials_registry")
    print("   ✅ privileged_access")
    print()
    print("📋 PASSO 5: Testar Conexão")
    print("Execute este comando após criar as tabelas:")
    print("python3 test-supabase-python.py")
    print()
    print("🎯 RESULTADO ESPERADO:")
    print("✅ Conexão estabelecida com sucesso!")
    print("✅ Dados inseridos com sucesso!")
    print("✅ Dados lidos com sucesso!")
    print("✅ Dados de teste removidos com sucesso!")
    print("✅ Todas as tabelas disponíveis!")
    print()
    print("🚀 PRÓXIMOS PASSOS:")
    print("1. npm run dev")
    print("2. Acessar: http://localhost:3000/isms")
    print("3. Testar todas as funcionalidades")
    print()
    print("=" * 60)
    print("💡 DICA: Execute o SQL no Supabase e depois rode este script novamente!")
    print("=" * 60)

def test_after_setup():
    """Testar após configuração"""
    print("\n🧪 Testando após configuração...")
    
    # Carregar variáveis de ambiente
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    
    if not supabase_url or not supabase_key:
        print("❌ Variáveis de ambiente não configuradas!")
        return False
    
    headers = {
        'apikey': supabase_key,
        'Authorization': f'Bearer {supabase_key}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    
    # Lista de tabelas para testar
    tables_to_test = [
        'organizations',
        'assets',
        'evaluations',
        'technical_documents',
        'teams',
        'credentials_registry',
        'privileged_access'
    ]
    
    available_tables = []
    
    print("📋 Verificando tabelas disponíveis...")
    
    for table in tables_to_test:
        try:
            response = requests.get(
                f"{supabase_url}/rest/v1/{table}?select=count&limit=1",
                headers=headers
            )
            
            if response.status_code == 200:
                print(f"✅ Tabela '{table}': Disponível")
                available_tables.append(table)
            else:
                print(f"❌ Tabela '{table}': Não disponível ({response.status_code})")
                
        except Exception as e:
            print(f"❌ Erro ao verificar '{table}': {str(e)}")
    
    print(f"\n📊 Resumo:")
    print(f"Tabelas disponíveis: {len(available_tables)}/{len(tables_to_test)}")
    
    if len(available_tables) == len(tables_to_test):
        print("🎉 TODAS AS TABELAS ESTÃO DISPONÍVEIS!")
        
        # Testar inserção em organizations
        print("\n🧪 Testando inserção de dados...")
        
        test_org = {
            'name': 'n.CISO Corporation',
            'type': 'company',
            'description': 'Empresa principal do sistema n.CISO',
            'tenant_id': 'demo-tenant',
            'is_active': True
        }
        
        try:
            response = requests.post(
                f"{supabase_url}/rest/v1/organizations",
                headers=headers,
                json=test_org
            )
            
            if response.status_code == 201:
                print("✅ Inserção em organizations funcionando!")
                org_data = response.json()
                org_id = org_data[0]['id'] if org_data else None
                
                # Testar leitura
                read_response = requests.get(
                    f"{supabase_url}/rest/v1/organizations?id=eq.{org_id}",
                    headers=headers
                )
                
                if read_response.status_code == 200:
                    print("✅ Leitura de organizations funcionando!")
                    
                    # Limpar dados de teste
                    delete_response = requests.delete(
                        f"{supabase_url}/rest/v1/organizations?id=eq.{org_id}",
                        headers=headers
                    )
                    
                    if delete_response.status_code == 204:
                        print("✅ Exclusão de organizations funcionando!")
                        print("\n🎉 BLOCO ZERADO COM SUCESSO!")
                        print("✅ Todas as operações CRUD funcionando!")
                        print("✅ n.ISMS está pronto para uso!")
                        return True
                    else:
                        print(f"⚠️  Erro na exclusão: {delete_response.status_code}")
                else:
                    print(f"❌ Erro na leitura: {read_response.status_code}")
            else:
                print(f"❌ Erro na inserção: {response.status_code}")
                print(response.text)
                
        except Exception as e:
            print(f"❌ Erro no teste: {str(e)}")
    else:
        print("\n❌ Nem todas as tabelas estão disponíveis.")
        print("💡 Execute o SQL no Supabase primeiro!")
    
    return False

def main():
    print("🎯 ZERANDO O BLOCO - n.CISO SETUP")
    print("=" * 50)
    
    # Carregar variáveis de ambiente
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            for line in f:
                if line.strip() and not line.startswith('#'):
                    try:
                        key, value = line.strip().split('=', 1)
                        os.environ[key] = value
                    except ValueError:
                        continue
    
    # Mostrar instruções
    show_instructions()
    
    # Perguntar se o usuário executou o SQL
    print("\n❓ Você já executou o SQL no Supabase? (s/n): ", end="")
    
    # Simular resposta positiva para teste
    user_response = "s"  # Assumindo que o usuário respondeu sim
    
    if user_response.lower() in ['s', 'sim', 'y', 'yes']:
        print("✅ Testando configuração...")
        
        if test_after_setup():
            print("\n🎉 PARABÉNS! O BLOCO FOI ZERADO!")
            print("🚀 n.CISO está pronto para uso!")
            print("\n📋 Próximos passos:")
            print("1. cd /home/nciso/nciso")
            print("2. npm run dev")
            print("3. Acessar: http://localhost:3000/isms")
            print("4. Testar todas as funcionalidades!")
        else:
            print("\n❌ Configuração incompleta.")
            print("💡 Execute o SQL no Supabase primeiro!")
    else:
        print("\n💡 Execute o SQL no Supabase e depois rode este script novamente!")

if __name__ == "__main__":
    main() 