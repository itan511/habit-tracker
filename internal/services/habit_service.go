package services

import (
	"context"
	"database/sql"
	"fmt"
	"habit-tracker/internal/models"
	"habit-tracker/internal/repository"
	"time"
)

type HabitService interface {
	Create(ctx context.Context, userID int, name, desc string) (*models.Habit, error)
	Delete(ctx context.Context, habitID int) error
	List(ctx context.Context, userID int) ([]models.Habit, error)
	Get(ctx context.Context, habitID int) (*models.Habit, error)
	MarkToday(ctx context.Context, habitID int, done bool) error
	History(ctx context.Context, habitID int) ([]models.HistoryPoint, error)
}

type habitService struct {
	db   *sql.DB
	repo repository.HabitRepo
}

func NewHabitService(db *sql.DB, r repository.HabitRepo) HabitService {
	return &habitService{
		db:   db,
		repo: r,
	}
}

func (s *habitService) Create(ctx context.Context, userID int, name, desc string) (*models.Habit, error) {
	id, err := s.repo.Create(ctx, userID, name, desc)
	if err != nil {
		return nil, err
	}

	habit := &models.Habit{
		ID:          id,
		Name:        name,
		Description: desc,
		UserID:      userID,
	}

	return habit, nil
}

func (s *habitService) Delete(ctx context.Context, habitID int) error {
	return s.repo.Delete(ctx, habitID)
}

func (s *habitService) List(ctx context.Context, userID int) ([]models.Habit, error) {
	rows, err := s.repo.GetAll(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get habits: %w", err)
	}
	defer rows.Close()

	var habits []models.Habit
	for rows.Next() {
		var h models.Habit
		err := rows.Scan(&h.ID, &h.Name, &h.Description, &h.UserID)
		if err != nil {
			return nil, fmt.Errorf("failed to scan habit: %w", err)
		}
		habits = append(habits, h)
	}
	return habits, nil
}

func (s *habitService) Get(ctx context.Context, habitID int) (*models.Habit, error) {
	row, err := s.repo.GetByID(ctx, habitID)
	if err != nil {
		return nil, fmt.Errorf("failed to get habit: %w", err)
	}

	var h models.Habit
	err = row.Scan(&h.ID, &h.Name, &h.Description, &h.UserID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("habit not found")
		}
		return nil, fmt.Errorf("failed to scan habit: %w", err)
	}

	history, err := s.History(ctx, habitID)
	if err != nil {
		// Just log the error, don't fail the whole operation
		// The habit can still be returned without history
		h.History = []models.HistoryPoint{}
	} else {
		h.History = history

		// Calculate stats
		h.Stats = calculateHabitStats(history)
	}

	return &h, nil
}

func (s *habitService) MarkToday(ctx context.Context, habitID int, done bool) error {
	return s.repo.AddHistory(ctx, habitID, time.Now(), done)
}

func (s *habitService) History(ctx context.Context, habitID int) ([]models.HistoryPoint, error) {
	rows, err := s.repo.GetHistory(ctx, habitID)
	if err != nil {
		return nil, fmt.Errorf("failed to get habit history: %w", err)
	}
	defer rows.Close()

	var history []models.HistoryPoint
	for rows.Next() {
		var h models.HistoryPoint
		err := rows.Scan(&h.Date, &h.Done)
		if err != nil {
			return nil, fmt.Errorf("failed to scan history point: %w", err)
		}
		history = append(history, h)
	}
	return history, nil
}

// calculateHabitStats calculates statistics for a habit based on its history
func calculateHabitStats(history []models.HistoryPoint) models.HabitStats {
	if len(history) == 0 {
		return models.HabitStats{
			Streak:         0,
			CompletionRate: 0,
		}
	}

	// Calculate streak (consecutive days with completed habits)
	streak := 0
	completed := 0
	total := len(history)

	// For simplicity, we'll calculate from the most recent entry backward
	for _, entry := range history {
		if entry.Done {
			streak++
			completed++
		} else {
			// If not done, reset streak counter
			streak = 0
		}
	}

	// Calculate completion rate
	var completionRate float64
	if total > 0 {
		completionRate = float64(completed) / float64(total) * 100
	}

	return models.HabitStats{
		Streak:         streak,
		CompletionRate: completionRate,
	}
}


