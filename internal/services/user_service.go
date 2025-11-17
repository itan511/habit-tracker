package services

import (
	"context"
	"database/sql"
	"errors"
	"habit-tracker/internal/models"
	"habit-tracker/internal/repository"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
)

type UserService interface {
	Register(ctx context.Context, creds *models.UserCreds) (*models.UserResponse, error)
	Login(ctx context.Context, creds *models.UserCreds) (*models.UserResponse, error)
}

type userService struct {
	repo     repository.UserRepo
	jwtKey   []byte
	tokenTTL time.Duration
}

func NewUserService(r repository.UserRepo, jwtKey []byte) UserService {
	return &userService{
		repo:     r,
		jwtKey:   jwtKey,
		tokenTTL: time.Hour,
	}
}

func toPublic(u *models.User) models.PublicUser {
	return models.PublicUser{
		ID:       u.ID,
		Username: u.Username,
		Email:    u.Email,
	}
}

func (s *userService) generateToken(email string) (string, error) {
	if len(s.jwtKey) == 0 {
		return "", errors.New("jwt secret not configured")
	}
	exp := time.Now().Add(s.tokenTTL)
	claims := &models.Claims{
		Email: email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(exp),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtKey)
}

func (s *userService) Register(ctx context.Context, creds *models.UserCreds) (*models.UserResponse, error) {
	if creds == nil {
		return nil, errors.New("Invalid input")
	}
	creds.Username = strings.TrimSpace(creds.Username)
	creds.Email = strings.TrimSpace(creds.Email)
	if creds.Email == "" || creds.Password == "" {
		return nil, errors.New("Invalid input")
	}

	_, err := s.repo.GetByEmail(ctx, creds.Email)
	if err == nil {
		return nil, errors.New("User already exists")
	}
	if err != sql.ErrNoRows {
		return nil, err
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(creds.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	u := &models.User{
		Username: creds.Username,
		Email:    creds.Email,
		Password: string(hashed),
	}
	if err := s.repo.CreateUser(ctx, u); err != nil {
		return nil, err
	}

	token, err := s.generateToken(u.Email)
	if err != nil {
		return nil, err
	}

	return &models.UserResponse{
		User:  toPublic(u),
		Token: token,
	}, nil
}

func (s *userService) Login(ctx context.Context, creds *models.UserCreds) (*models.UserResponse, error) {
	if creds == nil || creds.Email == "" || creds.Password == "" {
		return nil, errors.New("Invalid input")
	}

	u, err := s.repo.GetByEmail(ctx, creds.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("Invalid credentials")
		}
		return nil, err
	}

	if err := bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(creds.Password)); err != nil {
		return nil, errors.New("Invalid credentials")
	}

	token, err := s.generateToken(u.Email)
	if err != nil {
		return nil, err
	}

	return &models.UserResponse{
		User:  toPublic(u),
		Token: token,
	}, nil
}
