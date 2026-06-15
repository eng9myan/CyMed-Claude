FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt
RUN pip install gunicorn

COPY . /app/

# Expose port 8000 for Gunicorn
EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "cymed_core.wsgi:application"]
