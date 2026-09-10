import axios, { AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

export const api = axios.create({ baseURL });

// Attach the JWT from localStorage on every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export interface ApiErrorShape {
  success: false;
  message: string;
}

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return (error.response?.data as ApiErrorShape)?.message ?? error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Something went wrong';
};
