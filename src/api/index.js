import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || '';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// Auth
export const authLogin = (data) => api.post('/api/auth/login', data);
export const authMe = () => api.get('/api/auth/me');
export const authChangePassword = (data) => api.put('/api/auth/change-password', data);
export const authRegister = (data) => api.post('/api/auth/register', data);

// Accounts
export const getAccounts = (params) => api.get('/api/accounts', { params });
export const getAccount = (id) => api.get('/api/accounts/' + id);
export const createAccount = (data) => api.post('/api/accounts', data);
export const updateAccount = (id, data) => api.put('/api/accounts/' + id, data);
export const patchStatus = (id, data) => api.patch('/api/accounts/' + id + '/status', data);
export const deleteAccount = (id) => api.delete('/api/accounts/' + id);
export const bulkDelete = (ids) => api.delete('/api/accounts', { data: { ids } });
export const bulkUpdate = (ids, update) => api.post('/api/accounts/bulk-update', { ids, update });
export const getStats = () => api.get('/api/accounts/stats');

// Stats
export const getOverviewStats = () => api.get('/api/stats/overview');
export const getLevelDist = () => api.get('/api/stats/level-distribution');
export const getRecentStats = () => api.get('/api/stats/recent');

// Settings
export const getBackground = () => api.get('/api/settings/background');
export const uploadBackground = (formData) => api.post('/api/settings/background', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const resetBackground = () => api.delete('/api/settings/background');

// Export
export const exportCSV = () => BASE + '/api/export/csv';
export const exportJSON = () => BASE + '/api/export/json';

// Users
export const getUsers = () => api.get('/api/users');
export const deleteUser = (id) => api.delete('/api/users/' + id);

export default api;
