# CyMed Security Hardening Guide

Step-by-step hardening for production deployment.

## 1. Operating System (Ubuntu 22.04)

```bash
# Apply all security updates
apt update && apt upgrade -y
unattended-upgrades --apply-updates

# Disable unused services
systemctl disable --now cups bluetooth avahi-daemon

# Create non-root cymed user (Odoo runs as this)
adduser --system --home /opt/cymed --shell /bin/bash cymed
usermod -aG www-data cymed

# Lock down SSH
sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#*PubkeyAuthentication.*/PubkeyAuthentication yes/' /etc/ssh/sshd_config
systemctl restart ssh

# Firewall: only HTTP/HTTPS/SSH
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# fail2ban for brute-force protection
apt install -y fail2ban
systemctl enable --now fail2ban
```

## 2. PostgreSQL

```bash
# Edit /etc/postgresql/16/main/postgresql.conf
ssl = on
ssl_cert_file = '/etc/postgresql/server.crt'
ssl_key_file = '/etc/postgresql/server.key'
log_connections = on
log_disconnections = on
log_statement = 'ddl'

# Edit /etc/postgresql/16/main/pg_hba.conf — require SCRAM
hostssl  all  all  0.0.0.0/0  scram-sha-256

# Encrypt data at rest (LUKS or AWS EBS encryption)
# Restrict role permissions
psql -c "REVOKE ALL ON SCHEMA public FROM PUBLIC;"
psql -c "GRANT USAGE ON SCHEMA public TO cymed;"
```

## 3. CyMed Application

```ini
# /etc/cymed/cymed.conf
[options]
admin_passwd = <bcrypt-hashed-strong-random>
db_host = 127.0.0.1
db_port = 5432
db_user = cymed
db_password = <strong-random>
proxy_mode = True
without_demo = all
list_db = False
db_filter = ^cymed$
debug_mode = False
log_level = info
log_handler = :INFO
logfile = /var/log/cymed/cymed.log
syslog = True
workers = 4
limit_request = 8192
limit_memory_hard = 2684354560
limit_memory_soft = 2147483648
limit_time_cpu = 60
limit_time_real = 120
max_cron_threads = 2
http_interface = 127.0.0.1
http_port = 8069
gevent_port = 8072
```

## 4. nginx Reverse Proxy

```nginx
# /etc/nginx/sites-available/cymed
upstream cymed_backend  { server 127.0.0.1:8069; }
upstream cymed_longpoll { server 127.0.0.1:8072; }

# Rate limiting
limit_req_zone $binary_remote_addr zone=cymed_login:10m rate=5r/m;
limit_req_zone $binary_remote_addr zone=cymed_general:10m rate=100r/m;

server {
    listen 80;
    server_name cymed.cy-com.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name cymed.cy-com.com;

    # TLS — modern profile (Mozilla SSL Configurator)
    ssl_certificate     /etc/letsencrypt/live/cymed.cy-com.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/cymed.cy-com.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305;
    ssl_prefer_server_ciphers off;
    ssl_session_timeout 1d;
    ssl_session_cache shared:CymedSSL:50m;
    ssl_session_tickets off;
    ssl_stapling on;
    ssl_stapling_verify on;

    # Security headers
    add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "geolocation=(), microphone=(), camera=(self)" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' wss:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';" always;

    # Hide server identity
    server_tokens off;
    more_set_headers "Server: CymedERP/1.0";

    # Body size limits
    client_max_body_size 200M;

    # Rate-limit login endpoint specifically
    location = /web/login {
        limit_req zone=cymed_login burst=5 nodelay;
        proxy_pass http://cymed_backend;
        include /etc/nginx/proxy_params;
    }

    # Lock down database manager (production)
    location ~ ^/web/database/(create|drop|backup|restore|manager) {
        return 403;
    }

    # WebSockets for live updates
    location /longpolling {
        proxy_pass http://cymed_longpoll;
        include /etc/nginx/proxy_params;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location / {
        limit_req zone=cymed_general burst=50 nodelay;
        proxy_pass http://cymed_backend;
        include /etc/nginx/proxy_params;
    }

    access_log /var/log/nginx/cymed-access.log;
    error_log  /var/log/nginx/cymed-error.log warn;
}
```

## 5. Application-Level Controls

In CyMed admin:

- **Password policy:** Settings → Users → Password rules: minimum length 12, expire 90 days
- **MFA:** Settings → Users → Two-factor authentication: enforce for all
- **Session timeout:** Settings → Technical → Parameters → System Parameters → `web.session.inactivity_timeout` = `900` (15 min)
- **Auto-vacuum logs:** schedule cron to purge `ir.logging` entries older than 180 days
- **Disable database manager UI:** `list_db = False` in cymed.conf
- **Audit:** install `auditlog` module; enable on `res.partner`, `account.move`, `hr.employee`

## 6. Backups

```bash
# /opt/cymed/backup.sh — nightly encrypted backup
#!/bin/bash
TS=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR=/srv/backups/cymed
mkdir -p $BACKUP_DIR

# Database
pg_dump -U cymed cymed | gpg --encrypt --recipient backup@cy-com.com \
  > $BACKUP_DIR/cymed_db_$TS.sql.gpg

# Filestore
tar czf - /var/lib/cymed/filestore | gpg --encrypt --recipient backup@cy-com.com \
  > $BACKUP_DIR/cymed_files_$TS.tar.gz.gpg

# Sync to S3 with versioning + lifecycle policy
aws s3 sync $BACKUP_DIR s3://cymed-backups/$(hostname)/ --storage-class STANDARD_IA

# Local retention 7 days
find $BACKUP_DIR -mtime +7 -delete
```

Schedule via cron: `0 2 * * * /opt/cymed/backup.sh`

## 7. Monitoring

- **Logs:** ship to Loki / ELK / CloudWatch via syslog or fluentbit
- **Metrics:** Prometheus exporter on port 9100 (node_exporter)
- **Alerting:** PagerDuty for: failed login >10/min, 5xx error rate >1%, disk >85%, certificate expiry <30d
- **APM:** Sentry for application errors

## 8. Verification

Run after every deploy:

```bash
# TLS configuration
testssl.sh https://cymed.cy-com.com

# Security headers
curl -I https://cymed.cy-com.com | grep -iE "strict|x-frame|x-content|csp"

# Open ports
nmap -sV -p- cymed.cy-com.com

# Dependency scan
pip-audit -r cymed_erp/requirements.txt
npm audit --prefix electron
npm audit --prefix mobile
```
