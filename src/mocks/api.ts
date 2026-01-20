
import axios from 'axios';
import { Habit, User, Comment } from './types';
import { API_CONFIG } from '../config/apiConfig';

// Создаем экземпляр axios с базовыми настройками
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехватчик для добавления токена авторизации
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Перехватчик для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен истек или недействителен, очищаем данные пользователя
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Аутентификация
  async login(email: string, password: string) {
    const response = await apiClient.post('/login', { email, password });
    return response.data;
  },

  async register(userData: { username: string; email: string; password: string; name?: string }) {
    const response = await apiClient.post('/register', userData);
    return response.data;
  },

  // Пользователь
  async getMe(): Promise<User> {
    const response = await apiClient.get('/me');
    return response.data;
  },

  // Привычки
  async getHabits(): Promise<Habit[]> {
    const response = await apiClient.get('/habits');
    return response.data;
  },

  async getHabit(id: number): Promise<Habit> {
    const response = await apiClient.get(`/habits/${id}`);
    return response.data;
  },

  async createHabit(habitData: { name: string; description?: string }) {
    const response = await apiClient.post('/habits', habitData);
    return response.data;
  },

  async toggleProgress(habitId: number, date: string, done: boolean) {
    const response = await apiClient.post('/habits/mark', {
      habit_id: habitId,
      date,
      done
    });
    return response.data;
  },

  async getHabitStats(id: number) {
    // Получаем статистику из эндпоинта привычки
    const response = await apiClient.get(`/habits/${id}`);
    const habit = response.data;

    return habit.stats;
  },

  async getHabitHistory(habitId: number) {
    const response = await apiClient.get(`/habits/${habitId}/history`);
    return response.data;
  },

  // Друзья
  async getFriends(): Promise<User[]> {
    const response = await apiClient.get('/friends');
    return response.data;
  },

  async addFriend(username: string) {
    const response = await apiClient.post('/friends', { username });
    return response.data;
  },

  async removeFriend(friendId: number) {
    const response = await apiClient.delete(`/friends/${friendId}`);
    return response.data;
  },

  // Получение привычек друга
  async getUserHabits(userId: number): Promise<Habit[]> {
    const response = await apiClient.get(`/users/${userId}/habits`);
    return response.data;
  },

  // Комментарии (если понадобится в будущем)
  async getComments(habitId: number): Promise<Comment[]> {
    const response = await apiClient.get(`/habits/${habitId}/comments`);
    return response.data;
  },

  async addComment(habitId: number, text: string): Promise<Comment> {
    const response = await apiClient.post(`/habits/${habitId}/comments`, { text });
    return response.data;
  },

  async deleteHabit(id: number) {
    const response = await apiClient.delete(`/habits/${id}`);
    return response.data;
  },

};

