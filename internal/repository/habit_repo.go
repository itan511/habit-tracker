package repository

import (
	"context"
	"database/sql"
	"time"
)

type HabitRepo interface {
	Create(ctx context.Context, userID int, name, desc string) (int, error)
	Delete(ctx context.Context, habitID int) error
	GetAll(ctx context.Context, userID int) (*sql.Rows, error)
	GetByID(ctx context.Context, habitID int) (*sql.Row, error)
	AddHistory(ctx context.Context, habitID int, date time.Time, done bool) error
	GetHistory(ctx context.Context, habitID int) (*sql.Rows, error)
}

type postgresHabitRepo struct {
	db *sql.DB
}

func NewHabitRepo(db *sql.DB) HabitRepo {
	return &postgresHabitRepo{db: db}
}

func (r *postgresHabitRepo) Create(ctx context.Context, userID int, name, desc string) (int, error) {
	var id int
	err := r.db.QueryRowContext(ctx,
		`INSERT INTO habits (user_id, name, description)
		 VALUES ($1, $2, $3) RETURNING id`,
		userID, name, desc,
	).Scan(&id)
	return id, err
}

func (r *postgresHabitRepo) Delete(ctx context.Context, habitID int) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM habits WHERE id=$1`, habitID)
	return err
}

func (r *postgresHabitRepo) GetAll(ctx context.Context, userID int) (*sql.Rows, error) {
	return r.db.QueryContext(ctx,
		`SELECT id, name, description, user_id FROM habits WHERE user_id=$1`,
		userID,
	)
}

func (r *postgresHabitRepo) GetByID(ctx context.Context, habitID int) (*sql.Row, error) {
	return r.db.QueryRowContext(ctx,
		`SELECT id, name, description, user_id FROM habits WHERE id=$1`,
		habitID,
	), nil
}

func (r *postgresHabitRepo) AddHistory(ctx context.Context, habitID int, date time.Time, done bool) error {
	_, err := r.db.ExecContext(ctx,
		`INSERT INTO habit_history (habit_id, date, done)
		 VALUES ($1, $2, $3)
		 ON CONFLICT (habit_id, date)
		 DO UPDATE SET done = $3`,
		habitID, date, done,
	)
	return err
}

func (r *postgresHabitRepo) GetHistory(ctx context.Context, habitID int) (*sql.Rows, error) {
	return r.db.QueryContext(ctx,
		`SELECT date, done FROM habit_history
		 WHERE habit_id=$1 ORDER BY date`,
		habitID,
	)
}

