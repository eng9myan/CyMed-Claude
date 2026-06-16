FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DEBIAN_FRONTEND=noninteractive

# System dependencies for the ERP engine
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libxml2-dev libxslt1-dev libldap2-dev libsasl2-dev libssl-dev \
    libjpeg-dev libpq-dev libffi-dev \
    libpoppler-cpp-dev \
    fonts-noto-cjk fonts-liberation \
    libfreetype6-dev \
    nodejs npm \
    wkhtmltopdf \
    git curl \
    && rm -rf /var/lib/apt/lists/*

# RTL CSS compiler for the ERP web client
RUN npm install -g rtlcss

WORKDIR /opt/cymed_erp

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir psycopg2-binary

COPY . /opt/cymed_erp

# Make engine bin executable
RUN chmod +x cymed-erp-bin

# Engine listens on 8069
EXPOSE 8069 8071 8072

# Data volume for filestore + sessions
VOLUME ["/var/lib/cymed_erp"]

ENV CYMED_ERP_CONFIG=/etc/cymed_erp/cymed.conf

CMD ["python", "cymed-erp-bin", \
     "--addons-path=/opt/cymed_erp/cymed_erp_core/addons,/opt/cymed_erp/addons", \
     "--data-dir=/var/lib/cymed_erp", \
     "--without-demo=all", \
     "--db_host=db", "--db_port=5432", \
     "--db_user=cymed", "--db_password=cymed_erp_password", \
     "--http-port=8069", \
     "--workers=2", \
     "--proxy-mode"]
