-- =====================================================
-- Função para Relatório de Cobertura de Controles por Framework
-- Epic 2 — Mapeamento de Controles x Frameworks
-- =====================================================

CREATE OR REPLACE FUNCTION get_control_framework_coverage(
  p_tenant_id UUID,
  p_domain_filter TEXT DEFAULT NULL,
  p_type_filter TEXT DEFAULT NULL,
  p_framework_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  framework_id UUID,
  framework_name TEXT,
  framework_version TEXT,
  total_controls BIGINT,
  mapped_controls BIGINT,
  coverage_percentage NUMERIC(5,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id as framework_id,
    f.name as framework_name,
    f.version as framework_version,
    COUNT(DISTINCT c.id) as total_controls,
    COUNT(DISTINCT cf.control_id) as mapped_controls,
    CASE 
      WHEN COUNT(DISTINCT c.id) > 0 THEN 
        ROUND((COUNT(DISTINCT cf.control_id)::NUMERIC / COUNT(DISTINCT c.id)::NUMERIC) * 100, 2)
      ELSE 0 
    END as coverage_percentage
  FROM frameworks f
  LEFT JOIN control_frameworks cf ON f.id = cf.framework_id
  LEFT JOIN global_controls c ON cf.control_id = c.id
  WHERE f.tenant_id = p_tenant_id
    AND (p_domain_filter IS NULL OR c.domain = p_domain_filter)
    AND (p_type_filter IS NULL OR c.type = p_type_filter)
    AND (p_framework_filter IS NULL OR f.name ILIKE '%' || p_framework_filter || '%')
    AND f.is_active = true
  GROUP BY f.id, f.name, f.version
  ORDER BY coverage_percentage DESC, f.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Função para Estatísticas Gerais de Cobertura
-- =====================================================

CREATE OR REPLACE FUNCTION get_coverage_summary(
  p_tenant_id UUID,
  p_domain_filter TEXT DEFAULT NULL,
  p_type_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  total_frameworks BIGINT,
  total_controls BIGINT,
  total_mapped_controls BIGINT,
  average_coverage NUMERIC(5,2),
  frameworks_with_coverage BIGINT,
  controls_without_mapping BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH coverage_stats AS (
    SELECT 
      COUNT(DISTINCT f.id) as total_frameworks,
      COUNT(DISTINCT c.id) as total_controls,
      COUNT(DISTINCT cf.control_id) as total_mapped_controls,
      COUNT(DISTINCT CASE WHEN cf.control_id IS NOT NULL THEN f.id END) as frameworks_with_coverage,
      COUNT(DISTINCT CASE WHEN cf.control_id IS NULL THEN c.id END) as controls_without_mapping
    FROM frameworks f
    LEFT JOIN control_frameworks cf ON f.id = cf.framework_id
    LEFT JOIN global_controls c ON cf.control_id = c.id
    WHERE f.tenant_id = p_tenant_id
      AND (p_domain_filter IS NULL OR c.domain = p_domain_filter)
      AND (p_type_filter IS NULL OR c.type = p_type_filter)
      AND f.is_active = true
  )
  SELECT 
    cs.total_frameworks,
    cs.total_controls,
    cs.total_mapped_controls,
    CASE 
      WHEN cs.total_controls > 0 THEN 
        ROUND((cs.total_mapped_controls::NUMERIC / cs.total_controls::NUMERIC) * 100, 2)
      ELSE 0 
    END as average_coverage,
    cs.frameworks_with_coverage,
    cs.controls_without_mapping
  FROM coverage_stats cs;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Função para Controles Não Mapeados por Framework
-- =====================================================

CREATE OR REPLACE FUNCTION get_unmapped_controls_by_framework(
  p_tenant_id UUID,
  p_framework_id UUID DEFAULT NULL
)
RETURNS TABLE (
  framework_id UUID,
  framework_name TEXT,
  control_id UUID,
  control_name TEXT,
  control_type TEXT,
  control_domain TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id as framework_id,
    f.name as framework_name,
    c.id as control_id,
    c.name as control_name,
    c.type as control_type,
    c.domain as control_domain
  FROM frameworks f
  CROSS JOIN global_controls c
  LEFT JOIN control_frameworks cf ON f.id = cf.framework_id AND c.id = cf.control_id
  WHERE f.tenant_id = p_tenant_id
    AND c.tenant_id = p_tenant_id
    AND cf.control_id IS NULL
    AND (p_framework_id IS NULL OR f.id = p_framework_id)
    AND f.is_active = true
  ORDER BY f.name ASC, c.name ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Comentários para Documentação
-- =====================================================

COMMENT ON FUNCTION get_control_framework_coverage IS 'Retorna dados de cobertura de controles por framework com filtros opcionais';
COMMENT ON FUNCTION get_coverage_summary IS 'Retorna estatísticas gerais de cobertura de controles';
COMMENT ON FUNCTION get_unmapped_controls_by_framework IS 'Retorna controles não mapeados por framework';

-- =====================================================
-- Verificações de Segurança
-- =====================================================

-- Verificar se as funções foram criadas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'get_control_framework_coverage'
  ) THEN
    RAISE EXCEPTION 'Função get_control_framework_coverage não foi criada!';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'get_coverage_summary'
  ) THEN
    RAISE EXCEPTION 'Função get_coverage_summary não foi criada!';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc 
    WHERE proname = 'get_unmapped_controls_by_framework'
  ) THEN
    RAISE EXCEPTION 'Função get_unmapped_controls_by_framework não foi criada!';
  END IF;
  
  RAISE NOTICE '✅ Todas as funções de cobertura foram criadas com sucesso!';
END $$;

-- =====================================================
-- Mensagem de Sucesso
-- =====================================================

SELECT '🎉 Funções de cobertura criadas com sucesso!' as status; 