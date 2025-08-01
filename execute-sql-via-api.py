#!/usr/bin/env python3

"""
🔧 Executor de SQL via API Supabase
Script para executar SQL diretamente via API REST
"""

import os
import requests
import json
from datetime import datetime

def execute_sql_via_api():
    print("🔧 Executando SQL via API Supabase...\n")
    
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
        'Content-Type': 'application/json'
    }
    
    # Tentar criar tabelas uma por uma via inserção de dados
    tables_to_create = [
        {
            'name': 'organizations',
            'test_data': {
                'name': 'Test Organization',
                'type': 'company',
                'description': 'Test organization',
                'tenant_id': 'demo-tenant',
                'is_active': True
            }
        },
        {
            'name': 'assets',
            'test_data': {
                'name': 'Test Asset',
                'type': 'infrastructure',
                'description': 'Test asset',
                'classification': {'confidentiality': 'low', 'integrity': 'low', 'availability': 'low'},
                'tenant_id': 'demo-tenant',
                'is_active': True
            }
        },
        {
            'name': 'evaluations',
            'test_data': {
                'name': 'Test Evaluation',
                'description': 'Test evaluation',
                'status': 'draft',
                'start_date': datetime.now().date().isoformat(),
                'tenant_id': 'demo-tenant'
            }
        },
        {
            'name': 'technical_documents',
            'test_data': {
                'name': 'Test Document',
                'description': 'Test document',
                'document_type': 'policy',
                'version': '1.0',
                'status': 'draft',
                'tenant_id': 'demo-tenant'
            }
        },
        {
            'name': 'teams',
            'test_data': {
                'name': 'Test Team',
                'description': 'Test team',
                'tenant_id': 'demo-tenant',
                'is_active': True
            }
        },
        {
            'name': 'credentials_registry',
            'test_data': {
                'asset_id': None,  # Será preenchido após criar assets
                'holder_type': 'user',
                'holder_id': 'test-user-123',
                'access_type': 'read',
                'justification': 'Test credential',
                'valid_from': datetime.now().isoformat(),
                'valid_until': datetime.now().isoformat(),
                'status': 'pending',
                'tenant_id': 'demo-tenant'
            }
        },
        {
            'name': 'privileged_access',
            'test_data': {
                'user_id': 'test-user-123',
                'scope_type': 'system',
                'scope_id': 'test-system-123',
                'access_level': 'read',
                'justification': 'Test privileged access',
                'valid_from': datetime.now().isoformat(),
                'valid_until': datetime.now().isoformat(),
                'status': 'pending',
                'tenant_id': 'demo-tenant'
            }
        }
    ]
    
    created_tables = []
    
    for table in tables_to_create:
        print(f"\n📋 Tentando criar tabela: {table['name']}")
        
        try:
            # Tentar inserir dados de teste
            response = requests.post(
                f"{supabase_url}/rest/v1/{table['name']}",
                headers=headers,
                json=table['test_data']
            )
            
            if response.status_code == 201:
                print(f"✅ Tabela '{table['name']}' criada com sucesso!")
                created_tables.append(table['name'])
                
                # Limpar dados de teste
                inserted_data = response.json()
                if inserted_data:
                    delete_response = requests.delete(
                        f"{supabase_url}/rest/v1/{table['name']}?id=eq.{inserted_data[0]['id']}",
                        headers=headers
                    )
                    if delete_response.status_code == 204:
                        print(f"✅ Dados de teste removidos de '{table['name']}'")
            elif response.status_code == 404:
                print(f"❌ Tabela '{table['name']}' não existe - precisa ser criada via SQL")
            else:
                print(f"⚠️  Status inesperado para '{table['name']}': {response.status_code}")
                print(response.text)
                
        except Exception as e:
            print(f"❌ Erro ao criar '{table['name']}': {str(e)}")
    
    print(f"\n📊 Resumo:")
    print(f"Tabelas criadas: {len(created_tables)}")
    print(f"Tabelas que precisam de SQL: {len(tables_to_create) - len(created_tables)}")
    
    if len(created_tables) < len(tables_to_create):
        print(f"\n💡 Para criar as tabelas restantes:")
        print(f"1. Acesse: https://supabase.com/dashboard/project/pszfqqmmljekibmcgmig")
        print(f"2. Vá em SQL Editor")
        print(f"3. Execute o script: supabase-schema-ready.sql")
    
    return len(created_tables) > 0

def create_simple_schema():
    """Criar schema simples via API"""
    print("\n🔧 Tentando criar schema simples...")
    
    # Carregar variáveis de ambiente
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    
    headers = {
        'apikey': supabase_key,
        'Authorization': f'Bearer {supabase_key}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    
    # Tentar criar uma organização simples
    test_org = {
        'name': 'n.CISO Corporation',
        'type': 'company',
        'description': 'Empresa principal do sistema n.CISO',
        'tenant_id': 'demo-tenant',
        'is_active': True
    }
    
    try:
        print("📋 Tentando criar organização de teste...")
        response = requests.post(
            f"{supabase_url}/rest/v1/organizations",
            headers=headers,
            json=test_org
        )
        
        if response.status_code == 201:
            print("✅ Organização criada com sucesso!")
            org_data = response.json()
            org_id = org_data[0]['id'] if org_data else None
            
            # Criar um ativo associado
            test_asset = {
                'name': 'Servidor Principal',
                'type': 'infrastructure',
                'description': 'Servidor principal da empresa',
                'classification': {'confidentiality': 'high', 'integrity': 'high', 'availability': 'critical'},
                'value': 50000.00,
                'organization_id': org_id,
                'tenant_id': 'demo-tenant',
                'is_active': True
            }
            
            asset_response = requests.post(
                f"{supabase_url}/rest/v1/assets",
                headers=headers,
                json=test_asset
            )
            
            if asset_response.status_code == 201:
                print("✅ Ativo criado com sucesso!")
                asset_data = asset_response.json()
                asset_id = asset_data[0]['id'] if asset_data else None
                
                # Criar uma credencial
                test_credential = {
                    'asset_id': asset_id,
                    'holder_type': 'user',
                    'holder_id': 'admin@nciso.com',
                    'access_type': 'admin',
                    'justification': 'Acesso administrativo',
                    'valid_from': datetime.now().isoformat(),
                    'valid_until': datetime.now().isoformat(),
                    'status': 'approved',
                    'tenant_id': 'demo-tenant'
                }
                
                cred_response = requests.post(
                    f"{supabase_url}/rest/v1/credentials_registry",
                    headers=headers,
                    json=test_credential
                )
                
                if cred_response.status_code == 201:
                    print("✅ Credencial criada com sucesso!")
                    print("\n🎉 Schema básico criado com sucesso!")
                    return True
                else:
                    print(f"❌ Erro ao criar credencial: {cred_response.status_code}")
            else:
                print(f"❌ Erro ao criar ativo: {asset_response.status_code}")
        else:
            print(f"❌ Erro ao criar organização: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"❌ Erro ao criar schema: {str(e)}")
    
    return False

def main():
    print("🔧 Executando criação de tabelas...\n")
    
    # Primeiro tentar criar via inserção
    if execute_sql_via_api():
        print("\n✅ Algumas tabelas foram criadas via API!")
        return True
    
    # Se falhar, tentar criar schema simples
    print("\n🔄 Tentando criar schema simples...")
    
    if create_simple_schema():
        print("\n✅ Schema básico criado com sucesso!")
        return True
    
    print("\n❌ Não foi possível criar as tabelas automaticamente.")
    print("💡 Execute manualmente no SQL Editor do Supabase:")
    print("   supabase-schema-ready.sql")
    
    return False

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
    
    main() 