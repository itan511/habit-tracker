package utils

import (
	"time"

	"github.com/golang-jwt/jwt/v4"
)

type JWTManager struct {
	SecretKey []byte
	TTL       time.Duration
}

func NewJWTManager(secret []byte, ttl time.Duration) *JWTManager {
	return &JWTManager{
		SecretKey: secret,
		TTL:       ttl,
	}
}

func (m *JWTManager) Generate(email string) (string, error) {
	claims := jwt.MapClaims{
		"email": email,
		"exp":   time.Now().Add(m.TTL).Unix(),
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString(m.SecretKey)
}

func (m *JWTManager) Parse(token string) (jwt.MapClaims, error) {
	parsed, err := jwt.Parse(token, func(t *jwt.Token) (interface{}, error) {
		return m.SecretKey, nil
	})
	if err != nil || !parsed.Valid {
		return nil, err
	}
	return parsed.Claims.(jwt.MapClaims), nil
}
