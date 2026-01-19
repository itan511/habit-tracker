package services

import (
	"context"
	"habit-tracker/internal/repository"
)

type FriendService interface {
	AddFriend(ctx context.Context, userID, friendID int) error
	GetFriends(ctx context.Context, userID int) ([]int, error)
	RemoveFriend(ctx context.Context, userID, friendID int) error
}

type friendService struct {
	repo repository.FriendRepo
}

func NewFriendService(repo repository.FriendRepo) FriendService {
	return &friendService{repo: repo}
}

func (s *friendService) AddFriend(ctx context.Context, userID, friendID int) error {
	return s.repo.AddFriend(ctx, userID, friendID)
}

func (s *friendService) GetFriends(ctx context.Context, userID int) ([]int, error) {
	return s.repo.GetFriends(ctx, userID)
}

func (s *friendService) RemoveFriend(ctx context.Context, userID, friendID int) error {
	return s.repo.RemoveFriend(ctx, userID, friendID)
}

func (s *friendService) IsFriend(ctx context.Context, userID, otherID int) (bool, error) {
	friends, err := s.repo.GetFriends(ctx, userID)
	if err != nil {
		return false, err
	}

	for _, f := range friends {
		if f == otherID {
			return true, nil
		}
	}
	return false, nil
}
