-- =====================================================
-- n.ciso Database Schema
-- Plataforma de Gestão de Segurança da Informação
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- n.Platform - Autenticação e Permissões
-- =====================================================

-- Tenants (Organizações)
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    domain VARCHAR(255) UNIQUE,
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users (conecta com Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY, -- Supabase Auth user ID
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- admin, manager, user, viewer
    status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Permissions (granular)
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL, -- platform, isms, controls, etc.
    action VARCHAR(50) NOT NULL, -- create, read, update, delete
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role Permissions
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role VARCHAR(50) NOT NULL,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role, permission_id, tenant_id)
);

-- =====================================================
-- n.ISMS - Sistema de Gestão de Segurança
-- =====================================================

-- Organizations (sub-organizações dentro do tenant)
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES organizations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Policies
CREATE TABLE policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    version VARCHAR(20) NOT NULL DEFAULT '1.0',
    status VARCHAR(20) DEFAULT 'draft', -- draft, active, archived
    approved_by UUID REFERENCES users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Controls
CREATE TABLE controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    policy_id UUID REFERENCES policies(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    control_type VARCHAR(50), -- preventive, detective, corrective
    implementation_status VARCHAR(20) DEFAULT 'planned', -- planned, implemented, tested
    effectiveness_score INTEGER CHECK (effectiveness_score >= 0 AND effectiveness_score <= 100),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance Frameworks
CREATE TABLE compliance_frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    version VARCHAR(20),
    description TEXT,
    is_global BOOLEAN DEFAULT true,
    tenant_id UUID REFERENCES tenants(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Domains
CREATE TABLE domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES domains(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessments
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    framework_id UUID REFERENCES compliance_frameworks(id),
    status VARCHAR(20) DEFAULT 'planned', -- planned, in_progress, completed
    start_date DATE,
    end_date DATE,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- n.Controls - Catálogo de Controles
-- =====================================================

-- Control Frameworks (globais)
CREATE TABLE control_frameworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL, -- ISO 27001, NIST, COBIT, etc.
    version VARCHAR(20),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Control Domains
CREATE TABLE control_domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id UUID NOT NULL REFERENCES control_frameworks(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES control_domains(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Controls (globais)
CREATE TABLE global_controls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    framework_id UUID NOT NULL REFERENCES control_frameworks(id),
    domain_id UUID REFERENCES control_domains(id),
    control_id VARCHAR(50) NOT NULL, -- A.1.1, AC-1, etc.
    name VARCHAR(255) NOT NULL,
    description TEXT,
    implementation_guidance TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Control Mappings
CREATE TABLE control_mappings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_control_id UUID NOT NULL REFERENCES global_controls(id),
    target_control_id UUID NOT NULL REFERENCES global_controls(id),
    mapping_type VARCHAR(50), -- equivalent, subset, superset
    confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Control Effectiveness (por tenant)
CREATE TABLE control_effectiveness (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    control_id UUID NOT NULL REFERENCES global_controls(id),
    effectiveness_score INTEGER CHECK (effectiveness_score >= 0 AND effectiveness_score <= 100),
    assessment_date DATE NOT NULL,
    assessor_id UUID NOT NULL REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- n.Audit - Auditorias
-- =====================================================

-- Audits
CREATE TABLE audits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    audit_type VARCHAR(50), -- internal, external, compliance
    status VARCHAR(20) DEFAULT 'planned', -- planned, in_progress, completed
    start_date DATE,
    end_date DATE,
    auditor_id UUID NOT NULL REFERENCES users(id),
    scope TEXT,
    objectives TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Findings
CREATE TABLE audit_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    finding_type VARCHAR(50), -- observation, minor, major, critical
    title VARCHAR(255) NOT NULL,
    description TEXT,
    impact_assessment TEXT,
    recommendation TEXT,
    status VARCHAR(20) DEFAULT 'open', -- open, in_progress, resolved, closed
    assigned_to UUID REFERENCES users(id),
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit Evidence
CREATE TABLE audit_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    audit_id UUID NOT NULL REFERENCES audits(id) ON DELETE CASCADE,
    finding_id UUID REFERENCES audit_findings(id),
    evidence_type VARCHAR(50), -- document, screenshot, log, interview
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(500),
    file_hash VARCHAR(64),
    collected_by UUID NOT NULL REFERENCES users(id),
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Corrective Actions
CREATE TABLE corrective_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    finding_id UUID NOT NULL REFERENCES audit_findings(id) ON DELETE CASCADE,
    action_type VARCHAR(50), -- immediate, short_term, long_term
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'planned', -- planned, in_progress, completed
    assigned_to UUID REFERENCES users(id),
    due_date DATE,
    completion_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- n.Risk - Gestão de Riscos
-- =====================================================

-- Risks
CREATE TABLE risks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    risk_category VARCHAR(50), -- strategic, operational, financial, compliance
    likelihood VARCHAR(20), -- low, medium, high, critical
    impact VARCHAR(20), -- low, medium, high, critical
    risk_score INTEGER CHECK (risk_score >= 1 AND risk_score <= 25),
    status VARCHAR(20) DEFAULT 'identified', -- identified, assessed, treated, monitored
    owner_id UUID REFERENCES users(id),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Risk Assessments
CREATE TABLE risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    risk_id UUID NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    assessment_date DATE NOT NULL,
    likelihood_score INTEGER CHECK (likelihood_score >= 1 AND likelihood_score <= 5),
    impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 5),
    risk_score INTEGER CHECK (risk_score >= 1 AND risk_score <= 25),
    assessor_id UUID NOT NULL REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Risk Questionnaires
CREATE TABLE risk_questionnaires (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    questionnaire_type VARCHAR(50), -- vendor, project, operational
    status VARCHAR(20) DEFAULT 'draft', -- draft, active, archived
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KRIs (Key Risk Indicators)
CREATE TABLE kris (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    metric_type VARCHAR(50), -- count, percentage, ratio
    target_value DECIMAL,
    warning_threshold DECIMAL,
    critical_threshold DECIMAL,
    current_value DECIMAL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- n.Privacy - LGPD/GDPR
-- =====================================================

-- Data Subjects
CREATE TABLE data_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    identifier VARCHAR(255) NOT NULL, -- pseudonymized identifier
    data_category VARCHAR(50), -- personal, sensitive, special
    country_of_residence VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Consents
CREATE TABLE consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    data_subject_id UUID NOT NULL REFERENCES data_subjects(id),
    purpose VARCHAR(255) NOT NULL,
    legal_basis VARCHAR(100), -- consent, legitimate_interest, contract, etc.
    consent_status VARCHAR(20) DEFAULT 'pending', -- pending, granted, withdrawn
    granted_at TIMESTAMP WITH TIME ZONE,
    withdrawn_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Processing Activities
CREATE TABLE processing_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    purpose TEXT,
    legal_basis VARCHAR(100),
    data_categories TEXT[],
    retention_period VARCHAR(100),
    data_recipients TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Data Requests
CREATE TABLE data_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    data_subject_id UUID NOT NULL REFERENCES data_subjects(id),
    request_type VARCHAR(50), -- access, rectification, erasure, portability
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, rejected
    request_date DATE NOT NULL,
    response_date DATE,
    response_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- n.SecDevOps - Testes de Segurança
-- =====================================================

-- Security Projects
CREATE TABLE security_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_type VARCHAR(50), -- application, infrastructure, process
    status VARCHAR(20) DEFAULT 'active', -- active, completed, archived
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security Scans
CREATE TABLE security_scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID NOT NULL REFERENCES security_projects(id) ON DELETE CASCADE,
    scan_type VARCHAR(50), -- sast, dast, iast, container, dependency
    tool_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, running, completed, failed
    scheduled_at TIMESTAMP WITH TIME ZONE,
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    scan_config JSONB,
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Vulnerability Reports
CREATE TABLE vulnerability_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scan_id UUID NOT NULL REFERENCES security_scans(id) ON DELETE CASCADE,
    vulnerability_id VARCHAR(100),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20), -- low, medium, high, critical
    cvss_score DECIMAL(3,1),
    status VARCHAR(20) DEFAULT 'open', -- open, in_progress, resolved, false_positive
    remediation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- n.Assessments - Avaliações Estruturadas
-- =====================================================

-- Assessment Templates
CREATE TABLE assessment_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    template_type VARCHAR(50), -- compliance, security, vendor
    is_global BOOLEAN DEFAULT true,
    tenant_id UUID REFERENCES tenants(id),
    created_by UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessment Questions
CREATE TABLE assessment_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES assessment_templates(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50), -- multiple_choice, text, yes_no, scale
    options JSONB, -- for multiple choice questions
    required BOOLEAN DEFAULT false,
    order_index INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessment Responses
CREATE TABLE assessment_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES assessment_templates(id),
    respondent_id UUID NOT NULL REFERENCES users(id),
    response_data JSONB NOT NULL,
    completion_percentage INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'in_progress', -- in_progress, completed
    submitted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- n.CIRT - Resposta a Incidentes
-- =====================================================

-- Incidents
CREATE TABLE incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    incident_number VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(20), -- low, medium, high, critical
    status VARCHAR(20) DEFAULT 'open', -- open, in_progress, resolved, closed
    incident_type VARCHAR(50), -- malware, phishing, data_breach, ddos
    detected_at TIMESTAMP WITH TIME ZONE,
    reported_by UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Incident Tasks
CREATE TABLE incident_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    task_type VARCHAR(50), -- containment, eradication, recovery
    priority VARCHAR(20), -- low, medium, high, critical
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed
    assigned_to UUID REFERENCES users(id),
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Incident Evidence
CREATE TABLE incident_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
    evidence_type VARCHAR(50), -- log, screenshot, file, memory_dump
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_path VARCHAR(500),
    file_hash VARCHAR(64),
    collected_by UUID NOT NULL REFERENCES users(id),
    collected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- n.Tickets - Sistema de Suporte
-- =====================================================

-- Ticket Categories
CREATE TABLE ticket_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sla_hours INTEGER DEFAULT 24,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tickets
CREATE TABLE tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    ticket_number VARCHAR(50) UNIQUE NOT NULL,
    category_id UUID NOT NULL REFERENCES ticket_categories(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, critical
    status VARCHAR(20) DEFAULT 'open', -- open, in_progress, resolved, closed
    module VARCHAR(50), -- platform, isms, controls, etc.
    reported_by UUID NOT NULL REFERENCES users(id),
    assigned_to UUID REFERENCES users(id),
    due_date TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- Índices para Performance
-- =====================================================

-- Índices principais
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_policies_tenant_id ON policies(tenant_id);
CREATE INDEX idx_controls_tenant_id ON controls(tenant_id);
CREATE INDEX idx_risks_tenant_id ON risks(tenant_id);
CREATE INDEX idx_incidents_tenant_id ON incidents(tenant_id);
CREATE INDEX idx_tickets_tenant_id ON tickets(tenant_id);

-- Índices para auditoria
CREATE INDEX idx_audit_findings_audit_id ON audit_findings(audit_id);
CREATE INDEX idx_incident_tasks_incident_id ON incident_tasks(incident_id);
CREATE INDEX idx_assessment_responses_tenant_id ON assessment_responses(tenant_id);

-- Índices para busca
CREATE INDEX idx_policies_name ON policies(name);
CREATE INDEX idx_risks_title ON risks(title);
CREATE INDEX idx_incidents_title ON incidents(title);

-- =====================================================
-- Triggers para updated_at
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_controls_updated_at BEFORE UPDATE ON controls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON domains FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON risks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 