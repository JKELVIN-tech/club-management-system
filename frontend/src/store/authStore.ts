import { create } from 'zustand';
import { api } from '../lib/api';
import type { Member, AuthResponse } from '../types';

interface AuthState {
  member: Member | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => void;
  fetchCurrentMember: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  member: null,
  token: localStorage.getItem('cms_token'),
  isLoading: true,

  login: async (email, password) => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password });
    localStorage.setItem('cms_token', data.token);
    set({ token: data.token, member: data.member });
  },

  register: async (payload) => {
    await api.post('/auth/register', payload);
  },

  logout: () => {
    localStorage.removeItem('cms_token');
    set({ token: null, member: null });
  },

  fetchCurrentMember: async () => {
    const token = localStorage.getItem('cms_token');
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const { data } = await api.get<{ member: Member }>('/auth/me');
      set({ member: data.member, token, isLoading: false });
    } catch {
      localStorage.removeItem('cms_token');
      set({ member: null, token: null, isLoading: false });
    }
  },
}));
