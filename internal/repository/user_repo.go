package repository

import (
	"context"
	"database/sql"
	"habit-tracker/internal/models"
)

type UserRepo interface {
	CreateUser(ctx context.Context, u *models.User) error
	GetByEmail(ctx context.Context, email string) (*models.User, error)
	GetByID(ctx context.Context, id int) (*models.User, error)
	UserExists(ctx context.Context, id int) (bool, error)
}

type postgresUserRepo struct {
	db *sql.DB
}

func NewUserRepo(db *sql.DB) UserRepo {
	return &postgresUserRepo{db: db}
}

func (r *postgresUserRepo) CreateUser(ctx context.Context, u *models.User) error {
	q := `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id`
	if err := r.db.QueryRowContext(ctx, q, u.Username, u.Email, u.Password).Scan(&u.ID); err != nil {
		return err
	}
	return nil
}

func (r *postgresUserRepo) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	var u models.User
	q := `SELECT id, username, email, password FROM users WHERE email = $1`
	if err := r.db.QueryRowContext(ctx, q, email).Scan(&u.ID, &u.Username, &u.Email, &u.Password); err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *postgresUserRepo) GetByID(ctx context.Context, id int) (*models.User, error) {
	var u models.User
	q := `SELECT id, username, email, password FROM users WHERE id = $1`
	if err := r.db.QueryRowContext(ctx, q, id).Scan(&u.ID, &u.Username, &u.Email, &u.Password); err != nil {
		return nil, err
	}
	return &u, nil
}

func (r *postgresUserRepo) UserExists(ctx context.Context, id int) (bool, error) {
	var exists bool
	err := r.db.QueryRowContext(ctx, "SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)", id).Scan(&exists)
	return exists, err
}
