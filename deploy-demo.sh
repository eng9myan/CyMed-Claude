#!/bin/bash
# CyMed Demo Deployment — run this on your Linux server
# Usage: bash deploy-demo.sh
set -e

DOMAIN="cymed.cy-com.com"
EMAIL="m.alnsour@outlook.com"

echo "=== CyMed Demo Deployment ==="

# 1. Install Docker if missing
if ! command -v docker &>/dev/null; then
  echo "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable docker && systemctl start docker
fi

# 2. Install Docker Compose plugin if missing
if ! docker compose version &>/dev/null; then
  apt-get install -y docker-compose-plugin
fi

# 3. Ensure .env exists
if [ ! -f .env ]; then
  cp .env.demo .env
  SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(50))")
  sed -i "s/CHANGE_THIS_TO_A_RANDOM_50_CHAR_STRING/$SECRET/" .env
  echo ""
  echo ">>> .env created. SET your POSTGRES_PASSWORD before continuing:"
  echo "    nano .env"
  echo ""
  read -p "Press Enter when you have set the password..." _
fi

# 4. Create certbot directories
mkdir -p certbot/www certbot/conf

# 5. Start nginx on HTTP only first (certbot needs port 80)
#    Temporarily serve without SSL to get the certificate
cat > nginx/cymed-init.conf << 'EOF'
server {
    listen 80;
    server_name cymed.cy-com.com;
    location /.well-known/acme-challenge/ { root /var/www/certbot; }
    location / { return 200 'CyMed is coming...'; add_header Content-Type text/plain; }
}
EOF

echo "Starting nginx for ACME challenge..."
docker run -d --rm --name nginx-init \
  -p 80:80 \
  -v "$PWD/nginx/cymed-init.conf:/etc/nginx/conf.d/default.conf:ro" \
  -v "$PWD/certbot/www:/var/www/certbot:ro" \
  nginx:alpine

# 6. Issue SSL certificate
echo "Issuing SSL certificate for $DOMAIN..."
docker run --rm \
  -v "$PWD/certbot/conf:/etc/letsencrypt" \
  -v "$PWD/certbot/www:/var/www/certbot" \
  certbot/certbot certonly \
    --webroot --webroot-path=/var/www/certbot \
    --email "$EMAIL" --agree-tos --no-eff-email \
    -d "$DOMAIN"

# Stop temporary nginx
docker stop nginx-init || true
rm nginx/cymed-init.conf

# 7. Pull latest code
echo "Pulling latest code..."
git pull origin main 2>/dev/null || echo "(git pull skipped — not a git repo or already up to date)"

# 8. Build and start all services
echo "Building and starting CyMed..."
docker compose -f docker-compose.demo.yml --env-file .env up -d --build

echo ""
echo "=== Done! ==="
echo "CyMed is live at: https://$DOMAIN"
echo ""
echo "Useful commands:"
echo "  docker compose -f docker-compose.demo.yml logs -f backend   # Backend logs"
echo "  docker compose -f docker-compose.demo.yml logs -f frontend  # Frontend logs"
echo "  docker compose -f docker-compose.demo.yml down              # Stop everything"
