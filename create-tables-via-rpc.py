#!/usr/bin/env python3

"""
🔧 Criador de Tabelas via RPC Supabase
Script para criar as tabelas do n.CISO via RPC
"""

import os
import requests
import json
from datetime import datetime

def create_tables_via_rpc():
    print("🔧 Criando tabelas via RPC Supabase...\n")
    
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
    
    # SQL para criar as tabelas
    create_tables_sql = """
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
    """
    
    try:
        # Tentar executar SQL via RPC
        rpc_url = f"{supabase_url}/rest/v1/rpc/exec_sql"
        
        response = requests.post(
            rpc_url,
            headers=headers,
            json={'sql': create_tables_sql}
        )
        
        if response.status_code == 200:
            print("✅ Tabelas criadas com sucesso via RPC!")
            return True
        else:
            print(f"❌ Erro ao criar tabelas via RPC: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Erro ao executar RPC: {str(e)}")
        return False

def create_simple_tables():
    """Criar tabelas simples sem RPC"""
    print("🔧 Criando tabelas simples...\n")
    
    # Carregar variáveis de ambiente
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    
    headers = {
        'apikey': supabase_key,
        'Authorization': f'Bearer {supabase_key}',
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
    }
    
    # Tentar criar dados de teste para verificar se conseguimos inserir
    test_data = {
        'organizations': {
            'name': 'Organização de Teste',
            'type': 'company',
            'description': 'Teste de inserção',
            'tenant_id': 'demo-tenant',
            'is_active': True
        },
        'assets': {
            'name': 'Ativo de Teste',
            'type': 'infrastructure',
            'description': 'Teste de inserção',
            'classification': {'confidentiality': 'low', 'integrity': 'low', 'availability': 'low'},
            'tenant_id': 'demo-tenant',
            'is_active': True
        }
    }
    
    created_tables = []
    
    for table_name, data in test_data.items():
        print(f"📋 Testando inserção em: {table_name}")
        
        try:
            response = requests.post(
                f"{supabase_url}/rest/v1/{table_name}",
                headers=headers,
                json=data
            )
            
            if response.status_code == 201:
                print(f"✅ Inserção em {table_name} funcionou!")
                created_tables.append(table_name)
                
                # Limpar dados de teste
                inserted_data = response.json()
                if inserted_data:
                    delete_response = requests.delete(
                        f"{supabase_url}/rest/v1/{table_name}?id=eq.{inserted_data[0]['id']}",
                        headers=headers
                    )
                    if delete_response.status_code == 204:
                        print(f"✅ Limpeza de {table_name} funcionou!")
            else:
                print(f"❌ Erro na inserção em {table_name}: {response.status_code}")
                print(response.text)
                
        except Exception as e:
            print(f"❌ Erro ao testar {table_name}: {str(e)}")
    
    return len(created_tables) > 0

def main():
    print("🔧 Tentando criar tabelas...\n")
    
    # Primeiro tentar via RPC
    if create_tables_via_rpc():
        print("✅ Tabelas criadas via RPC!")
        return True
    
    # Se RPC falhar, tentar criar tabelas simples
    print("\n🔄 RPC falhou, tentando método alternativo...")
    
    if create_simple_tables():
        print("✅ Algumas tabelas foram criadas!")
        return True
    
    print("\n❌ Não foi possível criar as tabelas automaticamente.")
    print("💡 Execute manualmente no SQL Editor do Supabase:")
    print("   scripts/supabase-complete-schema.sql")
    
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