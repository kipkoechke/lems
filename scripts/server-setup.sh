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

# ── Configuration ─────────────────────────────────────────────────────────────
DOMAIN="portal.vems.co.ke"
DEPLOY_PATH="${DEPLOY_PATH:-/opt/lems}"
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
    apt-get update -qq && apt-get install -y -qq git
  else
    info "git: $(git --version)"
  fi

  # ── curl (needed for verification step) ─────────────
  if ! command -v curl &>/dev/null; then
    log "Installing curl..."
    apt-get update -qq && apt-get install -y -qq curl
  fi

  # ── Docker ───────────────────────────────────────────
  if ! command -v docker &>/dev/null; then
    log "Docker not found — installing via get.docker.com..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker
    info "Docker installed: $(docker --version)"
    # Add current (non-root) user to docker group if running via sudo
    if [ -n "${SUDO_USER:-}" ]; then
      usermod -aG docker "$SUDO_USER"
      warn "Added $SUDO_USER to the docker group. A re-login is needed for non-sudo docker use."
    fi
  else
    info "Docker: $(docker --version)"
  fi

  # ── Docker Compose plugin ────────────────────────────
  if ! docker compose version &>/dev/null; then
    log "Docker Compose plugin not found — installing..."
    apt-get update -qq
    apt-get install -y -qq docker-compose-plugin
  else
    info "Docker Compose: $(docker compose version --short)"
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
}

# ─────────────────────────────────────────────────────────────────────────────
# 3. Environment file
# ─────────────────────────────────────────────────────────────────────────────
setup_env() {
  section "Environment"
  cd "$DEPLOY_PATH"

  if [ ! -f ".env" ]; then
    cp .env.example .env
    # Inject the email we already know
    sed -i "s|LETSENCRYPT_EMAIL=.*|LETSENCRYPT_EMAIL=$LETSENCRYPT_EMAIL|" .env
    log ".env created from .env.example"
    info "Review it at $DEPLOY_PATH/.env if you need to add NEXT_PUBLIC_API_URL"
  else
    log ".env already exists — leaving it unchanged."
    # Still make sure LETSENCRYPT_EMAIL is set for the certbot step
    export LETSENCRYPT_EMAIL
  fi
}

# ─────────────────────────────────────────────────────────────────────────────
# 4. SSL certificate bootstrap
# ─────────────────────────────────────────────────────────────────────────────
bootstrap_ssl() {
  section "SSL Certificate (Let's Encrypt)"
  cd "$DEPLOY_PATH"
  export LETSENCRYPT_EMAIL STAGING
  bash scripts/init-letsencrypt.sh
}

# ─────────────────────────────────────────────────────────────────────────────
# 5. Start the full stack
# ─────────────────────────────────────────────────────────────────────────────
start_stack() {
  section "Starting all services"
  cd "$DEPLOY_PATH"

  docker compose up -d --remove-orphans
  log "All services started. Waiting 20 s for health checks..."
  sleep 20
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
  echo -e "    Force SSL renew: docker compose -C $DEPLOY_PATH run --rm certbot renew --force-renewal"
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
  bootstrap_ssl
  start_stack
  smoke_test
  print_summary
}

main "$@"
