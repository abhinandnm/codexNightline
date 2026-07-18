#!/usr/bin/env bash
set -euo pipefail

APP_DIR=/opt/kmrl-orbit
REPO_URL="${1:?Usage: sudo ./setup.sh <git-repository-url>}"
PASSENGER_ORIGIN="${PASSENGER_ORIGIN:?Set PASSENGER_ORIGIN to the Passenger Vercel URL}"
DRIVER_ORIGIN="${DRIVER_ORIGIN:?Set DRIVER_ORIGIN to the Driver Vercel URL}"

apt-get update
apt-get install -y git python3 python3-venv python3-pip nginx
id -u kmrlorbit >/dev/null 2>&1 || useradd --system --create-home --shell /usr/sbin/nologin kmrlorbit

if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" pull --ff-only
else
  git clone "$REPO_URL" "$APP_DIR"
fi

python3 -m venv "$APP_DIR/backend/.venv"
"$APP_DIR/backend/.venv/bin/pip" install --upgrade pip
"$APP_DIR/backend/.venv/bin/pip" install -r "$APP_DIR/backend/requirements.txt"

install -d -m 0750 -o kmrlorbit -g www-data /etc/kmrl-orbit
cat > /etc/kmrl-orbit/api.env <<EOF
FLASK_ENV=production
DATABASE_PATH=$APP_DIR/backend/instance/orbit.sqlite3
PASSENGER_ORIGIN=$PASSENGER_ORIGIN
DRIVER_ORIGIN=$DRIVER_ORIGIN
EOF
chown root:www-data /etc/kmrl-orbit/api.env
chmod 0640 /etc/kmrl-orbit/api.env

install -m 0644 "$APP_DIR/deploy/ec2/kmrl-orbit-api.service" /etc/systemd/system/kmrl-orbit-api.service
install -m 0644 "$APP_DIR/deploy/ec2/nginx-kmrl-orbit.conf" /etc/nginx/sites-available/kmrl-orbit
ln -sf /etc/nginx/sites-available/kmrl-orbit /etc/nginx/sites-enabled/kmrl-orbit
rm -f /etc/nginx/sites-enabled/default
install -d -m 0750 -o kmrlorbit -g www-data "$APP_DIR/backend/instance"
systemctl daemon-reload
systemctl enable --now kmrl-orbit-api
nginx -t
systemctl enable --now nginx
echo "Deployment complete. Verify with: curl http://127.0.0.1/api/health"
