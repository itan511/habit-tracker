package handlers

import (
	"encoding/json"
	"habit-tracker/internal/services"
	"net/http"
	"strconv"
)

type HabitHandler struct {
	Svc services.HabitService
}

func NewHabitHandler(s services.HabitService) *HabitHandler {
	return &HabitHandler{Svc: s}
}

func (h *HabitHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req struct {
		UserID      int    `json:"user_id"`
		Name        string `json:"name"`
		Description string `json:"description"`
	}
	json.NewDecoder(r.Body).Decode(&req)

	habit, err := h.Svc.Create(r.Context(), req.UserID, req.Name, req.Description)
	if err != nil {
		http.Error(w, err.Error(), 400)
		return
	}
	json.NewEncoder(w).Encode(habit)
}

func (h *HabitHandler) List(w http.ResponseWriter, r *http.Request) {
	userID, _ := strconv.Atoi(r.URL.Query().Get("user_id"))
	habits, _ := h.Svc.List(r.Context(), userID)
	json.NewEncoder(w).Encode(habits)
}

func (h *HabitHandler) Get(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(r.URL.Query().Get("id"))
	habit, err := h.Svc.Get(r.Context(), id)
	if err != nil {
		http.Error(w, "not found", 404)
		return
	}
	json.NewEncoder(w).Encode(habit)
}

func (h *HabitHandler) MarkToday(w http.ResponseWriter, r *http.Request) {
	var req struct {
		HabitID int  `json:"habit_id"`
		Done    bool `json:"done"`
	}
	json.NewDecoder(r.Body).Decode(&req)
	h.Svc.MarkToday(r.Context(), req.HabitID, req.Done)
	w.WriteHeader(http.StatusOK)
}

func (h *HabitHandler) History(w http.ResponseWriter, r *http.Request) {
	id, _ := strconv.Atoi(r.URL.Query().Get("habit_id"))
	history, _ := h.Svc.History(r.Context(), id)
	json.NewEncoder(w).Encode(history)
}
