package handlers

import (
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
}

func NewFriendHandler(svc services.FriendService, userRepo repository.UserRepo) *FriendHandler {
	return &FriendHandler{
		svc:      svc,
		userRepo: userRepo,
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

	var req models.AddFriendRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	if req.FriendID == 0 {
		http.Error(w, "friend_id is required", http.StatusBadRequest)
		return
	}

	if err := h.svc.AddFriend(r.Context(), userID, req.FriendID); err != nil {
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
		"friend_id": strconv.Itoa(req.FriendID),
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

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"user_id": userID,
		"friends": friends,
	})
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
