
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
    // Используем тот же эндпоинт, что и для истории, но возвращаем только статистику
    const response = await apiClient.get(`/habits/${id}/history`);
    const history = response.data;

    // Вычисляем статистику из истории
    const streak = calculateStreak(history);
    const completionRate = calculateCompletionRate(history);

    return { streak, completion_rate: completionRate };
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

  async createCompetitionHabit(habitName: string, description: string | undefined, competitionId: number): Promise<Habit> {
    // Для соревновательных привычек пока используем тот же эндпоинт
    const response = await apiClient.post('/habits', {
      name: habitName,
      description,
      competition_id: competitionId
    });
    return response.data;
  },
};

// Вспомогательные функции для вычисления статистики
function calculateStreak(history: { date: string; done: boolean }[]): number {
  if (!history || history.length === 0) return 0;

  // Сортируем по дате в порядке убывания (сначала самые новые)
  const sortedHistory = [...history].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Проверяем, выполнялось ли задание сегодня
  const todayStr = formatDate(today);
  const todayEntry = sortedHistory.find(entry => entry.date === todayStr);

  // Если сегодня не было выполнения, прерываем серию
  if (todayEntry && !todayEntry.done) {
    return 0;
  }

  // Подсчитываем серию, начиная с сегодняшнего дня
  for (let i = 0; i < sortedHistory.length; i++) {
    const entry = sortedHistory[i];
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);

    // Проверяем, является ли это "вчера", "позавчера" и т.д.
    const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff !== i) {
      // Пропущен день, прерываем подсчет
      break;
    }

    if (entry.done) {
      streak++;
    } else {
      // Если встречаем день без выполнения, прерываем серию
      break;
    }
  }

  return streak;
}

function calculateCompletionRate(history: { date: string; done: boolean }[]): number {
  if (!history || history.length === 0) return 0;

  const completedCount = history.filter(entry => entry.done).length;
  return Math.round((completedCount / history.length) * 100);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
