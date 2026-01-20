package handlers

import (
	"encoding/json"
	"habit-tracker/internal/api/middleware"
	"habit-tracker/internal/models"
	"habit-tracker/internal/services"
	"net/http"
)

type UserHandler struct {
	Svc services.UserService
}

func NewUserHandler(s services.UserService) *UserHandler {
	return &UserHandler{Svc: s}
}

func (h *UserHandler) RegisterHandler(w http.ResponseWriter, r *http.Request) {
	var creds models.UserCreds
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "invalid request payload", http.StatusBadRequest)
		return
	}

	resp, err := h.Svc.Register(r.Context(), &creds)
	if err != nil {
		switch err.Error() {
		case "Invalid input":
			http.Error(w, err.Error(), http.StatusBadRequest)

		case "User already exists":
			http.Error(w, err.Error(), http.StatusConflict)

		default:
			http.Error(w, "internal server error", http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
}

func (h *UserHandler) LoginHandler(w http.ResponseWriter, r *http.Request) {
	var creds models.UserCreds
	if err := json.NewDecoder(r.Body).Decode(&creds); err != nil {
		http.Error(w, "invalid request payload", http.StatusBadRequest)
		return
	}

	resp, err := h.Svc.Login(r.Context(), &creds)
	if err != nil {
		switch err.Error() {

		case "Invalid input":
			http.Error(w, err.Error(), http.StatusBadRequest)

		case "Invalid credentials":
			http.Error(w, "invalid email or password", http.StatusUnauthorized)

		default:
			http.Error(w, "internal server error", http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(resp)
}

func (h *UserHandler) GetMeHandler(w http.ResponseWriter, r *http.Request) {
	email, ok := middleware.GetUserEmail(r.Context())
	if !ok {
		http.Error(w, "not authenticated", http.StatusUnauthorized)
		return
	}

	user, err := h.Svc.GetByEmail(r.Context(), email)
	if err != nil {
		http.Error(w, "user not found", http.StatusNotFound)
		return
	}

	response := models.PublicUser{
		ID:        user.ID,
		Username:  user.Username,
		Email:     user.Email,
		CreatedAt: user.CreatedAt,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
