package repository

import (
	"context"
	"database/sql"
	"errors"
)

type FriendRepo interface {
	AddFriend(ctx context.Context, userID, friendID int) error
	GetFriends(ctx context.Context, userID int) ([]int, error)
	RemoveFriend(ctx context.Context, userID, friendID int) error
}

type friendRepo struct {
	db *sql.DB
}

func NewFriendRepo(db *sql.DB) FriendRepo {
	return &friendRepo{db: db}
}

func (r *friendRepo) AddFriend(ctx context.Context, userID, friendID int) error {
	if userID == friendID {
		return errors.New("cannot add yourself")
	}

	// Проверяем, существует ли пользователь
	var exists bool
	err := r.db.QueryRowContext(ctx,
		"SELECT EXISTS(SELECT 1 FROM users WHERE id = $1)", friendID).Scan(&exists)
	if err != nil {
		return err
	}
	if !exists {
		return errors.New("user not found")
	}

	// Проверяем, не добавлен ли уже пользователь как друг (в любом направлении)
	var alreadyFriends bool
	err = r.db.QueryRowContext(ctx,
		"SELECT EXISTS(SELECT 1 FROM friends WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1))",
		userID, friendID).Scan(&alreadyFriends)
	if err != nil {
		return err
	}
	if alreadyFriends {
		return errors.New("already friends")
	}

	// Добавляем связь дружбы в обе стороны для симметричного доступа
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	// Пользователь A добавляет пользователя B
	_, err = tx.ExecContext(ctx, "INSERT INTO friends (user_id, friend_id) VALUES ($1, $2)", userID, friendID)
	if err != nil {
		return err
	}

	// Для симметрии добавляем обратную запись: B "имеет" A как друга
	_, err = tx.ExecContext(ctx, "INSERT INTO friends (user_id, friend_id) VALUES ($1, $2)", friendID, userID)
	if err != nil {
		return err
	}

	return tx.Commit()
}

func (r *friendRepo) GetFriends(ctx context.Context, userID int) ([]int, error) {
	rows, err := r.db.QueryContext(ctx,
		"SELECT friend_id FROM friends WHERE user_id = $1", userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var friends []int
	for rows.Next() {
		var friendID int
		if err := rows.Scan(&friendID); err != nil {
			return nil, err
		}
		friends = append(friends, friendID)
	}

	return friends, nil
}

func (r *friendRepo) RemoveFriend(ctx context.Context, userID, friendID int) error {
	_, err := r.db.ExecContext(ctx,
		"DELETE FROM friends WHERE (user_id = $1 AND friend_id = $2) OR (user_id = $2 AND friend_id = $1)",
		userID, friendID)
	return err
}
