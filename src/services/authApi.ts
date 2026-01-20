import { apiClient } from './apiClient';

export interface User {
  id: number;
  username: string;
  email: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  name?: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post('/login', credentials);
    return response.data;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post('/register', data);
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await apiClient.get('/me');
    return response.data;
  }
};