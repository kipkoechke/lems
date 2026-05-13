#!/usr/bin/env bash
# =============================================================================
# init-letsencrypt.sh
#
# Bootstraps Let's Encrypt certificates for portal.vems.co.ke.
# Called automatically by server-setup.sh — safe to run manually too.
#
# Strategy:
#   1. Generate a temporary self-signed cert so Nginx can start (SSL config
#      references the cert files; they must exist before nginx -t passes).
#   2. Start Nginx (serves ACME challenge over HTTP on port 80).
#   3. Obtain real Let's Encrypt cert via certbot webroot.
#   4. Reload Nginx so it picks up the real cert.
# =============================================================================
set -euo pipefail

DOMAIN="portal.vems.co.ke"
EMAIL="${LETSENCRYPT_EMAIL:-admin@vems.co.ke}"
STAGING="${STAGING:-0}"   # set STAGING=1 env var to use Let's Encrypt staging

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
log()  { echo -e "${GREEN}  ==>${NC} $*"; }
warn() { echo -e "${YELLOW}  WARN:${NC} $*"; }

# ── Helper: check if a real (non-self-signed) cert already exists ────────────
cert_exists() {
  docker compose run --rm --no-deps --entrypoint sh certbot -c \
    "test -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem" 2>/dev/null
}

# ── Step 1: Create self-signed placeholder cert ──────────────────────────────
create_dummy_cert() {
  log "Creating temporary self-signed certificate so Nginx can start..."
  docker compose run --rm --no-deps --entrypoint sh certbot -c "
    apk add --no-cache openssl >/dev/null 2>&1
    mkdir -p /etc/letsencrypt/live/$DOMAIN
    if [ ! -f /etc/letsencrypt/live/$DOMAIN/fullchain.pem ]; then
      openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
        -keyout /etc/letsencrypt/live/$DOMAIN/privkey.pem \
        -out    /etc/letsencrypt/live/$DOMAIN/fullchain.pem \
        -subj   '/CN=localhost' 2>/dev/null
      echo '    Self-signed cert written.'
    else
      echo '    Cert file already present, skipping self-sign.'
    fi
  "
}

# ── Step 2: Start Nginx ───────────────────────────────────────────────────────
start_nginx() {
  log "Starting Nginx..."
  docker compose up -d --no-deps nginx
  log "Waiting for Nginx to be ready (10 s)..."
  sleep 10
  docker compose exec -T nginx nginx -t \
    && log "Nginx config OK." \
    || { echo "Nginx config test failed. Check nginx logs."; docker compose logs --tail=30 nginx; exit 1; }
}

# ── Step 3: Obtain real certificate ─────────────────────────────────────────
obtain_cert() {
  log "Requesting Let's Encrypt certificate for $DOMAIN (email: $EMAIL)..."
  STAGING_FLAG=""
  if [ "${STAGING}" = "1" ]; then
    STAGING_FLAG="--staging"
    warn "Using Let's Encrypt STAGING server — cert will NOT be trusted by browsers."
  fi

  docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    ${STAGING_FLAG} \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d "$DOMAIN"
}

# ── Step 4: Reload Nginx with real cert ──────────────────────────────────────
reload_nginx() {
  log "Reloading Nginx with the real certificate..."
  docker compose exec -T nginx nginx -s reload
}

# ── Main ──────────────────────────────────────────────────────────────────────
main() {
  if cert_exists 2>/dev/null; then
    log "A certificate already exists for $DOMAIN."
    log "To force renewal: docker compose run --rm certbot renew --force-renewal"
    return 0
  fi

  create_dummy_cert
  start_nginx
  obtain_cert
  reload_nginx

  log "SSL certificate successfully obtained for $DOMAIN."
  log "Auto-renewal runs every 12 h via the certbot service."
}

main "$@"

echo "==> Reloading Nginx with SSL configuration..."
docker compose exec nginx nginx -s reload

echo ""
echo "======================================================"
echo " SSL certificate obtained for $DOMAIN"
echo " Certificates are stored in the 'certbot-conf' volume"
echo " Auto-renewal runs every 12h via the certbot service"
echo "======================================================"
