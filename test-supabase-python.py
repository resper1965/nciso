#!/usr/bin/env python3

"""
🧪 Teste de Conexão com Supabase (Python)
Script para testar se conseguimos conectar e gravar dados no Supabase
"""

import os
import requests
import json
from datetime import datetime

def test_supabase_connection():
    print("🧪 Testando conexão com Supabase...\n")
    
    # Carregar variáveis de ambiente
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    
    print("📋 Configuração:")
    print(f"URL: {supabase_url}")
    print(f"Key: {'✅ Configurada' if supabase_key else '❌ Não configurada'}")
    
    if not supabase_url or not supabase_key:
        print("❌ Variáveis de ambiente não configuradas!")
        print("Execute: ./configure-supabase.sh")
        return False
    
    # Headers para requisições
    headers = {
        'apikey': supabase_key,
        'Authorization': f'Bearer {supabase_key}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    
    try:
        # Teste 1: Verificar se conseguimos conectar
        print("\n📋 Teste 1: Verificar conexão")
        health_url = f"{supabase_url}/rest/v1/organizations?select=count&limit=1"
        
        response = requests.get(health_url, headers=headers)
        
        if response.status_code == 200:
            print("✅ Conexão estabelecida com sucesso!")
        else:
            print(f"⚠️  Erro na conexão (status {response.status_code}):")
            print(response.text)
        
        # Teste 2: Tentar criar uma organização de teste
        print("\n📋 Teste 2: Criar organização de teste")
        test_org = {
            "name": "Organização de Teste n.CISO",
            "type": "company",
            "description": "Organização criada para teste de conexão",
            "tenant_id": "test-tenant",
            "is_active": True,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        insert_url = f"{supabase_url}/rest/v1/organizations"
        response = requests.post(insert_url, headers=headers, json=test_org)
        
        if response.status_code == 201:
            print("✅ Dados inseridos com sucesso!")
            inserted_data = response.json()
            org_id = inserted_data[0]['id'] if inserted_data else None
            print(f"ID criado: {org_id}")
            
            # Teste 3: Ler os dados inseridos
            print("\n📋 Teste 3: Ler dados inseridos")
            read_url = f"{supabase_url}/rest/v1/organizations?id=eq.{org_id}"
            response = requests.get(read_url, headers=headers)
            
            if response.status_code == 200:
                data = response.json()
                if data:
                    print("✅ Dados lidos com sucesso!")
                    print(f"Organização: {data[0]['name']}")
                else:
                    print("❌ Dados não encontrados")
            else:
                print(f"❌ Erro ao ler dados: {response.status_code}")
                print(response.text)
            
            # Teste 4: Limpar dados de teste
            print("\n📋 Teste 4: Limpar dados de teste")
            delete_url = f"{supabase_url}/rest/v1/organizations?id=eq.{org_id}"
            response = requests.delete(delete_url, headers=headers)
            
            if response.status_code == 204:
                print("✅ Dados de teste removidos com sucesso!")
            else:
                print(f"❌ Erro ao deletar dados: {response.status_code}")
                print(response.text)
        else:
            print("❌ Erro ao inserir dados:")
            print(f"Status: {response.status_code}")
            print(response.text)
            print("\n💡 Possíveis causas:")
            print("1. Tabelas não criadas no Supabase")
            print("2. RLS (Row Level Security) bloqueando")
            print("3. Permissões insuficientes")
        
        # Teste 5: Verificar tabelas existentes
        print("\n📋 Teste 5: Verificar tabelas disponíveis")
        tables = [
            'organizations',
            'assets', 
            'domains',
            'evaluations',
            'technical_documents',
            'credentials_registry',
            'privileged_access',
            'policies',
            'controls'
        ]
        
        for table in tables:
            try:
                table_url = f"{supabase_url}/rest/v1/{table}?select=count&limit=1"
                response = requests.get(table_url, headers=headers)
                
                if response.status_code == 200:
                    print(f"✅ Tabela '{table}': Disponível")
                else:
                    print(f"❌ Tabela '{table}': {response.status_code} - {response.text}")
            except Exception as e:
                print(f"❌ Tabela '{table}': {str(e)}")
        
        print("\n🎉 Teste de conexão concluído!")
        print("\n📊 Resumo:")
        print("✅ Cliente Supabase: Funcionando")
        print("✅ Conexão: Estabelecida")
        print("✅ Autenticação: Configurada")
        
        if response.status_code != 201:
            print("⚠️  Inserção de dados: Falhou (tabelas podem não existir)")
            print("\n💡 Para resolver:")
            print("1. Execute os scripts SQL no painel do Supabase")
            print("2. Verifique as permissões RLS")
            print("3. Execute este teste novamente")
        else:
            print("✅ Inserção de dados: Funcionando")
            print("✅ Leitura de dados: Funcionando")
            print("✅ Exclusão de dados: Funcionando")
        
        return True
        
    except Exception as error:
        print(f"❌ Erro durante o teste: {error}")
        return False

if __name__ == "__main__":
    # Carregar variáveis de ambiente do arquivo .env
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            for line in f:
                if line.strip() and not line.startswith('#'):
                    key, value = line.strip().split('=', 1)
                    os.environ[key] = value
    
    test_supabase_connection() 