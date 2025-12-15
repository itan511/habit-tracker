package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"
)

const baseURL = "http://localhost:8080"

func main() {
	log.Println("Тестируем друзей API...")

	// Генерируем уникальные email
	timestamp := time.Now().Unix()
	email1 := fmt.Sprintf("test%d@test.com", timestamp)
	email2 := fmt.Sprintf("friend%d@test.com", timestamp+1)
	email3 := fmt.Sprintf("friend2%d@test.com", timestamp+2)

	// Храним информацию о пользователях
	users := make(map[int]string) // ID -> email

	// 1. Регистрация трех пользователей
	fmt.Println("1. Регистрируем пользователей...")

	user1 := registerUser("user1", email1, "pass123")
	users[user1.id] = user1.email
	fmt.Printf("   %s (ID: %d)\n", user1.email, user1.id)

	user2 := registerUser("user2", email2, "pass456")
	users[user2.id] = user2.email
	fmt.Printf("   %s (ID: %d)\n", user2.email, user2.id)

	user3 := registerUser("user3", email3, "pass789")
	users[user3.id] = user3.email
	fmt.Printf("   %s (ID: %d)\n", user3.email, user3.id)

	// 2. Логинимся за первого пользователя
	token1 := loginUser(email1, "pass123")

	// 3. Добавляем друзей
	fmt.Println("\n2. Добавляем друзей...")
	fmt.Printf("   %s (ID:%d) добавляет %s (ID:%d)\n", email1, user1.id, email2, user2.id)
	addFriend(token1, user2.id)

	fmt.Printf("   %s (ID:%d) добавляет %s (ID:%d)\n", email1, user1.id, email3, user3.id)
	addFriend(token1, user3.id)

	// 4. Получаем и выводим друзей первого пользователя
	fmt.Println("\n3. Список друзей:")
	friends1 := getFriends(token1, user1.id)
	fmt.Printf("   У %s (ID:%d) друзья:\n", email1, user1.id)
	for _, friendID := range friends1 {
		fmt.Printf("   - %s (ID:%d)\n", users[friendID], friendID)
	}

	// 5. Проверяем взаимность (второй пользователь)
	token2 := loginUser(email2, "pass456")
	friends2 := getFriends(token2, user2.id)
	fmt.Printf("\n   У %s (ID:%d) друзья:\n", email2, user2.id)
	for _, friendID := range friends2 {
		fmt.Printf("   - %s (ID:%d)\n", users[friendID], friendID)
	}

	// 6. Удаляем одного друга
	fmt.Println("\n4. Удаляем друга...")
	fmt.Printf("   Удаляем друга: %s (ID:%d) из друзей %s (ID:%d)\n",
		users[user2.id], user2.id, users[user1.id], user1.id)
	deleteFriend(token1, user2.id)

	// 7. Проверяем после удаления
	fmt.Println("\n5. Проверяем после удаления:")
	friendsAfter := getFriends(token1, user1.id)
	fmt.Printf("   У %s (ID:%d) остались друзья:\n", email1, user1.id)

	if len(friendsAfter) > 0 {
		for _, friendID := range friendsAfter {
			fmt.Printf("   - %s (ID:%d)\n", users[friendID], friendID)
		}
	} else {
		fmt.Printf("   Нет друзей\n")
	}

	// 8. ПРОВЕРКА ОШИБОК с выводом
	fmt.Println("\n6. ПРОВЕРКА ОШИБОК (ожидаем ошибки):")

	fmt.Println("\n   6.1 Попытка добавить самого себя...")
	status, message := addFriendWithResponse(token1, user1.id)
	if status == 400 {
		fmt.Printf("   Ожидаемая ошибка (статус %d): %s\n", status, message)
	} else {
		fmt.Printf("   Неожиданный статус: %d, сообщение: %s\n", status, message)
	}

	fmt.Println("\n   6.2 Попытка добавить уже существующего друга...")
	status, message = addFriendWithResponse(token1, user3.id)
	if status == 409 {
		fmt.Printf("   Ожидаемая ошибка (статус %d): %s\n", status, message)
	} else {
		fmt.Printf("   Неожиданный статус: %d, сообщение: %s\n", status, message)
	}

	fmt.Println("\n   6.3 Попытка добавить несуществующего пользователя...")
	status, message = addFriendWithResponse(token1, 99999)
	if status == 404 {
		fmt.Printf("   Ожидаемая ошибка (статус %d): %s\n", status, message)
	} else {
		fmt.Printf("   Неожиданный статус: %d, сообщение: %s\n", status, message)
	}

	// 9. Проверка запроса без токена
	fmt.Println("\n7. Проверка запроса без авторизации...")
	status, message = getWithoutToken("/api/friends")
	if status == 401 {
		fmt.Printf("   Ожидаемая ошибка (статус %d): %s\n", status, message)
	} else {
		fmt.Printf("   Неожиданный статус: %d\n", status)
	}

	// 10. Финальный health check
	fmt.Println("\n8. Финальный health check...")
	status, message = getWithoutToken("/health")
	if status == 200 {
		fmt.Printf("   Сервис работает (статус %d)\n", status)
	}

}

// Структура пользователя
type User struct {
	id    int
	email string
	token string
}

// Функции
func registerUser(username, email, password string) User {
	body, err := json.Marshal(map[string]string{
		"username": username,
		"email":    email,
		"password": password,
	})
	if err != nil {
		log.Fatalf("Ошибка маршалинга: %v", err)
	}

	resp, err := http.Post(baseURL+"/api/register", "application/json", bytes.NewBuffer(body))
	if err != nil {
		log.Fatalf("Ошибка регистрации: %v", err)
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		log.Fatalf("Ошибка декодирования ответа: %v", err)
	}

	userData := result["user"].(map[string]interface{})
	return User{
		id:    int(userData["id"].(float64)),
		email: userData["email"].(string),
		token: result["token"].(string),
	}
}

func loginUser(email, password string) string {
	body, err := json.Marshal(map[string]string{
		"email":    email,
		"password": password,
	})
	if err != nil {
		log.Fatalf("Ошибка маршалинга: %v", err)
	}

	resp, err := http.Post(baseURL+"/api/login", "application/json", bytes.NewBuffer(body))
	if err != nil {
		log.Fatalf("Ошибка логина: %v", err)
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		log.Fatalf("Ошибка декодирования ответа: %v", err)
	}

	token, ok := result["token"].(string)
	if !ok {
		log.Fatal("Токен не найден в ответе")
	}

	return token
}

func addFriend(token string, friendID int) {
	body, err := json.Marshal(map[string]interface{}{
		"friend_id": friendID,
	})
	if err != nil {
		log.Printf("Ошибка маршалинга: %v", err)
		return
	}

	req, err := http.NewRequest("POST", baseURL+"/api/friends", bytes.NewBuffer(body))
	if err != nil {
		log.Printf("Ошибка создания запроса: %v", err)
		return
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Ошибка выполнения запроса: %v", err)
		return
	}
	defer resp.Body.Close()
}

// Новая функция: добавляет друга и возвращает статус и сообщение
func addFriendWithResponse(token string, friendID int) (int, string) {
	body, err := json.Marshal(map[string]interface{}{
		"friend_id": friendID,
	})
	if err != nil {
		return 0, fmt.Sprintf("Ошибка маршалинга: %v", err)
	}

	req, err := http.NewRequest("POST", baseURL+"/api/friends", bytes.NewBuffer(body))
	if err != nil {
		return 0, fmt.Sprintf("Ошибка создания запроса: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return 0, err.Error()
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return resp.StatusCode, fmt.Sprintf("Ошибка чтения ответа: %v", err)
	}

	return resp.StatusCode, string(bodyBytes)
}

func getFriends(token string, userID int) []int {
	req, err := http.NewRequest("GET", baseURL+"/api/friends", nil)
	if err != nil {
		log.Printf("Ошибка создания запроса: %v", err)
		return []int{}
	}
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Ошибка получения друзей: %v", err)
		return []int{}
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		log.Printf("Ошибка декодирования ответа: %v", err)
		return []int{}
	}

	friends := []int{}
	if result["friends"] != nil {
		for _, f := range result["friends"].([]interface{}) {
			friends = append(friends, int(f.(float64)))
		}
	}
	return friends
}

func deleteFriend(token string, friendID int) {
	url := fmt.Sprintf("%s/api/friends/%d", baseURL, friendID)
	req, err := http.NewRequest("DELETE", url, nil)
	if err != nil {
		log.Printf("Ошибка создания запроса: %v", err)
		return
	}
	req.Header.Set("Authorization", "Bearer "+token)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Printf("Ошибка удаления друга: %v", err)
		return
	}
	defer resp.Body.Close()
}

// Запрос без токена
func getWithoutToken(path string) (int, string) {
	req, err := http.NewRequest("GET", baseURL+path, nil)
	if err != nil {
		return 0, fmt.Sprintf("Ошибка создания запроса: %v", err)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return 0, err.Error()
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return resp.StatusCode, fmt.Sprintf("Ошибка чтения ответа: %v", err)
	}

	return resp.StatusCode, string(bodyBytes)
}
