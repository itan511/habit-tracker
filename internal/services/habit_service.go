package services

import (
	"context"
	"errors"
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
	repo          repository.HabitRepo
	friendService friendService
}

func NewHabitService(r repository.HabitRepo) HabitService {
	return &habitService{repo: r}
}

func (s *habitService) Create(ctx context.Context, userID int, name, desc string) (*models.Habit, error) {
	id, err := s.repo.Create(ctx, userID, name, desc)
	if err != nil {
		return nil, err
	}
	return &models.Habit{ID: id, Name: name, Description: desc}, nil
}

func (s *habitService) Delete(ctx context.Context, habitID int) error {
	return s.repo.Delete(ctx, habitID)
}

func (s *habitService) List(ctx context.Context, userID int) ([]models.Habit, error) {
	rows, err := s.repo.GetAll(ctx, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var habits []models.Habit
	for rows.Next() {
		var h models.Habit
		rows.Scan(&h.ID, &h.Name, &h.Description)
		habits = append(habits, h)
	}
	return habits, nil
}

func (s *habitService) Get(ctx context.Context, habitID int) (*models.Habit, error) {
	row, _ := s.repo.GetByID(ctx, habitID)
	var h models.Habit
	if err := row.Scan(&h.ID, &h.Name, &h.Description); err != nil {
		return nil, err
	}
	history, _ := s.History(ctx, habitID)
	h.History = history
	return &h, nil
}

func (s *habitService) MarkToday(ctx context.Context, habitID int, done bool) error {
	return s.repo.AddHistory(ctx, habitID, time.Now(), done)
}

func (s *habitService) History(ctx context.Context, habitID int) ([]models.HistoryPoint, error) {
	rows, err := s.repo.GetHistory(ctx, habitID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []models.HistoryPoint
	for rows.Next() {
		var h models.HistoryPoint
		rows.Scan(&h.Date, &h.Done)
		history = append(history, h)
	}
	return history, nil
}

func (s *habitService) AddComment(ctx context.Context, habitID, userID int, text string) error {
	row, err := s.repo.GetByID(ctx, habitID)
	if err != nil {
		return err
	}
	var h models.Habit
	if err := row.Scan(&h.ID, &h.Name, &h.Description); err != nil {
		return nil
	}

	// владелец может всегда
	if h.UserID != userID {
		// проверяем через friend_service
		isFriend, err := s.friendService.IsFriend(ctx, h.UserID, userID)
		if err != nil || !isFriend {
			return errors.New("no access")
		}
	}

	// сохраняем комментарий прямо в habit_repo
	return s.repo.AddComment(ctx, &models.Comment{
		HabitID: habitID,
		UserID:  userID,
		Text:    text,
	})
}
