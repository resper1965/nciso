#!/usr/bin/env python3

"""
🔧 Criador Final de Tabelas - Múltiplas Abordagens
Script que tenta criar as tabelas usando diferentes métodos
"""

import os
import requests
import json
from datetime import datetime

def try_method_1_rpc():
    """Tentar via RPC com função personalizada"""
    print("🔧 Método 1: Tentando via RPC personalizado...")
    
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    
    headers = {
        'apikey': supabase_key,
        'Authorization': f'Bearer {supabase_key}',
        'Content-Type': 'application/json'
    }
    
    # Criar função RPC personalizada primeiro
    create_function_sql = """
    CREATE OR REPLACE FUNCTION create_nciso_tables()
    RETURNS text AS $$
    BEGIN
        -- Criar tabela organizations
        CREATE TABLE IF NOT EXISTS organizations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL CHECK (type IN ('company', 'department', 'unit', 'division')),
            parent_id UUID REFERENCES organizations(id),
            description TEXT,
            tenant_id VARCHAR(255) NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar tabela assets
        CREATE TABLE IF NOT EXISTS assets (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            type VARCHAR(50) NOT NULL CHECK (type IN ('physical', 'digital', 'person', 'software', 'infrastructure', 'data')),
            description TEXT,
            owner_id UUID,
            classification JSONB NOT NULL DEFAULT '{"confidentiality": "low", "integrity": "low", "availability": "low"}',
            value DECIMAL(15,2),
            location VARCHAR(255),
            organization_id UUID REFERENCES organizations(id),
            tenant_id VARCHAR(255) NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar tabela evaluations
        CREATE TABLE IF NOT EXISTS evaluations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            scope_id UUID,
            domain_id UUID,
            control_id UUID,
            status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'reviewed')),
            percentage_score DECIMAL(5,2),
            evidence_count INTEGER DEFAULT 0,
            start_date DATE NOT NULL,
            end_date DATE,
            notes TEXT,
            tenant_id VARCHAR(255) NOT NULL,
            created_by VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar tabela technical_documents
        CREATE TABLE IF NOT EXISTS technical_documents (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('policy', 'procedure', 'standard', 'guideline', 'template', 'manual', 'checklist')),
            version VARCHAR(20) DEFAULT '1.0',
            content TEXT,
            file_path VARCHAR(500),
            file_size BIGINT,
            file_type VARCHAR(100),
            tags TEXT[],
            scope_id UUID,
            asset_id UUID REFERENCES assets(id),
            control_id UUID,
            status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'approved', 'active', 'inactive')),
            tenant_id VARCHAR(255) NOT NULL,
            created_by VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar tabela teams
        CREATE TABLE IF NOT EXISTS teams (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            description TEXT,
            organization_id UUID REFERENCES organizations(id),
            tenant_id VARCHAR(255) NOT NULL,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar tabela credentials_registry
        CREATE TABLE IF NOT EXISTS credentials_registry (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            asset_id UUID NOT NULL REFERENCES assets(id),
            holder_type VARCHAR(20) NOT NULL CHECK (holder_type IN ('user', 'team')),
            holder_id VARCHAR(255) NOT NULL,
            access_type VARCHAR(20) NOT NULL CHECK (access_type IN ('read', 'write', 'admin', 'full')),
            justification TEXT,
            valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
            valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'inactive', 'expired', 'revoked')),
            approved_by VARCHAR(255),
            approved_at TIMESTAMP WITH TIME ZONE,
            revoked_by VARCHAR(255),
            revoked_at TIMESTAMP WITH TIME ZONE,
            tenant_id VARCHAR(255) NOT NULL,
            created_by VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar tabela privileged_access
        CREATE TABLE IF NOT EXISTS privileged_access (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id VARCHAR(255) NOT NULL,
            scope_type VARCHAR(50) NOT NULL CHECK (scope_type IN ('system', 'database', 'application', 'network', 'infrastructure')),
            scope_id VARCHAR(255) NOT NULL,
            access_level VARCHAR(20) NOT NULL CHECK (access_level IN ('read', 'write', 'admin', 'full')),
            justification TEXT,
            valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
            valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'active', 'inactive', 'expired', 'revoked')),
            approved_by VARCHAR(255),
            approved_at TIMESTAMP WITH TIME ZONE,
            revoked_by VARCHAR(255),
            revoked_at TIMESTAMP WITH TIME ZONE,
            last_audit_date TIMESTAMP WITH TIME ZONE,
            audit_notes TEXT,
            tenant_id VARCHAR(255) NOT NULL,
            created_by VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RETURN '✅ Tabelas n.CISO criadas com sucesso!';
    END;
    $$ LANGUAGE plpgsql;
    """
    
    try:
        # Tentar criar a função via RPC
        rpc_url = f"{supabase_url}/rest/v1/rpc/exec_sql"
        
        response = requests.post(
            rpc_url,
            headers=headers,
            json={'sql': create_function_sql}
        )
        
        if response.status_code == 200:
            print("✅ Função RPC criada!")
            
            # Agora executar a função
            execute_url = f"{supabase_url}/rest/v1/rpc/create_nciso_tables"
            
            response = requests.post(
                execute_url,
                headers=headers
            )
            
            if response.status_code == 200:
                print("✅ Tabelas criadas via RPC!")
                return True
            else:
                print(f"❌ Erro ao executar função: {response.status_code}")
                return False
        else:
            print(f"❌ Erro ao criar função: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Erro no método 1: {str(e)}")
        return False

def try_method_2_direct_insert():
    """Tentar criar tabelas via inserção direta"""
    print("\n🔧 Método 2: Tentando via inserção direta...")
    
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    
    headers = {
        'apikey': supabase_key,
        'Authorization': f'Bearer {supabase_key}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    
    # Tentar inserir dados de teste para verificar se as tabelas existem
    test_data = {
        'organizations': {
            'name': 'Test Organization',
            'type': 'company',
            'description': 'Test organization',
            'tenant_id': 'demo-tenant',
            'is_active': True
        },
        'assets': {
            'name': 'Test Asset',
            'type': 'infrastructure',
            'description': 'Test asset',
            'classification': {'confidentiality': 'low', 'integrity': 'low', 'availability': 'low'},
            'tenant_id': 'demo-tenant',
            'is_active': True
        }
    }
    
    created_tables = []
    
    for table_name, data in test_data.items():
        try:
            response = requests.post(
                f"{supabase_url}/rest/v1/{table_name}",
                headers=headers,
                json=data
            )
            
            if response.status_code == 201:
                print(f"✅ Tabela '{table_name}' existe e aceita inserções!")
                created_tables.append(table_name)
                
                # Limpar dados de teste
                inserted_data = response.json()
                if inserted_data:
                    delete_response = requests.delete(
                        f"{supabase_url}/rest/v1/{table_name}?id=eq.{inserted_data[0]['id']}",
                        headers=headers
                    )
                    if delete_response.status_code == 204:
                        print(f"✅ Dados de teste removidos de '{table_name}'")
            else:
                print(f"❌ Tabela '{table_name}' não existe ou não aceita inserções: {response.status_code}")
                
        except Exception as e:
            print(f"❌ Erro ao testar '{table_name}': {str(e)}")
    
    return len(created_tables) > 0

def try_method_3_sql_execution():
    """Tentar executar SQL via endpoint personalizado"""
    print("\n🔧 Método 3: Tentando via SQL execution...")
    
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    
    headers = {
        'apikey': supabase_key,
        'Authorization': f'Bearer {supabase_key}',
        'Content-Type': 'application/json'
    }
    
    # SQL simples para criar uma tabela
    simple_sql = """
    CREATE TABLE IF NOT EXISTS organizations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        description TEXT,
        tenant_id VARCHAR(255) NOT NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    """
    
    try:
        # Tentar diferentes endpoints
        endpoints = [
            f"{supabase_url}/rest/v1/rpc/exec_sql",
            f"{supabase_url}/rest/v1/rpc/execute_sql",
            f"{supabase_url}/rest/v1/rpc/run_sql"
        ]
        
        for endpoint in endpoints:
            try:
                response = requests.post(
                    endpoint,
                    headers=headers,
                    json={'sql': simple_sql}
                )
                
                if response.status_code == 200:
                    print(f"✅ SQL executado via {endpoint}!")
                    return True
                else:
                    print(f"❌ Endpoint {endpoint} falhou: {response.status_code}")
                    
            except Exception as e:
                print(f"❌ Erro no endpoint {endpoint}: {str(e)}")
        
        return False
        
    except Exception as e:
        print(f"❌ Erro no método 3: {str(e)}")
        return False

def test_connection():
    """Testar conexão básica"""
    print("\n🧪 Testando conexão básica...")
    
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    
    headers = {
        'apikey': supabase_key,
        'Authorization': f'Bearer {supabase_key}',
        'Content-Type': 'application/json'
    }
    
    try:
        # Testar conexão com uma tabela que sabemos que existe
        response = requests.get(
            f"{supabase_url}/rest/v1/domains?select=count&limit=1",
            headers=headers
        )
        
        if response.status_code == 200:
            print("✅ Conexão com Supabase funcionando!")
            return True
        else:
            print(f"❌ Erro na conexão: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Erro na conexão: {str(e)}")
        return False

def main():
    print("🔧 Tentando criar tabelas com múltiplos métodos...\n")
    
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
    
    # Testar conexão primeiro
    if not test_connection():
        print("❌ Não foi possível conectar ao Supabase!")
        return False
    
    # Tentar método 1: RPC personalizado
    if try_method_1_rpc():
        print("\n🎉 Tabelas criadas via RPC!")
        return True
    
    # Tentar método 2: Inserção direta
    if try_method_2_direct_insert():
        print("\n🎉 Algumas tabelas já existem!")
        return True
    
    # Tentar método 3: SQL execution
    if try_method_3_sql_execution():
        print("\n🎉 SQL executado com sucesso!")
        return True
    
    print("\n❌ Nenhum método funcionou automaticamente.")
    print("💡 Execute manualmente no SQL Editor do Supabase:")
    print("   supabase-schema-ready.sql")
    
    return False

if __name__ == "__main__":
    main() 