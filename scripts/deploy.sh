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

# ── Stop any containers binding to ports 80/443 ───────────
# Containerised nginx from old compose setups auto-restart on reboot
# and steal ports 80/443 from host nginx. Identify and remove them so
# host nginx stays in control on every deploy AND after every reboot.
echo "==> Checking for containers competing on ports 80 / 443..."
CONFLICT=$(docker ps --format '{{.ID}} {{.Names}} {{.Ports}}' \
  | grep -E '0\.0\.0\.0:(80|443)->' || true)
if [ -n "$CONFLICT" ]; then
  echo "    Found — stopping:"
  echo "$CONFLICT"
  echo "$CONFLICT" | awk '{print $1}' | xargs docker stop
  # Disable auto-restart so they don't come back after reboot
  echo "$CONFLICT" | awk '{print $1}' | xargs docker update --restart=no || true
  echo "    Stopped and disabled restart on conflicting containers."
else
  echo "    None found."
fi

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

# ── Wait for healthy ──────────────────────────────────────
echo "==> Waiting for app to be healthy (up to 2 min)..."
ATTEMPTS=0
until docker compose ps app | grep -q "healthy" || [ $ATTEMPTS -ge 12 ]; do
  sleep 10; ATTEMPTS=$((ATTEMPTS + 1))
  echo "    ... waiting (${ATTEMPTS}/12)"
done
docker compose ps app

# ── Update host nginx vhost from repo and reload ──────────
echo "==> Installing nginx vhost and systemd boot service..."
APP_PORT="${APP_PORT:-3010}"
DOMAIN="portal.vems.co.ke"
CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
VHOST_SRC="$(pwd)/nginx/host-vhost.conf"
VHOST_DEST="/etc/nginx/sites-available/$DOMAIN"

if [ -f "$VHOST_SRC" ] && command -v nginx &>/dev/null; then
  # ── 1. Write the vhost (one place only: sites-available + symlink) ──
  # Remove the conf.d duplicate if it was created by a previous deploy version
  sudo rm -f "/etc/nginx/conf.d/$DOMAIN.conf"
  sed "s/__APP_PORT__/$APP_PORT/g" "$VHOST_SRC" | sudo tee "$VHOST_DEST" > /dev/null
  sudo ln -sf "$VHOST_DEST" "/etc/nginx/sites-enabled/$DOMAIN"

  # Remove any stale portal blocks certbot injected into OTHER nginx files
  echo "==> Removing stale portal blocks from other nginx configs..."
  for conf_file in /etc/nginx/sites-available/*; do
    [ "$conf_file" = "$VHOST_DEST" ] && continue
    if grep -ql "server_name.*$DOMAIN" "$conf_file" 2>/dev/null; then
      sudo python3 "$(pwd)/scripts/fix-nginx-conflict.py" "$conf_file" "$DOMAIN"
    fi
  done

  # ── 2. Install a helper script that re-applies the vhost on boot ───
  sudo cp "$(pwd)/scripts/lems-nginx.sh" /usr/local/bin/lems-nginx-apply
  sudo chmod +x /usr/local/bin/lems-nginx-apply

  # ── 3. Install/update systemd service that runs lems-nginx-apply ───
  # Runs after docker so it fires on every server reboot automatically.
  sudo tee /etc/systemd/system/lems-nginx.service > /dev/null <<SERVICE
[Unit]
Description=Apply LEMS portal.vems.co.ke nginx vhost on boot
After=network.target nginx.service docker.service

[Service]
Type=oneshot
EnvironmentFile=-/opt/lems/.env
Environment=DEPLOY_DIR=/opt/lems
ExecStart=/usr/local/bin/lems-nginx-apply
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
SERVICE
  sudo systemctl daemon-reload
  sudo systemctl enable lems-nginx.service
  echo "    lems-nginx.service installed and enabled."

  # ── 4. Apply config right now ─────────────────────────────────────
  if [ -f "$CERT_PATH" ]; then
    sudo nginx -t && sudo nginx -s reload
    echo "==> Host nginx reloaded with portal vhost."
  else
    echo "==> WARN: cert not found at $CERT_PATH — skipping nginx reload."
  fi
fi

# ── Prune old images ──────────────────────────────────────
echo "==> Pruning dangling images..."
docker image prune -f

echo "==> [$(date -u '+%Y-%m-%dT%H:%M:%SZ')] Deployment finished successfully."
