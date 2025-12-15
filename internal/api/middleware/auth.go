package middleware

import (
	"context"
	"habit-tracker/internal/utils"
	"net/http"
	"strings"
)

type ctxKey string

const (
	CtxUserEmail ctxKey = "userEmail"
)

func NewAuthMiddleware(jwtManager *utils.JWTManager) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			auth := r.Header.Get("Authorization")
			if auth == "" {
				http.Error(w, "authorization header required", http.StatusUnauthorized)
				return
			}

			parts := strings.SplitN(auth, " ", 2)
			if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
				http.Error(w, "invalid authorization header", http.StatusUnauthorized)
				return
			}
			tokenString := parts[1]

			claims, err := jwtManager.Parse(tokenString)
			if err != nil {
				http.Error(w, "invalid token", http.StatusUnauthorized)
				return
			}

			email, ok := claims["email"].(string)
			if !ok || strings.TrimSpace(email) == "" {
				http.Error(w, "token missing email claim", http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), CtxUserEmail, email)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func GetUserEmail(ctx context.Context) (string, bool) {
	email, ok := ctx.Value(CtxUserEmail).(string)
	return email, ok
}
