package api

import (
	"net/http"

	"habit-tracker/internal/api/handlers"
)

// Router handles all route registrations
type Router struct {
	userHandler    *handlers.UserHandler
	friendHandler  *handlers.FriendHandler
	habitHandler   *handlers.HabitHandler
	authMiddleware func(http.Handler) http.Handler
}

// NewRouter creates a new router instance
func NewRouter(
	userHandler *handlers.UserHandler,
	friendHandler *handlers.FriendHandler,
	habitHandler *handlers.HabitHandler,
	authMiddleware func(http.Handler) http.Handler,
) *Router {
	return &Router{
		userHandler:    userHandler,
		friendHandler:  friendHandler,
		habitHandler:   habitHandler,
		authMiddleware: authMiddleware,
	}
}

// SetupRoutes configures all routes for the application
func (r *Router) SetupRoutes(mux *http.ServeMux) {
	// Public endpoints
	mux.HandleFunc("POST /api/register", r.userHandler.RegisterHandler)
	mux.HandleFunc("POST /api/login", r.userHandler.LoginHandler)

	// Protected endpoints (require JWT authentication)
	protectedMux := http.NewServeMux()

	// User endpoints
	protectedMux.HandleFunc("GET /api/me", r.userHandler.GetMeHandler)

	// Friend endpoints
	protectedMux.Handle("POST /api/friends", http.HandlerFunc(r.friendHandler.AddFriendHandler))
	protectedMux.Handle("GET /api/friends", http.HandlerFunc(r.friendHandler.GetFriendsHandler))
	protectedMux.Handle("DELETE /api/friends/{id}", http.HandlerFunc(r.friendHandler.RemoveFriendHandler))

	// Habit endpoints
	protectedMux.Handle("GET /api/habits", http.HandlerFunc(r.habitHandler.List))
	protectedMux.Handle("POST /api/habits", http.HandlerFunc(r.habitHandler.Create))
	protectedMux.Handle("GET /api/habits/{id}", http.HandlerFunc(r.habitHandler.Get))
	protectedMux.Handle("POST /api/habits/mark", http.HandlerFunc(r.habitHandler.MarkToday))
	protectedMux.Handle("GET /api/habits/{id}/history", http.HandlerFunc(r.habitHandler.History))
	protectedMux.Handle("DELETE /api/habits/{id}", http.HandlerFunc(r.habitHandler.Delete))

	// User habits endpoints
	protectedMux.Handle("GET /api/users/{id}/habits", http.HandlerFunc(r.habitHandler.List))

	// Apply authentication middleware to all protected routes
	mux.Handle("/api/", r.authMiddleware(protectedMux))

	// Health check endpoint
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok","service":"habit-tracker"}`))
	})
}