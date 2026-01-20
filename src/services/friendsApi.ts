import { apiClient } from './apiClient';
import { Habit, HistoryPoint } from './habitsApi';

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface HabitStatDetail {
  habit_id: number;
  name: string;
  stats: import('./habitsApi').HabitStats;
}

export interface FriendStats {
  user_id: number;
  username: string;
  habits: HabitStatDetail[];
  overall_stats: {
    total_habits: number;
    average_streak: number;
    average_completion_rate: number;
    total_completed: number;
    total_entries: number;
  };
}

export const friendsApi = {
  async getAll(): Promise<User[]> {
    const response = await apiClient.get('/friends');
    return response.data;
  },

  async add(username: string): Promise<any> {
    const response = await apiClient.post('/friends', { username });
    return response.data;
  },

  async remove(friendId: number): Promise<any> {
    const response = await apiClient.delete(`/friends/${friendId}`);
    return response.data;
  },

  async getUserHabits(userId: number): Promise<Habit[]> {
    const response = await apiClient.get(`/users/${userId}/habits`);
    return response.data;
  },

  async getFriendHabits(friendId: number): Promise<Habit[]> {
    const response = await apiClient.get(`/users/${friendId}/habits`);
    return response.data;
  }
};