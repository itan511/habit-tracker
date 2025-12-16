package models

import "time"

type Comment struct {
	ID        int
	HabitID   int
	UserID    int
	Text      string
	CreatedAt time.Time
}
