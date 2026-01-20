package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"habit-tracker/internal/api/middleware"
	"habit-tracker/internal/models"
	"habit-tracker/internal/repository"
	"habit-tracker/internal/services"
	"net/http"
	"strconv"
)

type FriendHandler struct {
	svc      services.FriendService
	userRepo repository.UserRepo
	db       *sql.DB
}

func NewFriendHandler(svc services.FriendService, userRepo repository.UserRepo, db *sql.DB) *FriendHandler {
	return &FriendHandler{
		svc:      svc,
		userRepo: userRepo,
		db:       db,
	}
}

func (h *FriendHandler) getCurrentUserID(r *http.Request) (int, error) {
	email, ok := middleware.GetUserEmail(r.Context())
	if !ok {
		return 0, errors.New("not authenticated")
	}

	user, err := h.userRepo.GetByEmail(r.Context(), email)
	if err != nil {
		return 0, errors.New("user not found")
	}

	return user.ID, nil
}

func (h *FriendHandler) AddFriendHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getCurrentUserID(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	// Структура для запроса может содержать либо username, либо friend_id
	var req map[string]interface{}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	var friendID int
	if friendIDVal, ok := req["friend_id"]; ok {
		// Если передан friend_id как число
		if idFloat, ok := friendIDVal.(float64); ok {
			friendID = int(idFloat)
		} else if idStr, ok := friendIDVal.(string); ok {
			friendID, err = strconv.Atoi(idStr)
			if err != nil {
				http.Error(w, "invalid friend_id format", http.StatusBadRequest)
				return
			}
		}
	} else if usernameVal, ok := req["username"]; ok {
		// Если передан username, находим пользователя по нему
		username, ok := usernameVal.(string)
		if !ok {
			http.Error(w, "username must be a string", http.StatusBadRequest)
			return
		}

		friendUser, err := h.userRepo.GetByUsername(r.Context(), username)
		if err != nil {
			http.Error(w, "user not found", http.StatusNotFound)
			return
		}
		friendID = friendUser.ID
	} else {
		http.Error(w, "either friend_id or username is required", http.StatusBadRequest)
		return
	}

	if friendID == 0 {
		http.Error(w, "friend_id is required", http.StatusBadRequest)
		return
	}

	if userID == friendID {
		http.Error(w, "cannot add yourself", http.StatusBadRequest)
		return
	}

	if err := h.svc.AddFriend(r.Context(), userID, friendID); err != nil {
		switch err.Error() {
		case "user not found":
			http.Error(w, "user not found", http.StatusNotFound)
		case "cannot add yourself":
			http.Error(w, "cannot add yourself", http.StatusBadRequest)
		case "already friends":
			http.Error(w, "already friends", http.StatusConflict)
		default:
			http.Error(w, "failed to add friend", http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]string{
		"status":    "friend added",
		"user_id":   strconv.Itoa(userID),
		"friend_id": strconv.Itoa(friendID),
	})
}

func (h *FriendHandler) GetFriendsHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getCurrentUserID(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	friends, err := h.svc.GetFriends(r.Context(), userID)
	if err != nil {
		http.Error(w, "internal server error", http.StatusInternalServerError)
		return
	}

	// Get detailed user information for each friend
	friendDetails := make([]models.User, 0, len(friends))
	for _, friendID := range friends {
		friend, err := h.userRepo.GetByID(r.Context(), friendID)
		if err != nil {
			continue // Skip if we can't get friend details
		}
		friendDetails = append(friendDetails, *friend)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(friendDetails)
}

func (h *FriendHandler) RemoveFriendHandler(w http.ResponseWriter, r *http.Request) {
	userID, err := h.getCurrentUserID(r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusUnauthorized)
		return
	}

	friendIDStr := r.PathValue("id")
	friendID, err := strconv.Atoi(friendIDStr)
	if err != nil {
		http.Error(w, "invalid friend id", http.StatusBadRequest)
		return
	}

	if err := h.svc.RemoveFriend(r.Context(), userID, friendID); err != nil {
		http.Error(w, "failed to remove friend", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "friend removed",
	})
}
