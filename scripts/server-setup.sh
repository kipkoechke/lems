#!/usr/bin/env bash
# =============================================================================
# server-setup.sh
#
# ONE-COMMAND full server setup for portal.vems.co.ke
#
# Run this on a fresh Ubuntu/Debian server (as root or a sudo user):
#
#   # Option A — if you can reach this script directly:
#   curl -fsSL https://raw.githubusercontent.com/YOUR_ORG/YOUR_REPO/main/scripts/server-setup.sh \
#     | REPO_URL=https://github.com/YOUR_ORG/YOUR_REPO.git \
#       LETSENCRYPT_EMAIL=admin@vems.co.ke \
#       bash
#
#   # Option B — after cloning the repo manually:
#   LETSENCRYPT_EMAIL=admin@vems.co.ke ./scripts/server-setup.sh
#
# Environment variables (all optional — script will prompt if missing):
#   REPO_URL            Git clone URL of this repo
#   DEPLOY_PATH         Where to deploy on disk  (default: /opt/lems)
#   APP_PORT            Host port the Next.js container binds to (default: 3010)
#   LETSENCRYPT_EMAIL   Email for cert expiry notices (default: admin@vems.co.ke)
#   STAGING             Set to 1 to use LE staging (cert not browser-trusted)
# =============================================================================
set -euo pipefail

# ── Colour helpers ────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
BOLD='\033[1m'
log()     { echo -e "${GREEN}${BOLD}==>${NC} $*"; }
info()    { echo -e "${CYAN}   ->${NC} $*"; }
warn()    { echo -e "${YELLOW}   WARN:${NC} $*"; }
die()     { echo -e "${RED}${BOLD}   ERROR:${NC} $*" >&2; exit 1; }
section() { echo ""; echo -e "${BOLD}━━━ $* ━━━${NC}"; }

# ── Privilege helper: use sudo when not root ──────────────────────────────────
SUDO=""
if [ "$(id -u)" -ne 0 ]; then
  SUDO="sudo"
  command -v sudo &>/dev/null || die "Not running as root and 'sudo' not found. Run as root or install sudo."
fi

# ── Configuration ─────────────────────────────────────────────────────────────
DOMAIN="portal.vems.co.ke"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/lems}"
APP_PORT="${APP_PORT:-3010}"
LETSENCRYPT_EMAIL="${LETSENCRYPT_EMAIL:-admin@vems.co.ke}"
STAGING="${STAGING:-0}"
REPO_URL="${REPO_URL:-}"

# ─────────────────────────────────────────────────────────────────────────────
# 1. Prerequisites
# ─────────────────────────────────────────────────────────────────────────────
check_and_install_prereqs() {
  section "Checking prerequisites"

  # ── git ──────────────────────────────────────────────
  if ! command -v git &>/dev/null; then
    log "Installing git..."
    $SUDO apt-get update -qq && $SUDO apt-get install -y -qq git
  else
    info "git: $(git --version)"
  fi

  # ── curl ─────────────────────────────────────────────
  if ! command -v curl &>/dev/null; then
    log "Installing curl..."
    $SUDO apt-get update -qq && $SUDO apt-get install -y -qq curl
  fi

  # ── Docker ───────────────────────────────────────────
  if ! command -v docker &>/dev/null; then
    log "Docker not found — installing via get.docker.com..."
    curl -fsSL https://get.docker.com | $SUDO sh
    $SUDO systemctl enable --now docker
    info "Docker installed: $(docker --version)"
    if [ -n "${SUDO_USER:-}" ]; then
      $SUDO usermod -aG docker "$SUDO_USER"
      warn "Added $SUDO_USER to the docker group. A re-login is needed for non-sudo docker use."
    fi
  else
    info "Docker: $(docker --version)"
  fi

  # ── Docker Compose plugin ────────────────────────────
  if ! docker compose version &>/dev/null; then
    log "Docker Compose plugin not found — installing..."
    $SUDO apt-get update -qq
    $SUDO apt-get install -y -qq docker-compose-plugin
  else
    info "Docker Compose: $(docker compose version --short)"
  fi

  # ── Nginx (host) ─────────────────────────────────────
  if ! command -v nginx &>/dev/null; then
    log "Installing nginx on host..."
    $SUDO apt-get update -qq && $SUDO apt-get install -y -qq nginx
    $SUDO systemctl enable nginx
  else
    info "nginx: $(nginx -v 2>&1)"
  fi

  # ── Certbot (host) ───────────────────────────────────
  if ! command -v certbot &>/dev/null; then
    log "Installing certbot on host..."
    $SUDO apt-get update -qq && $SUDO apt-get install -y -qq certbot python3-certbot-nginx
  else
    info "certbot: $(certbot --version 2>&1)"
  fi

  # ── Sudoers: let deploy user reload nginx without password ───────────────
  if id deploy &>/dev/null && [ -n "$SUDO" ]; then
    SUDOERS_FILE="/etc/sudoers.d/deploy-nginx"
    if [ ! -f "$SUDOERS_FILE" ]; then
      log "Granting deploy user passwordless sudo for nginx reload..."
      echo "deploy ALL=(ALL) NOPASSWD: /usr/sbin/nginx, /bin/systemctl reload nginx, /bin/systemctl restart nginx, /usr/bin/certbot" \
        | $SUDO tee "$SUDOERS_FILE" > /dev/null
      $SUDO chmod 440 "$SUDOERS_FILE"
    fi
  fi

  log "All prerequisites satisfied."
}

# ─────────────────────────────────────────────────────────────────────────────
# 2. Clone or update repository
# ─────────────────────────────────────────────────────────────────────────────
setup_repo() {
  section "Repository"

  # If we're already inside the repo (e.g. piped from curl into bash,
  # but DEPLOY_PATH is where we want it deployed), ask for repo URL.
  if [ -z "$REPO_URL" ]; then
    if [ -f "$DEPLOY_PATH/.git/config" ]; then
      # Derive URL from the existing clone
      REPO_URL=$(git -C "$DEPLOY_PATH" remote get-url origin 2>/dev/null || true)
    fi
    if [ -z "$REPO_URL" ]; then
      read -rp "  Enter git repository URL: " REPO_URL
    fi
  fi

  if [ -d "$DEPLOY_PATH/.git" ]; then
    log "Repo already cloned at $DEPLOY_PATH. Pulling latest main..."
    git -C "$DEPLOY_PATH" fetch origin main
    git -C "$DEPLOY_PATH" reset --hard origin/main
    info "At commit: $(git -C "$DEPLOY_PATH" rev-parse --short HEAD)"
  else
    log "Cloning $REPO_URL → $DEPLOY_PATH ..."
    mkdir -p "$(dirname "$DEPLOY_PATH")"
    git clone "$REPO_URL" "$DEPLOY_PATH"
    info "At commit: $(git -C "$DEPLOY_PATH" rev-parse --short HEAD)"
  fi

  # Ensure the deploy user owns the entire directory so subsequent
  # git pulls and docker compose commands work without sudo.
  if id deploy &>/dev/null; then
    log "Setting ownership of $DEPLOY_PATH to deploy:deploy ..."
    chown -R deploy:deploy "$DEPLOY_PATH"
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# 3. Environment file
# ─────────────────────────────────────────────────────────────────────────────
setup_env() {
  section "Environment"
  cd "$DEPLOY_PATH"

  if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
      cp .env.example .env
      log ".env created from .env.example"
    else
      # .env.example not in repo yet — write minimal defaults
      cat > .env <<EOF
# Generated by server-setup.sh
LETSENCRYPT_EMAIL=${LETSENCRYPT_EMAIL}
EOF
      log ".env created with defaults (no .env.example found)"
    fi
    # Ensure email is set correctly regardless of source
    sed -i "s|LETSENCRYPT_EMAIL=.*|LETSENCRYPT_EMAIL=$LETSENCRYPT_EMAIL|" .env
    info "Review it at $DEPLOY_PATH/.env if you need to add NEXT_PUBLIC_API_URL"
  else
    log ".env already exists — leaving it unchanged."
    export LETSENCRYPT_EMAIL
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# 4. Configure host nginx vhost & obtain SSL cert
# ─────────────────────────────────────────────────────────────────────────────
setup_nginx_and_ssl() {
  section "Nginx vhost & SSL Certificate"
  cd "$DEPLOY_PATH"

  local VHOST_SRC="$DEPLOY_PATH/nginx/host-vhost.conf"
  local VHOST_DEST="/etc/nginx/sites-available/$DOMAIN"
  local VHOST_LINK="/etc/nginx/sites-enabled/$DOMAIN"
  local ACME_ROOT="/var/www/certbot"

  # Write the vhost with the correct port substituted
  log "Installing nginx vhost for $DOMAIN (upstream port $APP_PORT)..."
  sed "s/__APP_PORT__/$APP_PORT/g" "$VHOST_SRC" | $SUDO tee "$VHOST_DEST" > /dev/null
  $SUDO ln -sf "$VHOST_DEST" "$VHOST_LINK"

  # If cert doesn't exist yet, use a temporary HTTP-only config so nginx
  # starts cleanly before we have the SSL cert.
  if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    log "No cert yet — starting nginx with HTTP-only config for ACME challenge..."
    # Comment out the SSL server block temporarily
    $SUDO tee "$VHOST_DEST" > /dev/null <<HTTPONLY
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN;
    location /.well-known/acme-challenge/ { root $ACME_ROOT; }
    location / { return 200 'provisioning...'; add_header Content-Type text/plain; }
}
HTTPONLY
    $SUDO mkdir -p "$ACME_ROOT"
    $SUDO nginx -t && ($SUDO systemctl reload nginx || $SUDO systemctl start nginx)

    log "Obtaining Let's Encrypt certificate..."
    STAGING_FLAG=""
    [ "${STAGING:-0}" = "1" ] && STAGING_FLAG="--staging"
    $SUDO certbot certonly --webroot -w "$ACME_ROOT" \
      $STAGING_FLAG \
      --email "$LETSENCRYPT_EMAIL" \
      --agree-tos --no-eff-email \
      --non-interactive \
      -d "$DOMAIN"

    # Now install the real vhost with SSL
    sed "s/__APP_PORT__/$APP_PORT/g" "$VHOST_SRC" | $SUDO tee "$VHOST_DEST" > /dev/null
    log "SSL cert obtained. Reloading nginx with HTTPS config..."
  else
    log "SSL certificate already exists for $DOMAIN."
  fi

  $SUDO nginx -t && ($SUDO systemctl reload nginx || $SUDO systemctl start nginx)
  log "Nginx configured and running."

  # Set up certbot auto-renewal cron if not already present
  if ! $SUDO crontab -l 2>/dev/null | grep -q "certbot renew"; then
    ($SUDO crontab -l 2>/dev/null; echo "0 3 * * * certbot renew --quiet && nginx -s reload") \
      | $SUDO crontab -
    log "Certbot auto-renewal cron added (runs daily at 03:00)."
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# 5. Start the full stack
# ─────────────────────────────────────────────────────────────────────────────
start_stack() {
  section "Starting all services"
  cd "$DEPLOY_PATH"

  # Build the app image first (can take several minutes on first run).
  # Doing this separately avoids health-check timeouts racing against the build.
  log "Building Next.js Docker image (this may take a few minutes)..."
  docker compose build --no-cache app

  log "Starting all containers..."
  docker compose up -d --remove-orphans

  # Wait for the app to pass its health check before declaring success
  log "Waiting for app to become healthy (up to 3 minutes)..."
  ATTEMPTS=0
  until docker compose ps app | grep -q "healthy" || [ $ATTEMPTS -ge 18 ]; do
    sleep 10
    ATTEMPTS=$((ATTEMPTS + 1))
    info "  ... waiting (${ATTEMPTS}/18)"
  done

  docker compose ps
}

# ─────────────────────────────────────────────────────────────────────────────
# 6. Smoke test
# ─────────────────────────────────────────────────────────────────────────────
smoke_test() {
  section "Smoke test"
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
    --max-time 30 --retry 5 --retry-delay 5 \
    "https://$DOMAIN" 2>/dev/null || echo "000")

  if [[ "$HTTP_STATUS" == "200" || "$HTTP_STATUS" == "301" || "$HTTP_STATUS" == "302" ]]; then
    log "Site is ${GREEN}UP${NC} at https://$DOMAIN  (HTTP $HTTP_STATUS)"
  else
    warn "Site returned HTTP $HTTP_STATUS — check logs below:"
    docker compose -f "$DEPLOY_PATH/docker-compose.yml" logs --tail=40
    warn "The site may still be starting. Re-run the smoke test manually:"
    warn "  curl -I https://$DOMAIN"
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# 7. Print summary
# ─────────────────────────────────────────────────────────────────────────────
print_summary() {
  echo ""
  echo -e "${GREEN}${BOLD}╔══════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}${BOLD}║        Setup complete — site is live!            ║${NC}"
  echo -e "${GREEN}${BOLD}╚══════════════════════════════════════════════════╝${NC}"
  echo ""
  echo -e "  ${BOLD}URL:${NC}            https://$DOMAIN"
  echo -e "  ${BOLD}Deploy path:${NC}    $DEPLOY_PATH"
  echo ""
  echo -e "  ${BOLD}Useful commands:${NC}"
  echo -e "    View logs:      docker compose -C $DEPLOY_PATH logs -f"
  echo -e "    Restart app:    docker compose -C $DEPLOY_PATH restart app"
  echo -e "    Manual update:  $DEPLOY_PATH/scripts/deploy.sh"
  echo -e "    Force SSL renew: certbot renew --force-renewal && nginx -s reload"
  echo ""
  echo -e "  ${BOLD}CI/CD:${NC} Every push to ${BOLD}main${NC} deploys automatically via GitHub Actions."
  echo -e "         Required secrets: SSH_PRIVATE_KEY, SERVER_HOST, SERVER_USER, DEPLOY_PATH"
  echo ""
}

# ─────────────────────────────────────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────────────────────────────────────
main() {
  echo -e "${BOLD}"
  echo "  ██╗     ███████╗███╗   ███╗███████╗"
  echo "  ██║     ██╔════╝████╗ ████║██╔════╝"
  echo "  ██║     █████╗  ██╔████╔██║███████╗"
  echo "  ██║     ██╔══╝  ██║╚██╔╝██║╚════██║"
  echo "  ███████╗███████╗██║ ╚═╝ ██║███████║"
  echo "  ╚══════╝╚══════╝╚═╝     ╚═╝╚══════╝"
  echo -e "${NC}"
  echo -e "  Automated server setup for ${CYAN}${BOLD}https://$DOMAIN${NC}"
  echo ""

  check_and_install_prereqs
  setup_repo
  setup_env
  setup_nginx_and_ssl
  start_stack
  smoke_test
  print_summary
}

main "$@"
