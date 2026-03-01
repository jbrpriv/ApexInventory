import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '';

const api = axios.create({ baseURL: API });

// Inject token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const login = (credentials) => api.post('/api/auth/login', credentials);

// Accounts
export const getAccounts = (params) => api.get('/api/accounts', { params });
export const getStats = () => api.get('/api/accounts/stats');
export const getAccount = (id) => api.get(`/api/accounts/${id}`);
export const createAccount = (data) => api.post('/api/accounts', data);
export const updateAccount = (id, data) => api.put(`/api/accounts/${id}`, data);
export const deleteAccount = (id) => api.delete(`/api/accounts/${id}`);
export const deleteAccounts = (ids) => api.delete('/api/accounts', { data: { ids } });

// Settings / Background
export const getBackground = () => api.get('/api/settings/background');
export const uploadBackground = (formData) => api.post('/api/settings/background', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const resetBackground = () => api.delete('/api/settings/background');
