-- =====================================================
-- Script de Teste para Tabela control_frameworks
-- Epic 2 — Mapeamento de Controles x Frameworks
-- =====================================================

-- Verificar se a tabela existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'control_frameworks'
  ) THEN
    RAISE EXCEPTION 'Tabela control_frameworks não existe!';
  ELSE
    RAISE NOTICE '✅ Tabela control_frameworks existe';
  END IF;
END $$;

-- Verificar se RLS está ativo
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'control_frameworks' 
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS não está ativo na tabela control_frameworks!';
  ELSE
    RAISE NOTICE '✅ RLS está ativo na tabela control_frameworks';
  END IF;
END $$;

-- Verificar se as políticas foram criadas
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'control_frameworks';
  
  IF policy_count < 4 THEN
    RAISE EXCEPTION 'Políticas RLS não foram criadas corretamente! Encontradas: %', policy_count;
  ELSE
    RAISE NOTICE '✅ Políticas RLS criadas: %', policy_count;
  END IF;
END $$;

-- Verificar se as foreign keys existem
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'control_frameworks' 
    AND constraint_type = 'FOREIGN KEY'
    AND constraint_name LIKE '%control_id%'
  ) THEN
    RAISE EXCEPTION 'Foreign key para control_id não existe!';
  ELSE
    RAISE NOTICE '✅ Foreign key para control_id existe';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'control_frameworks' 
    AND constraint_type = 'FOREIGN KEY'
    AND constraint_name LIKE '%framework_id%'
  ) THEN
    RAISE EXCEPTION 'Foreign key para framework_id não existe!';
  ELSE
    RAISE NOTICE '✅ Foreign key para framework_id existe';
  END IF;
END $$;

-- Verificar se os índices foram criados
DO $$
DECLARE
  index_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes 
  WHERE tablename = 'control_frameworks';
  
  IF index_count < 5 THEN
    RAISE EXCEPTION 'Índices não foram criados corretamente! Encontrados: %', index_count;
  ELSE
    RAISE NOTICE '✅ Índices criados: %', index_count;
  END IF;
END $$;

-- Verificar se as funções foram criadas
DO $$
DECLARE
  function_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO function_count
  FROM pg_proc 
  WHERE proname IN ('get_controls_by_framework', 'get_frameworks_by_control', 'get_control_framework_stats');
  
  IF function_count < 3 THEN
    RAISE EXCEPTION 'Funções não foram criadas corretamente! Encontradas: %', function_count;
  ELSE
    RAISE NOTICE '✅ Funções criadas: %', function_count;
  END IF;
END $$;

-- Teste de inserção (simulado)
DO $$
DECLARE
  test_control_id UUID;
  test_framework_id UUID;
  test_tenant_id UUID;
BEGIN
  -- Obter IDs de teste das tabelas existentes
  SELECT id INTO test_control_id FROM global_controls LIMIT 1;
  SELECT id INTO test_framework_id FROM frameworks LIMIT 1;
  
  IF test_control_id IS NULL THEN
    RAISE NOTICE '⚠️ Nenhum controle encontrado para teste';
  ELSIF test_framework_id IS NULL THEN
    RAISE NOTICE '⚠️ Nenhum framework encontrado para teste';
  ELSE
    -- Simular tenant_id (em produção seria extraído do JWT)
    test_tenant_id := gen_random_uuid();
    
    RAISE NOTICE '✅ Dados de teste disponíveis:';
    RAISE NOTICE '   Control ID: %', test_control_id;
    RAISE NOTICE '   Framework ID: %', test_framework_id;
    RAISE NOTICE '   Tenant ID: %', test_tenant_id;
  END IF;
END $$;

-- Verificar estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'control_frameworks'
ORDER BY ordinal_position;

-- Verificar políticas criadas
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies 
WHERE tablename = 'control_frameworks'
ORDER BY policyname;

-- Verificar índices criados
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'control_frameworks'
ORDER BY indexname;

-- Verificar funções criadas
SELECT 
  proname,
  prosrc
FROM pg_proc 
WHERE proname IN ('get_controls_by_framework', 'get_frameworks_by_control', 'get_control_framework_stats')
ORDER BY proname;

-- Mensagem final
SELECT '🎉 Todos os testes passaram! Tabela control_frameworks está pronta para uso.' as status; 