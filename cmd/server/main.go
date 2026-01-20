package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"habit-tracker/internal/api"
	"habit-tracker/internal/api/handlers"
	"habit-tracker/internal/api/middleware"
	"habit-tracker/internal/repository"
	"habit-tracker/internal/services"
	"habit-tracker/internal/utils"

	_ "github.com/lib/pq"
)

func main() {
	dbHost := mustGetEnv("DB_HOST")
	dbPort := mustGetEnv("DB_PORT")
	dbUser := mustGetEnv("DB_USER")
	dbPassword := mustGetEnv("DB_PASSWORD")
	dbName := mustGetEnv("DB_NAME")
	jwtSecret := mustGetEnv("JWT_SECRET")
	serverPort := getEnv("SERVER_PORT", "8080")

	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		dbHost, dbPort, dbUser, dbPassword, dbName)

	log.Println("Подключаюсь к базе данных...")
	db, err := sql.Open("postgres", connStr)
	if err != nil {
		log.Fatal("Ошибка при открытии соединения с БД:", err)
	}
	defer db.Close()

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := db.PingContext(ctx); err != nil {
		log.Fatal("Не удалось подключиться к БД. Проверьте параметры:", err)
	}
	log.Println("Успешное подключение к базе данных.")

	// Инициализация репозиториев
	userRepo := repository.NewUserRepo(db)
	friendRepo := repository.NewFriendRepo(db)
	habitRepo := repository.NewHabitRepo(db) // Assuming there's a habit repository
	log.Println("Репозитории инициализированы.")

	// Инициализация JWT менеджера и middleware
	jwtManager := utils.NewJWTManager([]byte(jwtSecret), time.Hour*24)
	authMiddleware := middleware.NewAuthMiddleware(jwtManager)

	// Инициализация сервисов
	userService := services.NewUserService(userRepo, []byte(jwtSecret))
	friendService := services.NewFriendService(friendRepo)
	habitService := services.NewHabitService(db, habitRepo)
	log.Println("Сервисы инициализированы.")

	// Инициализация обработчиков
	userHandler := handlers.NewUserHandler(userService)
	friendHandler := handlers.NewFriendHandler(friendService, userRepo, db)
	habitHandler := handlers.NewHabitHandler(habitService, userRepo, friendService)
	log.Println("HTTP-обработчики инициализированы.")

	// Создаем роутер и настраиваем маршруты
	router := api.NewRouter(userHandler, friendHandler, habitHandler, authMiddleware)
	mux := http.NewServeMux()
	router.SetupRoutes(mux)

	server := &http.Server{
		Addr:         ":" + serverPort,
		Handler:      mux,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  30 * time.Second,
	}

	serverCtx, serverStopCtx := context.WithCancel(context.Background())
	sig := make(chan os.Signal, 1)
	signal.Notify(sig, syscall.SIGHUP, syscall.SIGINT, syscall.SIGTERM, syscall.SIGQUIT)

	go func() {
		<-sig
		log.Println("Получен сигнал остановки")

		shutdownCtx, cancel := context.WithTimeout(serverCtx, 30*time.Second)
		defer cancel()

		go func() {
			<-shutdownCtx.Done()
			if shutdownCtx.Err() == context.DeadlineExceeded {
				log.Fatal("Принудительное завершение: таймаут graceful shutdown.")
			}
		}()

		if err := server.Shutdown(shutdownCtx); err != nil {
			log.Fatal("Ошибка при остановке сервера:", err)
		}
		serverStopCtx()
	}()

	log.Printf("Сервер запускается на порту %s...", serverPort)
	log.Println("Сервер успешно запущен с использованием централизованного роутинга.")
	log.Println("==========================================")

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal("Ошибка сервера:", err)
	}

	<-serverCtx.Done()
	log.Println("Сервер корректно остановлен.")
}

func mustGetEnv(key string) string {
	value := os.Getenv(key)
	if value == "" {
		log.Fatalf("ОШИБКА КОНФИГУРАЦИИ: переменная окружения '%s' не задана.\n"+
			"Убедитесь, что она указана в docker-compose.yml в сервисе 'app'.", key)
	}
	return value
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
