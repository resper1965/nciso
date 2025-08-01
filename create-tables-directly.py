#!/usr/bin/env python3

"""
🔧 Criador Direto de Tabelas via RPC
Script para criar tabelas diretamente via RPC do Supabase
"""

import os
import requests
import json
from datetime import datetime

def create_tables_via_rpc():
    print("🔧 Criando tabelas via RPC...\n")
    
    # Carregar variáveis de ambiente
    supabase_url = os.getenv('SUPABASE_URL')
    supabase_key = os.getenv('SUPABASE_ANON_KEY')
    
    print("📋 Configuração:")
    print(f"URL: {supabase_url}")
    print(f"Key: {'✅ Configurada' if supabase_key else '❌ Não configurada'}")
    
    if not supabase_url or not supabase_key:
        print("❌ Variáveis de ambiente não configuradas!")
        return False
    
    # Headers para requisições
    headers = {
        'apikey': supabase_key,
        'Authorization': f'Bearer {supabase_key}',
        'Content-Type': 'application/json'
    }
    
    # SQL para criar tabelas uma por uma
    create_organizations_sql = """
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
    """
    
    create_assets_sql = """
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
    """
    
    create_evaluations_sql = """
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
    """
    
    create_technical_documents_sql = """
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
    """
    
    create_teams_sql = """
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
    """
    
    create_credentials_registry_sql = """
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
    """
    
    create_privileged_access_sql = """
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
    
    # Lista de SQLs para executar
    sql_commands = [
        ('organizations', create_organizations_sql),
        ('assets', create_assets_sql),
        ('evaluations', create_evaluations_sql),
        ('technical_documents', create_technical_documents_sql),
        ('teams', create_teams_sql),
        ('credentials_registry', create_credentials_registry_sql),
        ('privileged_access', create_privileged_access_sql)
    ]
    
    created_tables = []
    
    for table_name, sql in sql_commands:
        print(f"\n📋 Criando tabela: {table_name}")
        
        try:
            # Tentar executar SQL via RPC
            rpc_url = f"{supabase_url}/rest/v1/rpc/exec_sql"
            
            response = requests.post(
                rpc_url,
                headers=headers,
                json={'sql': sql}
            )
            
            if response.status_code == 200:
                print(f"✅ Tabela '{table_name}' criada com sucesso!")
                created_tables.append(table_name)
            else:
                print(f"❌ Erro ao criar '{table_name}': {response.status_code}")
                print(response.text)
                
        except Exception as e:
            print(f"❌ Erro ao executar SQL para '{table_name}': {str(e)}")
    
    print(f"\n📊 Resumo:")
    print(f"Tabelas criadas: {len(created_tables)}")
    print(f"Tabelas que falharam: {len(sql_commands) - len(created_tables)}")
    
    if len(created_tables) > 0:
        print(f"\n✅ Tabelas criadas com sucesso: {', '.join(created_tables)}")
        return True
    else:
        print(f"\n❌ Nenhuma tabela foi criada via RPC")
        return False

def test_after_creation():
    """Testar após criação das tabelas"""
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
                    print("\n🎉 Todas as operações CRUD funcionando!")
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
    
    return False

def main():
    print("🔧 Criando tabelas diretamente...\n")
    
    # Tentar criar via RPC
    if create_tables_via_rpc():
        print("\n✅ Tabelas criadas via RPC!")
        
        # Testar após criação
        if test_after_creation():
            print("\n🎉 Configuração completa!")
            return True
        else:
            print("\n⚠️  Tabelas criadas mas teste falhou")
            return True
    else:
        print("\n❌ Não foi possível criar as tabelas via RPC")
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