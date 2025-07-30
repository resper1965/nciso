#!/usr/bin/env node

/**
 * 🛡️ n.CISO - Setup de Ambiente de Desenvolvimento
 * 
 * Script para configurar o arquivo .env com credenciais válidas para desenvolvimento
 */

const fs = require('fs')
const path = require('path')

const devConfig = {
  // Supabase (Credenciais - Configure suas próprias)
  SUPABASE_URL: 'your_supabase_url_here',
  SUPABASE_ANON_KEY: 'your_supabase_anon_key_here',
  SUPABASE_SERVICE_ROLE_KEY: 'your_supabase_service_role_key_here',

  // Segurança (Chaves válidas para desenvolvimento)
  JWT_SECRET: 'nciso_jwt_secret_key_2024_development_min_32_chars_long',
  BCRYPT_ROUNDS: '12',
  ENCRYPTION_KEY: 'nciso_encryption_key_32_chars_long_2024_dev',

  // Aplicação
  NODE_ENV: 'development',
  PORT: '3000',
  API_VERSION: 'v1',
  CORS_ORIGIN: 'http://localhost:3000',

  // Email
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: '587',
  SMTP_USER: 'dev@nciso.com',
  SMTP_PASS: 'your_email_password',
  SMTP_FROM: 'noreply@nciso.com',

  // Redis
  REDIS_URL: 'redis://localhost:6379',
  REDIS_PASSWORD: 'your_redis_password',
  REDIS_DB: '0',

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX_REQUESTS: '100',
  MAX_FILE_SIZE: '10485760',
  MAX_FILES: '5',

  // Logging
  LOG_LEVEL: 'info',
  LOG_FILE: 'logs/app.log',
  LOG_MAX_SIZE: '20m',
  LOG_MAX_FILES: '14',

  // i18n
  DEFAULT_LOCALE: 'pt-BR',
  SUPPORTED_LOCALES: 'pt-BR,en-US,es',
  I18N_DEBUG: 'false',

  // Desenvolvimento
  DEV_MODE: 'true',
  MOCK_DATA: 'true',
  DEBUG_MODE: 'false',
  TEST_MODE: 'false',

  // MCP Server
  MCP_LOG_LEVEL: 'info',
  MCP_TIMEOUT: '30000',
  MCP_MAX_CONNECTIONS: '100',

  // Serviços Externos
  PORTANIER_URL: 'http://localhost:9000',
  PORTANIER_USERNAME: 'admin',
  PORTANIER_PASSWORD: 'your_portainer_password',
  INFUSION_API_KEY: 'your_infusion_api_key',

  // n.Platform
  PLATFORM_SESSION_TIMEOUT: '3600000',
  PLATFORM_MAX_LOGIN_ATTEMPTS: '5',
  PLATFORM_LOCKOUT_DURATION: '900000',

  // n.ISMS
  ISMS_POLICY_APPROVAL_REQUIRED: 'true',
  ISMS_CONTROL_ASSESSMENT_INTERVAL: '30',
  ISMS_DOMAIN_MAX_LEVEL: '3',

  // n.Controls
  CONTROLS_EFFECTIVENESS_THRESHOLD: '70',
  CONTROLS_ASSESSMENT_REMINDER_DAYS: '7',
  CONTROLS_AUTO_REVIEW_ENABLED: 'true',

  // n.Audit
  AUDIT_SCHEDULE_ENABLED: 'true',
  AUDIT_REMINDER_DAYS: '3',
  AUDIT_MAX_DURATION_DAYS: '90',

  // n.Risk
  RISK_ASSESSMENT_FREQUENCY: '90',
  RISK_THRESHOLD_HIGH: '8',
  RISK_THRESHOLD_MEDIUM: '5',
  RISK_THRESHOLD_LOW: '3',

  // n.Privacy
  PRIVACY_DATA_RETENTION_DAYS: '2555',
  PRIVACY_CONSENT_REQUIRED: 'true',
  PRIVACY_BREACH_NOTIFICATION_HOURS: '72',

  // n.SecDevOps
  SECDEVOPS_SCAN_ENABLED: 'true',
  SECDEVOPS_SCAN_FREQUENCY: '24',
  SECDEVOPS_VULNERABILITY_THRESHOLD: '7',

  // n.Assessments
  ASSESSMENTS_AUTO_SCORING: 'true',
  ASSESSMENTS_REVIEW_REQUIRED: 'true',
  ASSESSMENTS_MAX_DURATION_DAYS: '30',

  // n.CIRT
  CIRT_RESPONSE_TIME_HOURS: '4',
  CIRT_ESCALATION_ENABLED: 'true',
  CIRT_NOTIFICATION_CHANNELS: 'email,slack',

  // n.Tickets
  TICKETS_AUTO_ASSIGNMENT: 'true',
  TICKETS_PRIORITY_ESCALATION: 'true',
  TICKETS_SLA_HOURS: '24',

  // Upload
  UPLOAD_MAX_SIZE: '10485760',
  UPLOAD_ALLOWED_TYPES: 'pdf,doc,docx,xls,xlsx,ppt,pptx,txt',
  UPLOAD_STORAGE_PATH: 'uploads',

  // Backup
  BACKUP_ENABLED: 'false',
  BACKUP_FREQUENCY: '24',
  BACKUP_RETENTION_DAYS: '30',

  // Monitoramento
  MONITORING_ENABLED: 'false',
  ALERT_EMAIL_ENABLED: 'false',
  SLACK_WEBHOOK_URL: '',

  // Performance
  CACHE_TTL: '3600',
  COMPRESSION_ENABLED: 'true',
  GZIP_LEVEL: '6'
}

function createEnvFile() {
  console.log('🔧 Configurando ambiente de desenvolvimento...\n')

  const envPath = path.join(process.cwd(), '.env')
  const force = process.argv.includes('--force')
  
  // Verificar se .env já existe
  if (fs.existsSync(envPath) && !force) {
    console.log('⚠️  Arquivo .env já existe!')
    console.log('   Use --force para sobrescrever')
    return
  }

  // Criar conteúdo do arquivo .env
  let envContent = `# =============================================================================
# 🛡️ n.CISO - Configuração de Ambiente (DESENVOLVIMENTO)
# =============================================================================
# Configurado automaticamente pelo script setup-env.js
# Para personalizar, edite este arquivo manualmente

`

  // Adicionar seções organizadas
  const sections = {
    '📊 BANCO DE DADOS - SUPABASE': [
      'SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'
    ],
    '🔐 SEGURANÇA E AUTENTICAÇÃO': [
      'JWT_SECRET', 'BCRYPT_ROUNDS', 'ENCRYPTION_KEY'
    ],
    '🚀 APLICAÇÃO PRINCIPAL': [
      'NODE_ENV', 'PORT', 'API_VERSION', 'CORS_ORIGIN'
    ],
    '📧 EMAIL E NOTIFICAÇÕES': [
      'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'
    ],
    '🗄️ CACHE - REDIS': [
      'REDIS_URL', 'REDIS_PASSWORD', 'REDIS_DB'
    ],
    '🛡️ RATE LIMITING E SEGURANÇA': [
      'RATE_LIMIT_WINDOW_MS', 'RATE_LIMIT_MAX_REQUESTS', 'MAX_FILE_SIZE', 'MAX_FILES'
    ],
    '📝 LOGGING E MONITORAMENTO': [
      'LOG_LEVEL', 'LOG_FILE', 'LOG_MAX_SIZE', 'LOG_MAX_FILES'
    ],
    '🌍 INTERNACIONALIZAÇÃO (i18n)': [
      'DEFAULT_LOCALE', 'SUPPORTED_LOCALES', 'I18N_DEBUG'
    ],
    '🧪 DESENVOLVIMENTO E TESTES': [
      'DEV_MODE', 'MOCK_DATA', 'DEBUG_MODE', 'TEST_MODE'
    ],
    '🛡️ MCP SERVER': [
      'MCP_LOG_LEVEL', 'MCP_TIMEOUT', 'MCP_MAX_CONNECTIONS'
    ],
    '🔗 SERVIÇOS EXTERNOS': [
      'PORTANIER_URL', 'PORTANIER_USERNAME', 'PORTANIER_PASSWORD', 'INFUSION_API_KEY'
    ],
    '📊 MÓDULOS ESPECÍFICOS': [
      'PLATFORM_SESSION_TIMEOUT', 'PLATFORM_MAX_LOGIN_ATTEMPTS', 'PLATFORM_LOCKOUT_DURATION',
      'ISMS_POLICY_APPROVAL_REQUIRED', 'ISMS_CONTROL_ASSESSMENT_INTERVAL', 'ISMS_DOMAIN_MAX_LEVEL',
      'CONTROLS_EFFECTIVENESS_THRESHOLD', 'CONTROLS_ASSESSMENT_REMINDER_DAYS', 'CONTROLS_AUTO_REVIEW_ENABLED',
      'AUDIT_SCHEDULE_ENABLED', 'AUDIT_REMINDER_DAYS', 'AUDIT_MAX_DURATION_DAYS',
      'RISK_ASSESSMENT_FREQUENCY', 'RISK_THRESHOLD_HIGH', 'RISK_THRESHOLD_MEDIUM', 'RISK_THRESHOLD_LOW',
      'PRIVACY_DATA_RETENTION_DAYS', 'PRIVACY_CONSENT_REQUIRED', 'PRIVACY_BREACH_NOTIFICATION_HOURS',
      'SECDEVOPS_SCAN_ENABLED', 'SECDEVOPS_SCAN_FREQUENCY', 'SECDEVOPS_VULNERABILITY_THRESHOLD',
      'ASSESSMENTS_AUTO_SCORING', 'ASSESSMENTS_REVIEW_REQUIRED', 'ASSESSMENTS_MAX_DURATION_DAYS',
      'CIRT_RESPONSE_TIME_HOURS', 'CIRT_ESCALATION_ENABLED', 'CIRT_NOTIFICATION_CHANNELS',
      'TICKETS_AUTO_ASSIGNMENT', 'TICKETS_PRIORITY_ESCALATION', 'TICKETS_SLA_HOURS'
    ],
    '🔧 CONFIGURAÇÕES AVANÇADAS': [
      'UPLOAD_MAX_SIZE', 'UPLOAD_ALLOWED_TYPES', 'UPLOAD_STORAGE_PATH',
      'BACKUP_ENABLED', 'BACKUP_FREQUENCY', 'BACKUP_RETENTION_DAYS',
      'MONITORING_ENABLED', 'ALERT_EMAIL_ENABLED', 'SLACK_WEBHOOK_URL',
      'CACHE_TTL', 'COMPRESSION_ENABLED', 'GZIP_LEVEL'
    ]
  }

  // Gerar conteúdo organizado
  for (const [sectionName, vars] of Object.entries(sections)) {
    envContent += `# =============================================================================
# ${sectionName}
# =============================================================================
`
    
    for (const varName of vars) {
      if (devConfig[varName] !== undefined) {
        envContent += `${varName}=${devConfig[varName]}\n`
      }
    }
    
    envContent += '\n'
  }

  // Escrever arquivo
  try {
    fs.writeFileSync(envPath, envContent)
    console.log('✅ Arquivo .env criado com sucesso!')
    console.log('📁 Localização:', envPath)
    console.log('\n🔍 Variáveis configuradas:')
    console.log(`   📊 Supabase: ${devConfig.SUPABASE_URL ? '✅' : '❌'}`)
    console.log(`   🔐 JWT Secret: ${devConfig.JWT_SECRET ? '✅' : '❌'}`)
    console.log(`   🚀 Porta: ${devConfig.PORT}`)
    console.log(`   🛡️ MCP Server: ${devConfig.MCP_LOG_LEVEL}`)
    
    console.log('\n💡 Próximos passos:')
    console.log('   1. Configure suas credenciais reais no arquivo .env')
    console.log('   2. Execute: npm run validate:env')
    console.log('   3. Execute: npm run dev')
    
  } catch (error) {
    console.error('❌ Erro ao criar arquivo .env:', error.message)
    process.exit(1)
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createEnvFile()
}

module.exports = createEnvFile 