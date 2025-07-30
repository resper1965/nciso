-- =============================================================================
-- 🛡️ n.CISO - Schema Completo
-- =============================================================================
-- Execute este script no SQL Editor do Supabase

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying NOT NULL UNIQUE,
  name character varying NOT NULL,
  tenant_id character varying NOT NULL,
  role character varying DEFAULT 'user'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Tabela de políticas
CREATE TABLE IF NOT EXISTS public.policies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id character varying NOT NULL,
  title character varying NOT NULL,
  description text,
  content text NOT NULL,
  status character varying DEFAULT 'draft'::character varying,
  version character varying DEFAULT '1.0'::character varying,
  approved_by uuid,
  approved_at timestamp with time zone,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT policies_pkey PRIMARY KEY (id),
  CONSTRAINT policies_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT policies_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id)
);

-- Tabela de controles
CREATE TABLE IF NOT EXISTS public.controls (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id character varying NOT NULL,
  policy_id uuid,
  title character varying NOT NULL,
  description text,
  control_type character varying NOT NULL,
  effectiveness_score integer DEFAULT 0,
  status character varying DEFAULT 'active'::character varying,
  implementation_date date,
  review_date date,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT controls_pkey PRIMARY KEY (id),
  CONSTRAINT controls_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT controls_policy_id_fkey FOREIGN KEY (policy_id) REFERENCES public.policies(id)
);

-- Tabela de domínios
CREATE TABLE IF NOT EXISTS public.domains (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id character varying NOT NULL,
  parent_id uuid,
  name character varying NOT NULL,
  description text,
  level integer DEFAULT 1,
  path character varying,
  status character varying DEFAULT 'active'::character varying,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT domains_pkey PRIMARY KEY (id),
  CONSTRAINT domains_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.domains(id),
  CONSTRAINT domains_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);

-- Tabela de avaliações
CREATE TABLE IF NOT EXISTS public.assessments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id character varying NOT NULL,
  control_id uuid,
  assessor_id uuid,
  assessment_date date NOT NULL,
  score integer NOT NULL,
  comments text,
  status character varying DEFAULT 'pending'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT assessments_pkey PRIMARY KEY (id),
  CONSTRAINT assessments_control_id_fkey FOREIGN KEY (control_id) REFERENCES public.controls(id),
  CONSTRAINT assessments_assessor_id_fkey FOREIGN KEY (assessor_id) REFERENCES public.users(id)
);

-- Tabela de riscos
CREATE TABLE IF NOT EXISTS public.risks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id character varying NOT NULL,
  title character varying NOT NULL,
  description text,
  likelihood integer NOT NULL,
  impact integer NOT NULL,
  risk_score integer DEFAULT (likelihood * impact),
  status character varying DEFAULT 'active'::character varying,
  mitigation_plan text,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT risks_pkey PRIMARY KEY (id),
  CONSTRAINT risks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);

-- Tabela de auditorias
CREATE TABLE IF NOT EXISTS public.audits (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id character varying NOT NULL,
  title character varying NOT NULL,
  description text,
  audit_type character varying NOT NULL,
  start_date date NOT NULL,
  end_date date,
  status character varying DEFAULT 'planned'::character varying,
  auditor_id uuid,
  findings text,
  recommendations text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT audits_pkey PRIMARY KEY (id),
  CONSTRAINT audits_auditor_id_fkey FOREIGN KEY (auditor_id) REFERENCES public.users(id)
);

-- Tabela de incidentes
CREATE TABLE IF NOT EXISTS public.incidents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id character varying NOT NULL,
  title character varying NOT NULL,
  description text,
  severity character varying NOT NULL,
  status character varying DEFAULT 'open'::character varying,
  reported_by uuid,
  assigned_to uuid,
  reported_at timestamp with time zone DEFAULT now(),
  resolved_at timestamp with time zone,
  resolution text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT incidents_pkey PRIMARY KEY (id),
  CONSTRAINT incidents_reported_by_fkey FOREIGN KEY (reported_by) REFERENCES public.users(id),
  CONSTRAINT incidents_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id)
);

-- Tabela de tickets
CREATE TABLE IF NOT EXISTS public.tickets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  tenant_id character varying NOT NULL,
  title character varying NOT NULL,
  description text,
  priority character varying DEFAULT 'medium'::character varying,
  status character varying DEFAULT 'open'::character varying,
  category character varying,
  assigned_to uuid,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tickets_pkey PRIMARY KEY (id),
  CONSTRAINT tickets_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT tickets_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id)
);

-- Tabela de organizações (tenants)
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name character varying NOT NULL,
  email_domain character varying NOT NULL UNIQUE,
  contact_email character varying NOT NULL,
  logo_url text,
  status character varying DEFAULT 'active'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tenants_pkey PRIMARY KEY (id)
);

-- Tabela de convites
CREATE TABLE IF NOT EXISTS public.invites (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  email character varying NOT NULL,
  role character varying NOT NULL,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  token character varying NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  accepted boolean DEFAULT FALSE,
  created_by uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT invites_pkey PRIMARY KEY (id)
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.controls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Políticas simples para desenvolvimento
CREATE POLICY "users_select_policy" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_insert_policy" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_update_policy" ON public.users FOR UPDATE USING (true);
CREATE POLICY "users_delete_policy" ON public.users FOR DELETE USING (true);

CREATE POLICY "policies_select_policy" ON public.policies FOR SELECT USING (true);
CREATE POLICY "policies_insert_policy" ON public.policies FOR INSERT WITH CHECK (true);
CREATE POLICY "policies_update_policy" ON public.policies FOR UPDATE USING (true);
CREATE POLICY "policies_delete_policy" ON public.policies FOR DELETE USING (true);

CREATE POLICY "controls_select_policy" ON public.controls FOR SELECT USING (true);
CREATE POLICY "controls_insert_policy" ON public.controls FOR INSERT WITH CHECK (true);
CREATE POLICY "controls_update_policy" ON public.controls FOR UPDATE USING (true);
CREATE POLICY "controls_delete_policy" ON public.controls FOR DELETE USING (true);

CREATE POLICY "domains_select_policy" ON public.domains FOR SELECT USING (true);
CREATE POLICY "domains_insert_policy" ON public.domains FOR INSERT WITH CHECK (true);
CREATE POLICY "domains_update_policy" ON public.domains FOR UPDATE USING (true);
CREATE POLICY "domains_delete_policy" ON public.domains FOR DELETE USING (true);

CREATE POLICY "assessments_select_policy" ON public.assessments FOR SELECT USING (true);
CREATE POLICY "assessments_insert_policy" ON public.assessments FOR INSERT WITH CHECK (true);
CREATE POLICY "assessments_update_policy" ON public.assessments FOR UPDATE USING (true);
CREATE POLICY "assessments_delete_policy" ON public.assessments FOR DELETE USING (true);

CREATE POLICY "risks_select_policy" ON public.risks FOR SELECT USING (true);
CREATE POLICY "risks_insert_policy" ON public.risks FOR INSERT WITH CHECK (true);
CREATE POLICY "risks_update_policy" ON public.risks FOR UPDATE USING (true);
CREATE POLICY "risks_delete_policy" ON public.risks FOR DELETE USING (true);

CREATE POLICY "audits_select_policy" ON public.audits FOR SELECT USING (true);
CREATE POLICY "audits_insert_policy" ON public.audits FOR INSERT WITH CHECK (true);
CREATE POLICY "audits_update_policy" ON public.audits FOR UPDATE USING (true);
CREATE POLICY "audits_delete_policy" ON public.audits FOR DELETE USING (true);

CREATE POLICY "incidents_select_policy" ON public.incidents FOR SELECT USING (true);
CREATE POLICY "incidents_insert_policy" ON public.incidents FOR INSERT WITH CHECK (true);
CREATE POLICY "incidents_update_policy" ON public.incidents FOR UPDATE USING (true);
CREATE POLICY "incidents_delete_policy" ON public.incidents FOR DELETE USING (true);

CREATE POLICY "tickets_select_policy" ON public.tickets FOR SELECT USING (true);
CREATE POLICY "tickets_insert_policy" ON public.tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "tickets_update_policy" ON public.tickets FOR UPDATE USING (true);
CREATE POLICY "tickets_delete_policy" ON public.tickets FOR DELETE USING (true);

CREATE POLICY "tenants_select_policy" ON public.tenants FOR SELECT USING (true);
CREATE POLICY "tenants_insert_policy" ON public.tenants FOR INSERT WITH CHECK (true);
CREATE POLICY "tenants_update_policy" ON public.tenants FOR UPDATE USING (true);
CREATE POLICY "tenants_delete_policy" ON public.tenants FOR DELETE USING (true);

CREATE POLICY "invites_select_policy" ON public.invites FOR SELECT USING (true);
CREATE POLICY "invites_insert_policy" ON public.invites FOR INSERT WITH CHECK (true);
CREATE POLICY "invites_update_policy" ON public.invites FOR UPDATE USING (true);
CREATE POLICY "invites_delete_policy" ON public.invites FOR DELETE USING (true);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para todas as tabelas
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_policies_updated_at BEFORE UPDATE ON public.policies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_controls_updated_at BEFORE UPDATE ON public.controls FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_domains_updated_at BEFORE UPDATE ON public.domains FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_assessments_updated_at BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON public.risks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_audits_updated_at BEFORE UPDATE ON public.audits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invites_updated_at BEFORE UPDATE ON public.invites FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Dados iniciais
INSERT INTO public.tenants (name, email_domain, contact_email, logo_url) 
VALUES (
  'n.CISO Development',
  'nciso.dev',
  'admin@nciso.dev',
  'https://via.placeholder.com/150x50/00ade0/ffffff?text=n.CISO'
) ON CONFLICT (email_domain) DO NOTHING;

-- Verificação final
SELECT 'users' as table_name, COUNT(*) as row_count FROM public.users
UNION ALL
SELECT 'policies' as table_name, COUNT(*) as row_count FROM public.policies
UNION ALL
SELECT 'controls' as table_name, COUNT(*) as row_count FROM public.controls
UNION ALL
SELECT 'domains' as table_name, COUNT(*) as row_count FROM public.domains
UNION ALL
SELECT 'assessments' as table_name, COUNT(*) as row_count FROM public.assessments
UNION ALL
SELECT 'risks' as table_name, COUNT(*) as row_count FROM public.risks
UNION ALL
SELECT 'audits' as table_name, COUNT(*) as row_count FROM public.audits
UNION ALL
SELECT 'incidents' as table_name, COUNT(*) as row_count FROM public.incidents
UNION ALL
SELECT 'tickets' as table_name, COUNT(*) as row_count FROM public.tickets
UNION ALL
SELECT 'tenants' as table_name, COUNT(*) as row_count FROM public.tenants
UNION ALL
SELECT 'invites' as table_name, COUNT(*) as row_count FROM public.invites; 