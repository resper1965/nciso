#!/usr/bin/env python3

"""
🔧 Criador de Tabelas via API Supabase
Script para criar as tabelas do n.CISO via API REST
"""

import os
import requests
import json
from datetime import datetime

def create_tables_via_api():
    print("🔧 Criando tabelas via API Supabase...\n")
    
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
    
    # Definir as tabelas que precisamos criar
    tables_to_create = [
        {
            'name': 'organizations',
            'description': 'Organizações e hierarquia',
            'test_data': {
                'name': 'Organização de Teste n.CISO',
                'type': 'company',
                'description': 'Organização criada para teste',
                'tenant_id': 'demo-tenant',
                'is_active': True
            }
        },
        {
            'name': 'assets',
            'description': 'Ativos com classificação CIA',
            'test_data': {
                'name': 'Servidor de Teste',
                'type': 'infrastructure',
                'description': 'Servidor criado para teste',
                'classification': {'confidentiality': 'high', 'integrity': 'high', 'availability': 'critical'},
                'value': 50000.00,
                'tenant_id': 'demo-tenant',
                'is_active': True
            }
        },
        {
            'name': 'evaluations',
            'description': 'Avaliações estruturadas',
            'test_data': {
                'name': 'Avaliação de Teste',
                'description': 'Avaliação criada para teste',
                'status': 'draft',
                'start_date': datetime.now().date().isoformat(),
                'tenant_id': 'demo-tenant'
            }
        },
        {
            'name': 'technical_documents',
            'description': 'Documentos técnicos',
            'test_data': {
                'name': 'Documento de Teste',
                'description': 'Documento criado para teste',
                'document_type': 'policy',
                'version': '1.0',
                'status': 'draft',
                'tenant_id': 'demo-tenant'
            }
        },
        {
            'name': 'teams',
            'description': 'Equipes',
            'test_data': {
                'name': 'Equipe de Teste',
                'description': 'Equipe criada para teste',
                'tenant_id': 'demo-tenant',
                'is_active': True
            }
        },
        {
            'name': 'credentials_registry',
            'description': 'Registro de credenciais',
            'test_data': {
                'asset_id': None,  # Será preenchido após criar assets
                'holder_type': 'user',
                'holder_id': 'test-user-123',
                'access_type': 'read',
                'justification': 'Teste de credencial',
                'valid_from': datetime.now().isoformat(),
                'valid_until': datetime.now().isoformat(),
                'status': 'pending',
                'tenant_id': 'demo-tenant'
            }
        },
        {
            'name': 'privileged_access',
            'description': 'Acesso privilegiado',
            'test_data': {
                'user_id': 'test-user-123',
                'scope_type': 'system',
                'scope_id': 'test-system-123',
                'access_level': 'read',
                'justification': 'Teste de acesso privilegiado',
                'valid_from': datetime.now().isoformat(),
                'valid_until': datetime.now().isoformat(),
                'status': 'pending',
                'tenant_id': 'demo-tenant'
            }
        }
    ]
    
    created_tables = []
    
    for table in tables_to_create:
        print(f"\n📋 Criando tabela: {table['name']}")
        print(f"Descrição: {table['description']}")
        
        # Tentar inserir dados de teste para verificar se a tabela existe
        test_url = f"{supabase_url}/rest/v1/{table['name']}"
        
        try:
            # Primeiro, tentar ler para ver se a tabela existe
            response = requests.get(f"{test_url}?select=count&limit=1", headers=headers)
            
            if response.status_code == 200:
                print(f"✅ Tabela '{table['name']}' já existe!")
                created_tables.append(table['name'])
                continue
            elif response.status_code == 404:
                print(f"❌ Tabela '{table['name']}' não existe - precisa ser criada via SQL Editor")
                print("💡 Execute o script SQL no painel do Supabase:")
                print("   scripts/supabase-complete-schema.sql")
                continue
            else:
                print(f"⚠️  Status inesperado: {response.status_code}")
                print(response.text)
                continue
                
        except Exception as e:
            print(f"❌ Erro ao verificar tabela: {str(e)}")
            continue
    
    print(f"\n📊 Resumo:")
    print(f"Tabelas existentes: {len(created_tables)}")
    print(f"Tabelas que precisam ser criadas: {len(tables_to_create) - len(created_tables)}")
    
    if len(created_tables) < len(tables_to_create):
        print(f"\n🔧 Para criar as tabelas faltantes:")
        print(f"1. Acesse: https://supabase.com/dashboard/project/pszfqqmmljekibmcgmig")
        print(f"2. Vá em SQL Editor")
        print(f"3. Execute o script: scripts/supabase-complete-schema.sql")
        print(f"4. Execute novamente: python3 test-supabase-python.py")
    
    return len(created_tables) == len(tables_to_create)

def test_after_creation():
    print("\n🧪 Testando após criação das tabelas...")
    
    # Carregar variáveis de ambiente
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    
    headers = {
        'apikey': supabase_key,
        'Authorization': f'Bearer {supabase_key}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    
    # Testar inserção em organizations
    test_org = {
        'name': 'Organização de Teste API',
        'type': 'company',
        'description': 'Organização criada via API',
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
                else:
                    print(f"⚠️  Erro na exclusão: {delete_response.status_code}")
            else:
                print(f"❌ Erro na leitura: {read_response.status_code}")
        else:
            print(f"❌ Erro na inserção: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Erro no teste: {str(e)}")

if __name__ == "__main__":
    # Carregar variáveis de ambiente do arquivo .env
    if os.path.exists('.env'):
        with open('.env', 'r') as f:
            for line in f:
                if line.strip() and not line.startswith('#'):
                    try:
                        key, value = line.strip().split('=', 1)
                        os.environ[key] = value
                    except ValueError:
                        continue
    
    success = create_tables_via_api()
    
    if success:
        test_after_creation()
    else:
        print("\n💡 Execute o script SQL no Supabase primeiro!") 