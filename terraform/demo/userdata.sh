#!/bin/bash
set -e

# Install Docker
dnf update -y
dnf install -y docker git
systemctl enable --now docker
usermod -aG docker ec2-user

# Install Docker Compose plugin
mkdir -p /usr/local/lib/docker/cli-plugins
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
     -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# Clone the repo
git clone https://github.com/eng9myan/CyMed-Claude.git /opt/cymed
cd /opt/cymed

# Write .env
cat > /opt/cymed/.env <<EOF
POSTGRES_USER=cymed
POSTGRES_PASSWORD=${db_password}
POSTGRES_DB=cymed_db
SECRET_KEY=${secret_key}
EOF

# Write deploy script that GitHub Actions will call via SSM
cat > /opt/cymed/redeploy.sh <<'SCRIPT'
#!/bin/bash
set -e
cd /opt/cymed
AWS_REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGISTRY="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# Login to ECR
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $REGISTRY

# Pull latest images
git pull origin main
docker pull $REGISTRY/cymed-backend:latest
docker pull $REGISTRY/cymed-frontend:latest

# Override image names in compose
export BACKEND_IMAGE="$REGISTRY/cymed-backend:latest"
export FRONTEND_IMAGE="$REGISTRY/cymed-frontend:latest"

docker compose -f docker-compose.demo.yml --env-file .env up -d --remove-orphans
SCRIPT
chmod +x /opt/cymed/redeploy.sh

# Get SSL certificate and start nginx (HTTP first, then switch to HTTPS)
mkdir -p /opt/cymed/certbot/www /opt/cymed/certbot/conf

# Temporary nginx for certbot ACME challenge
docker run -d --name nginx-init \
  -p 80:80 \
  -v /opt/cymed/nginx/cymed.conf:/etc/nginx/conf.d/default.conf \
  -v /opt/cymed/certbot/www:/var/www/certbot \
  nginx:alpine || true

sleep 5

docker run --rm \
  -v /opt/cymed/certbot/conf:/etc/letsencrypt \
  -v /opt/cymed/certbot/www:/var/www/certbot \
  certbot/certbot certonly \
    --webroot --webroot-path=/var/www/certbot \
    --email ${certbot_email} --agree-tos --no-eff-email \
    -d ${domain} || true

docker stop nginx-init && docker rm nginx-init || true

# Start full stack
AWS_REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region)
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGISTRY="$ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $REGISTRY

docker pull $REGISTRY/cymed-backend:latest  || true
docker pull $REGISTRY/cymed-frontend:latest || true

export BACKEND_IMAGE="$REGISTRY/cymed-backend:latest"
export FRONTEND_IMAGE="$REGISTRY/cymed-frontend:latest"

cd /opt/cymed
docker compose -f docker-compose.demo.yml --env-file .env up -d
