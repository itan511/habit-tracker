package models

type HistoryPoint struct {
	Date string `json:"date"`
	Done bool   `json:"done"`
}

type HabitStats struct {
	Streak         int     `json:"streak"`
	CompletionRate float64 `json:"completion_rate"`
}

type Habit struct {
	ID          int            `json:"id"`
	Name        string         `json:"name"`
	Description string         `json:"description,omitempty"`
	Stats       HabitStats     `json:"stats"`
	History     []HistoryPoint `json:"history"`
}
