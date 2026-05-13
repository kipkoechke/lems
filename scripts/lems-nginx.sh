#!/usr/bin/env bash
# =============================================================================
# lems-nginx.sh
#
# Installed by deploy.sh as /usr/local/bin/lems-nginx-apply
# Run by lems-nginx.service on every boot to keep the portal.vems.co.ke
# nginx vhost in place and nginx reloaded.
# =============================================================================
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/lems}"
APP_PORT="${APP_PORT:-3010}"
DOMAIN="portal.vems.co.ke"
CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
VHOST_SRC="$DEPLOY_DIR/nginx/host-vhost.conf"
VHOST_DEST="/etc/nginx/sites-available/$DOMAIN"

if [ ! -f "$VHOST_SRC" ]; then
  echo "ERROR: vhost template not found at $VHOST_SRC"
  exit 1
fi

# Write vhost from repo template
sed "s/__APP_PORT__/$APP_PORT/g" "$VHOST_SRC" > "$VHOST_DEST"
ln -sf "$VHOST_DEST" "/etc/nginx/sites-enabled/$DOMAIN"

# Remove portal blocks injected by certbot into other nginx configs
if command -v python3 &>/dev/null && [ -f "$DEPLOY_DIR/scripts/fix-nginx-conflict.py" ]; then
  for conf_file in /etc/nginx/sites-available/*; do
    [ "$conf_file" = "$VHOST_DEST" ] && continue
    if grep -ql "server_name.*$DOMAIN" "$conf_file" 2>/dev/null; then
      python3 "$DEPLOY_DIR/scripts/fix-nginx-conflict.py" "$conf_file" "$DOMAIN"
    fi
  done
fi

# Reload nginx if cert exists
if [ -f "$CERT_PATH" ]; then
  nginx -t && nginx -s reload
  echo "nginx reloaded with portal.vems.co.ke vhost"
else
  echo "WARN: cert not found at $CERT_PATH — nginx not reloaded"
fi
