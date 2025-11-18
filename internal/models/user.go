package models

import (
	"time"

	"github.com/golang-jwt/jwt/v4"
)

type User struct {
	ID        int       `json:"id"`
	Username  string    `json:"username,omitempty"`
	Email     string    `json:"email"`
	Password  string    `json:"-"`
	CreatedAt time.Time `json:"created_at,omitempty"`
}

type UserCreds struct {
	Username string `json:"username,omitempty"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type PublicUser struct {
	ID        int       `json:"id"`
	Username  string    `json:"username,omitempty"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at,omitempty"`
}

type UserResponse struct {
	User  PublicUser `json:"user"`
	Token string     `json:"token"`
}

type Claims struct {
	Email string `json:"email"`
	jwt.RegisteredClaims
}
