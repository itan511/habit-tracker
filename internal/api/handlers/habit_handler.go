package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"habit-tracker/internal/api/middleware"
	"habit-tracker/internal/repository"
	"habit-tracker/internal/services"
	"net/http"
	"strconv"
)

type HabitHandler struct {
	Svc      services.HabitService
	UserRepo repository.UserRepo
	FriendSvc services.FriendService
}

func NewHabitHandler(s services.HabitService, userRepo repository.UserRepo, friendSvc services.FriendService) *HabitHandler {
	return &HabitHandler{
		Svc:       s,
		UserRepo:  userRepo,
		FriendSvc: friendSvc,
	}
}

func (h *HabitHandler) getCurrentUserID(r *http.Request) (int, error) {
	email, ok := middleware.GetUserEmail(r.Context())
	if !ok {
		return 0, errors.New("not authenticated")
	}

	user, err := h.UserRepo.GetByEmail(r.Context(), email)
	if err != nil {
		return 0, errors.New("user not found")
	}

	return user.ID, nil
}

// isFriend checks if two users are friends
func (h *HabitHandler) isFriend(ctx context.Context, userID, otherID int) (bool, error) {
	return h.FriendSvc.IsFriend(ctx, userID, otherID)
}

func (h *HabitHandler) Create(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getCurrentUserID(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	habit, err := h.Svc.Create(r.Context(), userID, req.Name, req.Description)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(habit)
}

func (h *HabitHandler) List(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getCurrentUserID(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Check if we're getting habits for the current user or for a different user
	requestedUserIDStr := r.PathValue("id") // Expecting /api/users/{id}/habits
	var requestedUserID int

	if requestedUserIDStr != "" {
		requestedUserID, err = strconv.Atoi(requestedUserIDStr)
		if err != nil {
			http.Error(w, "invalid user id", http.StatusBadRequest)
			return
		}

		// If requesting another user's habits, verify friendship
		if requestedUserID != userID {
			// Check if users are friends before allowing access to habits
			isFriend, err := h.isFriend(r.Context(), userID, requestedUserID)
			if err != nil {
				http.Error(w, "failed to check friendship", http.StatusInternalServerError)
				return
			}

			if !isFriend {
				http.Error(w, "access denied: you can only view habits of your friends", http.StatusForbidden)
				return
			}
		}
	} else {
		// Default to current user's habits
		requestedUserID = userID
	}

	habits, err := h.Svc.List(r.Context(), requestedUserID)
	if err != nil {
		http.Error(w, "failed to get habits", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(habits)
}

func (h *HabitHandler) Get(w http.ResponseWriter, r *http.Request) {
	habitIDStr := r.PathValue("id")
	habitID, err := strconv.Atoi(habitIDStr)
	if err != nil {
		http.Error(w, "invalid habit id", http.StatusBadRequest)
		return
	}

	habit, err := h.Svc.Get(r.Context(), habitID)
	if err != nil {
		http.Error(w, "habit not found", http.StatusNotFound)
		return
	}

	// Verify that the current user owns this habit
	userID, err := h.getCurrentUserID(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	if habit.UserID != userID {
		http.Error(w, "access denied: you don't own this habit", http.StatusForbidden)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(habit)
}

func (h *HabitHandler) MarkToday(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getCurrentUserID(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	var req struct {
		HabitID int  `json:"habit_id"`
		Done    bool `json:"done"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	// Verify that the habit belongs to the current user
	habit, err := h.Svc.Get(r.Context(), req.HabitID)
	if err != nil {
		http.Error(w, "habit not found", http.StatusNotFound)
		return
	}

	if habit.UserID != userID {
		http.Error(w, "access denied: you don't own this habit", http.StatusForbidden)
		return
	}

	if err := h.Svc.MarkToday(r.Context(), req.HabitID, req.Done); err != nil {
		http.Error(w, "failed to update habit progress", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "success"})
}

func (h *HabitHandler) History(w http.ResponseWriter, r *http.Request) {
	habitIDStr := r.PathValue("id")
	habitID, err := strconv.Atoi(habitIDStr)
	if err != nil {
		http.Error(w, "invalid habit id", http.StatusBadRequest)
		return
	}

	userID, err := h.getCurrentUserID(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Verify that the habit belongs to the current user
	habit, err := h.Svc.Get(r.Context(), habitID)
	if err != nil {
		http.Error(w, "habit not found", http.StatusNotFound)
		return
	}

	if habit.UserID != userID {
		http.Error(w, "access denied: you don't own this habit", http.StatusForbidden)
		return
	}

	history, err := h.Svc.History(r.Context(), habitID)
	if err != nil {
		http.Error(w, "failed to get habit history", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(history)
}

func (h *HabitHandler) Delete(w http.ResponseWriter, r *http.Request) {
	habitIDStr := r.PathValue("id")
	habitID, err := strconv.Atoi(habitIDStr)
	if err != nil {
		http.Error(w, "invalid habit id", http.StatusBadRequest)
		return
	}

	userID, err := h.getCurrentUserID(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Verify that the habit belongs to the current user
	habit, err := h.Svc.Get(r.Context(), habitID)
	if err != nil {
		http.Error(w, "habit not found", http.StatusNotFound)
		return
	}

	if habit.UserID != userID {
		http.Error(w, "access denied: you don't own this habit", http.StatusForbidden)
		return
	}

	if err := h.Svc.Delete(r.Context(), habitID); err != nil {
		http.Error(w, "failed to delete habit", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "habit deleted"})
}
