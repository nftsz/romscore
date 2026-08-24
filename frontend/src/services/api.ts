import axios from 'axios';
import { Game, RomHack, HackRating } from '../lib/types/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor com a chave unificada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@RideAnalytics:access_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// Funções de consumo da API
export const getGamesByPlatform = async (platform: string, limit: number = 10): Promise<Game[]> => {
  const response = await api.get<Game[]>('/games/', {
    params: {
      platform,
      filter: 'popular',
      limit,
    },
  });
  return response.data;
};

export const searchGames = async (search: string): Promise<Game[]> => {
  const response = await api.get<Game[]>('/games/', {
    params: { search },
  });
  return response.data;
};

export const submitRomHack = async (data: Partial<RomHack>): Promise<RomHack> => {
  const response = await api.post<RomHack>('/hacks/', data);
  return response.data;
};

export const rateRomHack = async (hackId: number, score: number, review?: string): Promise<HackRating> => {
  const response = await api.post<HackRating>(`/hacks/${hackId}/rate/`, { score, review });
  return response.data;
};

export const getMyHacks = async (): Promise<RomHack[]> => {
  const response = await api.get<RomHack[]>('/hacks/my_hacks/');
  return response.data;
};