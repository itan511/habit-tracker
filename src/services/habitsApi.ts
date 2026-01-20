import { apiClient } from './apiClient';

export interface HabitStats {
  streak: number;
  completion_rate: number;
}

export interface HistoryPoint {
  date: string;
  done: boolean;
}

export interface Habit {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  stats: HabitStats;
  history: HistoryPoint[];
}

export const habitsApi = {
  async getAll(): Promise<Habit[]> {
    const response = await apiClient.get('/habits');
    return response.data;
  },

  async getById(id: number): Promise<Habit> {
    const response = await apiClient.get(`/habits/${id}`);
    return response.data;
  },

  async create(habitData: { name: string; description?: string }): Promise<Habit> {
    const response = await apiClient.post('/habits', habitData);
    return response.data;
  },

  async updateProgress(habitId: number, date: string, done: boolean): Promise<any> {
    const response = await apiClient.post('/habits/mark', {
      habit_id: habitId,
      date,
      done
    });
    return response.data;
  },

  async getHistory(habitId: number): Promise<HistoryPoint[]> {
    const response = await apiClient.get(`/habits/${habitId}/history`);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/habits/${id}`);
  }
};