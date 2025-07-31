#!/bin/bash

echo "🔑 Adicionando chave SSH do Cursor na VPS..."

# Chave pública do Cursor
CURSOR_PUBLIC_KEY="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDWnJhYxSfzbz6wUPBJYlZ2F1VcxzRYPV+Yhx9NvDk0Fvk6Bu+4f26mobFuhahd6GEaZDGKfG44jqDO+Vx+v9ujkw3Q3FmHO6PpRi0ZMD4aDPNqdu7X69lUg8/CO7tHpeI4MXoXLtEXU0VRsNzKCo8lU1aIirruURBxLIIl4xXG+0oJ5b6KiTciS08XE36C9DdcahU42awOwMRLHteo60E05IWcZ7FarfXuwgHuh24bjh6SZscDEUN8wOctrLA1Kmsj/psUgMghDykLLt7WCNq1smene8UGmTWirZHL9IXwQN2Spx8MA8LhhyzKWG5oKCPNmrcXSdUMUY+wShFnLZm+ElDZJnjcJg4g37RdE2Fj/zCwSiN3AUoe0G8gWisII/iHFF4Exlt0d6PhiMXd0H5cXz509nmiaFk+gnjCkN1r/C/Pbo2OadMsZSvrK+2LHo5/aY0P+TLKlUDQgT3qL3wrWWmOjDGtSS2arI27jChpByVDowuR4AvV4GyzDB4mMiASHWMrnAwqGxsoI8NK4OZ+047F/nOJniNQY/12ys6CJ3ftS0NhZdbvfC2WG9Z165HlCDnmoEOglVDN0MO7DiYIxDYcmJ+AX5FrKddUJIKUoXyBHTW3FDsFQwo06GLxMK8cU+nPf18aiEqg+4VLbJFipRDEL+QcwKBYzzw4qqE6+Q== nciso-deployment"

echo "📋 Chave pública do Cursor:"
echo "$CURSOR_PUBLIC_KEY"
echo ""

echo "🚀 Para adicionar esta chave na VPS, execute na VPS:"
echo ""
echo "1. Conecte na VPS:"
echo "   ssh root@62.72.8.164"
echo ""
echo "2. Adicione a chave:"
echo "   mkdir -p /root/.ssh"
echo "   echo '$CURSOR_PUBLIC_KEY' >> /root/.ssh/authorized_keys"
echo "   chmod 600 /root/.ssh/authorized_keys"
echo "   chmod 700 /root/.ssh"
echo ""

echo "🔧 Ou execute este comando direto:"
echo "ssh root@62.72.8.164 'mkdir -p /root/.ssh && echo \"$CURSOR_PUBLIC_KEY\" >> /root/.ssh/authorized_keys && chmod 600 /root/.ssh/authorized_keys && chmod 700 /root/.ssh'"
echo ""

echo "✅ Depois teste a conexão:"
echo "   bash scripts/ssh-vps.sh status" 