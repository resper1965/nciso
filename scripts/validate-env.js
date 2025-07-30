#!/usr/bin/env node

/**
 * 🛡️ n.CISO - Validador de Variáveis de Ambiente
 * 
 * Script para validar se todas as variáveis necessárias estão configuradas
 */

require('dotenv').config()

const requiredVars = {
  // Supabase (Obrigatório)
  SUPABASE_URL: {
    required: true,
    description: 'URL do projeto Supabase',
    pattern: /^(https:\/\/.*\.supabase\.co|your_supabase_url_here)$/
  },
  SUPABASE_ANON_KEY: {
    required: true,
    description: 'Chave anônima do Supabase',
    pattern: /^(eyJ|sb_publishable_|your_supabase_anon_key_here)/
  },
  SUPABASE_SERVICE_ROLE_KEY: {
    required: true,
    description: 'Chave de serviço do Supabase',
    pattern: /^(eyJ|sb_secret_|your_supabase_service_role_key_here)/
  },

  // Segurança (Obrigatório)
  JWT_SECRET: {
    required: true,
    description: 'Chave secreta para JWT',
    minLength: 32
  },

  // Aplicação (Opcional com defaults)
  NODE_ENV: {
    required: false,
    default: 'development',
    description: 'Ambiente da aplicação'
  },
  PORT: {
    required: false,
    default: 3000,
    description: 'Porta do servidor'
  },

  // MCP Server (Opcional)
  MCP_LOG_LEVEL: {
    required: false,
    default: 'info',
    description: 'Nível de log do MCP Server'
  }
}

const optionalVars = {
  // Email
  SMTP_HOST: 'Servidor SMTP',
  SMTP_PORT: 'Porta SMTP',
  SMTP_USER: 'Usuário SMTP',
  SMTP_PASS: 'Senha SMTP',
  SMTP_FROM: 'Email remetente',

  // Redis
  REDIS_URL: 'URL do Redis',
  REDIS_PASSWORD: 'Senha do Redis',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: 'Janela de rate limiting',
  RATE_LIMIT_MAX_REQUESTS: 'Máximo de requisições',

  // Logging
  LOG_LEVEL: 'Nível de log',
  LOG_FILE: 'Arquivo de log',

  // i18n
  DEFAULT_LOCALE: 'Locale padrão',
  SUPPORTED_LOCALES: 'Locales suportados',

  // Desenvolvimento
  DEV_MODE: 'Modo desenvolvimento',
  MOCK_DATA: 'Dados mock',
  DEBUG_MODE: 'Modo debug',

  // Módulos específicos
  ISMS_POLICY_APPROVAL_REQUIRED: 'Aprovação de políticas obrigatória',
  CONTROLS_EFFECTIVENESS_THRESHOLD: 'Threshold de efetividade dos controles',
  AUDIT_SCHEDULE_ENABLED: 'Agendamento de auditorias habilitado',
  RISK_ASSESSMENT_FREQUENCY: 'Frequência de avaliação de riscos',
  PRIVACY_DATA_RETENTION_DAYS: 'Dias de retenção de dados',
  SECDEVOPS_SCAN_ENABLED: 'Scans de segurança habilitados',
  ASSESSMENTS_AUTO_SCORING: 'Pontuação automática de avaliações',
  CIRT_RESPONSE_TIME_HOURS: 'Tempo de resposta do CIRT',
  TICKETS_AUTO_ASSIGNMENT: 'Atribuição automática de tickets'
}

function validateEnv() {
  console.log('🔍 Validando variáveis de ambiente...\n')

  let hasErrors = false
  let hasWarnings = false

  // Validar variáveis obrigatórias
  for (const [varName, config] of Object.entries(requiredVars)) {
    const value = process.env[varName]
    
    if (config.required && !value) {
      console.error(`❌ ERRO: ${varName} é obrigatório`)
      console.error(`   Descrição: ${config.description}`)
      hasErrors = true
      continue
    }

    if (value) {
      // Validar padrão se especificado
      if (config.pattern && !config.pattern.test(value)) {
        console.error(`❌ ERRO: ${varName} tem formato inválido`)
        console.error(`   Valor: ${value}`)
        console.error(`   Descrição: ${config.description}`)
        hasErrors = true
        continue
      }

      // Validar comprimento mínimo se especificado
      if (config.minLength && value.length < config.minLength) {
        console.error(`❌ ERRO: ${varName} é muito curto`)
        console.error(`   Comprimento atual: ${value.length}`)
        console.error(`   Comprimento mínimo: ${config.minLength}`)
        hasErrors = true
        continue
      }

      console.log(`✅ ${varName}: Configurado`)
    } else {
      console.log(`⚠️  ${varName}: Usando valor padrão (${config.default})`)
      hasWarnings = true
    }
  }

  // Verificar variáveis opcionais
  console.log('\n📋 Variáveis opcionais configuradas:')
  for (const [varName, description] of Object.entries(optionalVars)) {
    const value = process.env[varName]
    if (value) {
      console.log(`✅ ${varName}: ${description}`)
    }
  }

  // Verificar variáveis não reconhecidas
  const recognizedVars = [...Object.keys(requiredVars), ...Object.keys(optionalVars)]
  const envVars = Object.keys(process.env)
  const unrecognizedVars = envVars.filter(envVar => !recognizedVars.includes(envVar))

  if (unrecognizedVars.length > 0) {
    console.log('\n⚠️  Variáveis não reconhecidas:')
    unrecognizedVars.forEach(varName => {
      console.log(`   ${varName}`)
    })
    hasWarnings = true
  }

  // Resumo
  console.log('\n' + '='.repeat(50))
  
  if (hasErrors) {
    console.log('❌ VALIDAÇÃO FALHOU')
    console.log('   Corrija os erros acima antes de continuar.')
    process.exit(1)
  } else if (hasWarnings) {
    console.log('⚠️  VALIDAÇÃO COMPLETA COM AVISOS')
    console.log('   A aplicação funcionará, mas algumas funcionalidades podem estar limitadas.')
  } else {
    console.log('✅ VALIDAÇÃO COMPLETA')
    console.log('   Todas as variáveis obrigatórias estão configuradas corretamente.')
  }

  console.log('\n📊 Resumo da configuração:')
  console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`)
  console.log(`   Porta: ${process.env.PORT || 3000}`)
  console.log(`   Supabase: ${process.env.SUPABASE_URL ? 'Configurado' : 'Não configurado'}`)
  console.log(`   JWT: ${process.env.JWT_SECRET ? 'Configurado' : 'Não configurado'}`)
  console.log(`   MCP Server: ${process.env.MCP_LOG_LEVEL ? 'Configurado' : 'Usando padrões'}`)
}

// Executar validação se chamado diretamente
if (require.main === module) {
  validateEnv()
}

module.exports = validateEnv 