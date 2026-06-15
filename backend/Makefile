.PHONY: up down build restart shell artisan tinker migrate migrate-fresh seed test \
        test-filter logs ps composer npm key-generate passport-install

# ── Docker lifecycle ──────────────────────────────────────────────────────────

up:
	docker compose up -d

up-build:
	docker compose up -d --build

down:
	docker compose down

restart:
	docker compose restart app nginx

ps:
	docker compose ps

logs:
	docker compose logs -f app horizon

logs-all:
	docker compose logs -f

# ── App shell / REPL ─────────────────────────────────────────────────────────

shell:
	docker compose exec app sh

tinker:
	docker compose exec app php artisan tinker

# ── Laravel artisan wrappers ─────────────────────────────────────────────────

artisan:
	docker compose exec app php artisan $(cmd)

key-generate:
	docker compose exec app php artisan key:generate

passport-install:
	docker compose exec app php artisan passport:install --uuids

# ── Database ─────────────────────────────────────────────────────────────────

migrate:
	docker compose exec app php artisan migrate

migrate-fresh:
	docker compose exec app php artisan migrate:fresh --seed

seed:
	docker compose exec app php artisan db:seed

# ── Tests ─────────────────────────────────────────────────────────────────────

test:
	docker compose exec app php artisan test --parallel

# make test-filter filter=RcmTest
test-filter:
	docker compose exec app php artisan test --filter=$(filter)

# make test-suite suite=Feature
test-suite:
	docker compose exec app php artisan test --testsuite=$(suite)

# ── Dependencies ──────────────────────────────────────────────────────────────

composer:
	docker compose exec app composer $(cmd)

composer-install:
	docker compose exec app composer install

npm:
	docker compose run --rm -it node npm $(cmd)

# ── First-time setup ─────────────────────────────────────────────────────────

# Run once after cloning: make setup
setup:
	cp .env.example .env
	docker compose up -d --build
	docker compose exec app composer install
	docker compose exec app php artisan key:generate
	docker compose exec app php artisan migrate --seed
	docker compose exec app php artisan passport:install --uuids
	@echo ""
	@echo "CyMed is ready at http://localhost"
	@echo "Mailpit:   http://localhost:8025"
	@echo "MinIO:     http://localhost:9001"
