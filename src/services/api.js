import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

export default {
  getAllBooks() { return api.get('/books'); },
  createBook(data) { return api.post('/books', data); },
  updateBook(id, data) { return api.put(`/books/${id}`, data); },
  deleteBook(id) { return api.delete(`/books/${id}`); },
  searchBooks(query) { return api.get(`/books/search/${query}`); }
};