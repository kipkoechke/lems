#!/usr/bin/env bash
# =============================================================================
# deploy.sh
#
# Run on the server to perform a full deployment from the latest main branch.
# Called automatically by the GitHub Actions workflow.
#
# Usage (manual):
#   cd /opt/lems
#   ./scripts/deploy.sh
# =============================================================================
set -euo pipefail

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DEPLOY_DIR"

echo "==> [$(date -u '+%Y-%m-%dT%H:%M:%SZ')] Starting deployment..."
echo "    Deploy path: $DEPLOY_DIR"

# ── Pull latest code ─────────────────────────────────────
echo "==> Fetching latest code from origin/main..."
git fetch origin main
git reset --hard origin/main
echo "    At commit: $(git rev-parse --short HEAD)"

# ── Rebuild app image ─────────────────────────────────────
echo "==> Building Next.js Docker image..."
docker compose build --no-cache app

# ── Restart app (rolling - no nginx restart needed) ──────
echo "==> Bringing up updated app container..."
docker compose up -d --remove-orphans app

# ── Update host nginx vhost from repo and reload ──────
echo "==> Updating nginx vhost config..."
APP_PORT="${APP_PORT:-3010}"
DOMAIN="portal.vems.co.ke"
VHOST_SRC="$(pwd)/nginx/host-vhost.conf"
VHOST_DEST="/etc/nginx/sites-available/$DOMAIN"
if [ -f "$VHOST_SRC" ] && command -v nginx &>/dev/null; then
  sed "s/__APP_PORT__/$APP_PORT/g" "$VHOST_SRC" | sudo tee "$VHOST_DEST" > /dev/null
  sudo ln -sf "$VHOST_DEST" "/etc/nginx/sites-enabled/$DOMAIN"
  sudo nginx -t && sudo nginx -s reload
  echo "==> Host nginx reloaded."
fi

# ── Prune old images ──────────────────────────────────────
echo "==> Pruning dangling images..."
docker image prune -f

echo "==> [$(date -u '+%Y-%m-%dT%H:%M:%SZ')] Deployment finished successfully."
