include .env
.DEFAULT_GOAL := help

.PHONY: run
run:
	npm run dev

.PHONY: gen
gen:
	npx prisma generate

.PHONY: migrate
migrate:
	npx prisma migrate dev -n init

.PHONY: reset
reset:
	npx prisma migrate reset

.PHONY: deploy
deploy:
	npx prisma migrate deploy

.PHONY: studio
studio:
	npx prisma studio

.PHONY: clean
clean:
	rm -rf prisma/migrations node_modules/.prisma generated/prisma

.PHONY: rebuild
rebuild: clean reset gen migrate

.PHONY: export-db
export-db:
	bash ./scripts/export_db.sh ${PRISMA_DATABASE_URL} "exports"

.PHONY: format
format:
	npm run format

.PHONY: help
help:
	@echo "Available commands:"
	@echo "gen        Generate Prisma Client"
	@echo "migrate    Apply local migrations"
	@echo "reset      Reset local database"
	@echo "deploy     Deploy migrations to production"
	@echo "studio     Open Prisma Studio"
	@echo "clean      Clean Prisma directories (migrations, generated)"
	@echo "rebuild    Clean, generate Prisma Client, and apply migrations"
	@echo "export_db  Export Prisma database"
	@echo "format	  Format files using Prettier"
