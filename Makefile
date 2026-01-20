# Makefile для управления приложением Habit Tracker

.PHONY: build build-backend build-frontend run run-backend run-frontend run-docker stop-docker clean help

# Значения по умолчанию
DOCKER_COMPOSE_FILE = docker-compose.yml

help:
	@echo "Доступные команды:"
	@echo "  build             - Собрать все части приложения"
	@echo "  build-backend     - Собрать только бэкенд"
	@echo "  build-frontend    - Собрать только фронтенд"
	@echo "  run               - Запустить все сервисы в Docker"
	@echo "  run-backend       - Запустить только бэкенд"
	@echo "  run-frontend      - Запустить только фронтенд"
	@echo "  run-docker        - Запустить все в Docker"
	@echo "  stop-docker       - Остановить все Docker-контейнеры"
	@echo "  clean             - Удалить собранные артефакты"
	@echo ""
	@echo "Пример использования:"
	@echo "  make run-docker   - Запуск всего приложения в Docker"

build: build-backend build-frontend

build-backend:
	@echo "Сборка бэкенда..."
	go build -o bin/server ./cmd/server/main.go
	@echo "Бэкенд успешно собран!"

build-frontend:
	@echo "Установка зависимостей фронтенда..."
	npm install
	@echo "Сборка фронтенда..."
	npm run build
	@echo "Фронтенд успешно собран!"

run: run-docker

run-backend:
	@echo "Запуск бэкенда..."
	DB_HOST=localhost DB_PORT=5432 DB_USER=postgres DB_PASSWORD=secretpassword DB_NAME=habit_tracker JWT_SECRET=your_super_secret_jwt_key_change_this_in_production SERVER_PORT=8080 go run cmd/server/main.go

run-frontend:
	@echo "Запуск фронтенда..."
	cd src && npm run dev

run-docker:
	@echo "Запуск приложения в Docker..."
	docker-compose -f $(DOCKER_COMPOSE_FILE) up --build -d
	@echo "Приложение запущено в Docker. Откройте http://localhost в браузере."

stop-docker:
	@echo "Остановка Docker-контейнеров..."
	docker-compose -f $(DOCKER_COMPOSE_FILE) down
	@echo "Контейнеры остановлены."

clean:
	@echo "Очистка собранных артефактов..."
	rm -f bin/server
	rm -rf dist/
	@echo "Очистка завершена."