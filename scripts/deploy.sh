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
docker compose up -d --no-deps --remove-orphans app

# ── Reload nginx ──────────────────────────────────────────
echo "==> Reloading Nginx configuration..."
docker compose exec -T nginx nginx -s reload || true

# ── Ensure other services are up ─────────────────────────
echo "==> Ensuring all services are running..."
docker compose up -d --remove-orphans

# ── Prune old images ──────────────────────────────────────
echo "==> Pruning dangling images..."
docker image prune -f

echo "==> [$(date -u '+%Y-%m-%dT%H:%M:%SZ')] Deployment finished successfully."
