import axios from 'axios';

// Use environment variable if available, otherwise fall back to defaults
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  (import.meta.env.MODE === 'production'
    ? 'https://book-manager-api-ym1o.onrender.com/api'
    : 'http://localhost:3000/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000 // 10 second timeout
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default {
  getAllBooks() { return api.get('/books'); },
  createBook(data) { return api.post('/books', data); },
  updateBook(id, data) { return api.put(`/books/${id}`, data); },
  deleteBook(id) { return api.delete(`/books/${id}`); },
  searchBooks(query) { return api.get(`/books/search/${query}`); }
};