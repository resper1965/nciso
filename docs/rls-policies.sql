-- =====================================================
-- n.ciso RLS Policies (Row Level Security)
-- Políticas de segurança por módulo
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_frameworks ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE control_effectiveness ENABLE ROW LEVEL SECURITY;
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE corrective_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE kris ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE vulnerability_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- n.Platform - Autenticação e Permissões
-- =====================================================

-- Tenants: Apenas admins podem ver todos os tenants
CREATE POLICY "tenants_admin_only" ON tenants
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Users: Usuário vê apenas dados do seu tenant
CREATE POLICY "users_tenant_isolation" ON users
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Permissions: Globais (read-only para todos)
CREATE POLICY "permissions_read_all" ON permissions
    FOR SELECT USING (true);

-- Role Permissions: Por tenant
CREATE POLICY "role_permissions_tenant_isolation" ON role_permissions
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- =====================================================
-- n.ISMS - Sistema de Gestão de Segurança
-- =====================================================

-- Organizations: Isolamento por tenant
CREATE POLICY "organizations_tenant_isolation" ON organizations
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Policies: Isolamento por tenant
CREATE POLICY "policies_tenant_isolation" ON policies
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Controls: Isolamento por tenant
CREATE POLICY "controls_tenant_isolation" ON controls
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Compliance Frameworks: Globais (read-only)
CREATE POLICY "compliance_frameworks_read_all" ON compliance_frameworks
    FOR SELECT USING (true);

-- Domains: Isolamento por tenant
CREATE POLICY "domains_tenant_isolation" ON domains
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Assessments: Isolamento por tenant
CREATE POLICY "assessments_tenant_isolation" ON assessments
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- =====================================================
-- n.Controls - Catálogo de Controles
-- =====================================================

-- Control Frameworks: Globais (read-only)
CREATE POLICY "control_frameworks_read_all" ON control_frameworks
    FOR SELECT USING (true);

-- Control Domains: Globais (read-only)
CREATE POLICY "control_domains_read_all" ON control_domains
    FOR SELECT USING (true);

-- Global Controls: Globais (read-only)
CREATE POLICY "global_controls_read_all" ON global_controls
    FOR SELECT USING (true);

-- Control Mappings: Globais (read-only)
CREATE POLICY "control_mappings_read_all" ON control_mappings
    FOR SELECT USING (true);

-- Control Effectiveness: Por tenant
CREATE POLICY "control_effectiveness_tenant_isolation" ON control_effectiveness
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- =====================================================
-- n.Audit - Auditorias
-- =====================================================

-- Audits: Isolamento por tenant
CREATE POLICY "audits_tenant_isolation" ON audits
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Audit Findings: Isolamento por tenant
CREATE POLICY "audit_findings_tenant_isolation" ON audit_findings
    FOR ALL USING (audit_id IN (
        SELECT id FROM audits WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    ));

-- Audit Evidence: Isolamento por tenant
CREATE POLICY "audit_evidence_tenant_isolation" ON audit_evidence
    FOR ALL USING (audit_id IN (
        SELECT id FROM audits WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    ));

-- Corrective Actions: Isolamento por tenant
CREATE POLICY "corrective_actions_tenant_isolation" ON corrective_actions
    FOR ALL USING (finding_id IN (
        SELECT af.id FROM audit_findings af
        JOIN audits a ON af.audit_id = a.id
        WHERE a.tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    ));

-- =====================================================
-- n.Risk - Gestão de Riscos
-- =====================================================

-- Risks: Isolamento por tenant
CREATE POLICY "risks_tenant_isolation" ON risks
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Risk Assessments: Isolamento por tenant
CREATE POLICY "risk_assessments_tenant_isolation" ON risk_assessments
    FOR ALL USING (risk_id IN (
        SELECT id FROM risks WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    ));

-- Risk Questionnaires: Isolamento por tenant
CREATE POLICY "risk_questionnaires_tenant_isolation" ON risk_questionnaires
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- KRIs: Isolamento por tenant
CREATE POLICY "kris_tenant_isolation" ON kris
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- =====================================================
-- n.Privacy - LGPD/GDPR
-- =====================================================

-- Data Subjects: Isolamento rigoroso por tenant
CREATE POLICY "data_subjects_tenant_isolation" ON data_subjects
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Consents: Isolamento rigoroso por tenant
CREATE POLICY "consents_tenant_isolation" ON consents
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Processing Activities: Isolamento por tenant
CREATE POLICY "processing_activities_tenant_isolation" ON processing_activities
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Data Requests: Isolamento por tenant
CREATE POLICY "data_requests_tenant_isolation" ON data_requests
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- =====================================================
-- n.SecDevOps - Testes de Segurança
-- =====================================================

-- Security Projects: Isolamento por tenant
CREATE POLICY "security_projects_tenant_isolation" ON security_projects
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Security Scans: Isolamento por tenant
CREATE POLICY "security_scans_tenant_isolation" ON security_scans
    FOR ALL USING (project_id IN (
        SELECT id FROM security_projects WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    ));

-- Vulnerability Reports: Isolamento por tenant
CREATE POLICY "vulnerability_reports_tenant_isolation" ON vulnerability_reports
    FOR ALL USING (scan_id IN (
        SELECT ss.id FROM security_scans ss
        JOIN security_projects sp ON ss.project_id = sp.id
        WHERE sp.tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    ));

-- =====================================================
-- n.Assessments - Avaliações Estruturadas
-- =====================================================

-- Assessment Templates: Globais (read-only)
CREATE POLICY "assessment_templates_read_all" ON assessment_templates
    FOR SELECT USING (true);

-- Assessment Questions: Globais (read-only)
CREATE POLICY "assessment_questions_read_all" ON assessment_questions
    FOR SELECT USING (true);

-- Assessment Responses: Isolamento por tenant
CREATE POLICY "assessment_responses_tenant_isolation" ON assessment_responses
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- =====================================================
-- n.CIRT - Resposta a Incidentes
-- =====================================================

-- Incidents: Isolamento por tenant
CREATE POLICY "incidents_tenant_isolation" ON incidents
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Incident Tasks: Isolamento por tenant
CREATE POLICY "incident_tasks_tenant_isolation" ON incident_tasks
    FOR ALL USING (incident_id IN (
        SELECT id FROM incidents WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    ));

-- Incident Evidence: Isolamento por tenant
CREATE POLICY "incident_evidence_tenant_isolation" ON incident_evidence
    FOR ALL USING (incident_id IN (
        SELECT id FROM incidents WHERE tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    ));

-- =====================================================
-- n.Tickets - Sistema de Suporte
-- =====================================================

-- Ticket Categories: Isolamento por tenant
CREATE POLICY "ticket_categories_tenant_isolation" ON ticket_categories
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- Tickets: Isolamento por tenant
CREATE POLICY "tickets_tenant_isolation" ON tickets
    FOR ALL USING (tenant_id = (auth.jwt() ->> 'tenant_id')::uuid);

-- =====================================================
-- Políticas Específicas por Role
-- =====================================================

-- Admin: Acesso total ao seu tenant
CREATE POLICY "admin_full_access" ON users
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' AND 
        tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    );

-- Manager: Acesso limitado ao seu tenant
CREATE POLICY "manager_limited_access" ON users
    FOR SELECT USING (
        auth.jwt() ->> 'role' IN ('admin', 'manager') AND 
        tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    );

-- User: Acesso apenas aos próprios dados
CREATE POLICY "user_self_access" ON users
    FOR SELECT USING (
        id = (auth.jwt() ->> 'user_id')::uuid
    );

-- =====================================================
-- Políticas de Auditoria
-- =====================================================

-- Log de acesso a dados sensíveis
CREATE OR REPLACE FUNCTION log_sensitive_access()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id,
        action,
        table_name,
        record_id,
        tenant_id,
        timestamp
    ) VALUES (
        (auth.jwt() ->> 'user_id')::uuid,
        TG_OP,
        TG_TABLE_NAME,
        NEW.id,
        (auth.jwt() ->> 'tenant_id')::uuid,
        NOW()
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em tabelas sensíveis
CREATE TRIGGER log_policies_access
    AFTER INSERT OR UPDATE OR DELETE ON policies
    FOR EACH ROW EXECUTE FUNCTION log_sensitive_access();

CREATE TRIGGER log_risks_access
    AFTER INSERT OR UPDATE OR DELETE ON risks
    FOR EACH ROW EXECUTE FUNCTION log_sensitive_access();

CREATE TRIGGER log_incidents_access
    AFTER INSERT OR UPDATE OR DELETE ON incidents
    FOR EACH ROW EXECUTE FUNCTION log_sensitive_access();

-- =====================================================
-- Políticas de Criptografia
-- =====================================================

-- Função para criptografar dados sensíveis
CREATE OR REPLACE FUNCTION encrypt_sensitive_data(data TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Implementar criptografia AES-256
    -- Por simplicidade, retorna hash SHA-256
    RETURN encode(sha256(data::bytea), 'hex');
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Políticas de Rate Limiting
-- =====================================================

-- Função para verificar rate limiting
CREATE OR REPLACE FUNCTION check_rate_limit(
    user_id UUID,
    action_name TEXT,
    max_requests INTEGER DEFAULT 100,
    window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN AS $$
DECLARE
    request_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO request_count
    FROM audit_logs
    WHERE user_id = $1
    AND action = $2
    AND timestamp > NOW() - INTERVAL '1 minute' * $4;
    
    RETURN request_count < $3;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- Políticas de Validação
-- =====================================================

-- Função para validar tenant_id
CREATE OR REPLACE FUNCTION validate_tenant_access(tenant_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN tenant_uuid = (auth.jwt() ->> 'tenant_id')::uuid;
END;
$$ LANGUAGE plpgsql;

-- Função para validar permissões
CREATE OR REPLACE FUNCTION check_permission(
    module_name TEXT,
    action_name TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    has_permission BOOLEAN;
BEGIN
    user_role := auth.jwt() ->> 'role';
    
    SELECT EXISTS(
        SELECT 1 FROM role_permissions rp
        JOIN permissions p ON rp.permission_id = p.id
        WHERE rp.role = user_role
        AND p.module = module_name
        AND p.action = action_name
        AND rp.tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
    ) INTO has_permission;
    
    RETURN has_permission OR user_role = 'admin';
END;
$$ LANGUAGE plpgsql; 