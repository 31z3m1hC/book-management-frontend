<template>
  <div class="page">
    <div class="container">

    <div class="top-bar">
      <div class="profile-section">
        <!-- Profile picture -->
        <img src="@/assets/profile.png" alt="Profile" class="profile-pic" />
      </div>
    </div>

      <!-- Header Buttons -->
      <div class="header">
          <button class="btn-add counter-btn" disabled>
            Published: {{ publishedCount }}
          </button>
         <button class="btn-add counter-btn" disabled>
            Unpublished: {{ unpublishedCount }}
         </button>
        <button v-if="isAdmin" @click="showAddForm = true" class="btn-add">Add New Book</button>
        <button @click="refreshBooks" class="btn-add">Refresh</button>
        <button @click="showFilterForm = true" class="btn-add">Filter</button>
      </div>

      <!-- Search Bar -->
      <div class="search-section">
        <input 
          v-model="searchQuery" 
          @input="updateLiveFilter"
          @keyup.enter="handleSearch"
          placeholder="Search by title, author, ISBN, year, or publication status..."
          class="search-input"
        >
        <button @click="handleSearch" class="btn-search">Search</button>
      </div>

      <!-- Add/Edit Form Modal -->
      <div v-if="showAddForm || editingBook" class="modal" @click.self="closeForm">
        <div class="form-container">
          <h2>{{ editingBook ? 'Edit Book' : 'Add New Book' }}</h2>
          <form @submit.prevent="saveBook">
            <div class="form-group">
              <label>Title</label>
              <input v-model="form.title" required>
            </div>

            <div class="form-group">
              <label>Author</label>
              <input v-model="form.author" required>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Year</label>
                <input v-model.number="form.yearPublished" type="number" required>
              </div>

              <div class="form-group">
                <label>Rating</label>
                <input v-model.number="form.rating" type="number" min="0" max="5" step="0.1" required>
              </div>
            </div>

            <div class="form-group">
              <label>ISBN</label>
              <input v-model="form.isbn" required :disabled="editingBook">
            </div>

            <div class="form-group checkbox-group">
              <label>
                <input type="checkbox" v-model="form.published">
                <span>Published: {{ form.published ? 'True' : 'False' }}</span>
              </label>
            </div>

            <div class="form-actions">
              <button type="submit" class="btn-save">Save</button>
              <button type="button" @click="closeForm" class="btn-cancel">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Filter Form Modal -->
      <div v-if="showFilterForm" class="modal" @click.self="closeFilterForm">
        <div class="form-container">
          <h2>Filter Books</h2>
          <form @submit.prevent="applyFilter">
            <div class="form-group">
              <label>Title</label>
              <input v-model="filterCriteria.title" placeholder="Filter by title">
            </div>

            <div class="form-group">
              <label>Author</label>
              <input v-model="filterCriteria.author" placeholder="Filter by author">
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Year</label>
                <input v-model.number="filterCriteria.year" type="number" placeholder="Filter by year">
              </div>
              <div class="form-group">
                <label> Rating</label>
                <input v-model.number="filterCriteria.rating" type="number" min="0" max="5" step="0.1">
              </div>
            </div>

          <div class="form-group">
            <label>Publication Status</label>
              <select v-model="filterCriteria.status" class="dropdown-input">
                  <option value="">All</option>
                  <option value="published">Published</option>
                  <option value="unpublished">Unpublished</option>
              </select>
          </div>

            <div class="form-actions">
              <button type="submit" class="btn-save">Apply Filter</button>
              <button type="button" @click="closeFilterForm" class="btn-cancel">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Status / Grid -->
      <div v-if="loading" class="status">Loading…</div>

      <div v-else-if="error" class="status">Error: {{ error }}</div>

      <div v-else-if="displayedBooks.length === 0" class="status">
        {{ searchQuery ? 'No books match your search.' : 'No books available.' }}
      </div>

      <div v-else class="grid">
        <article
          v-for="book in displayedBooks"
          :key="book._id"
          class="card"
        >
          <!-- Dropdown Menu Button (Admin Only) -->
          <div v-if="isAdmin" class="card-menu">
            <button @click="toggleMenu(book._id)" class="menu-btn">⋮</button>
          <div v-if="activeMenu === book._id" class="dropdown-menu">
              <button @click="editBook(book)" class="menu-item edit-item btn-add">Edit</button>
              <button @click="deleteBook(book._id)" class="menu-item delete-item btn-add">Delete</button>
          </div>

          </div>

          <h3>{{ book.title }}</h3>

          <div class="meta">
            <span>Author: <strong>{{ book.author }}</strong></span>
          </div>

          <div class="meta">
            <span>Year: <strong>{{ book.yearPublished }}</strong></span>
          </div>

          <div class="meta">
            <span>ISBN: <strong>{{ book.isbn }}</strong></span>
          </div>

          <div class="meta">
            <span>Rating: <strong>{{ book.rating }}/5</strong></span>
          </div>

          <span
            class="badge"
            :class="{ secondary: !book.published }"
          >
            {{ book.published ? "Published" : "Unpublished" }}
          </span>
        </article>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
  props: {
    isAuthenticated: {
      type: Boolean,
      default: false
    },
    userData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      books: [],
      searchQuery: '',
      liveFiltered: [],
      searchResults: [],
      locked: false,
      loading: false,
      error: null,
      showAddForm: false,
      showFilterForm: false,
      editingBook: null,
      activeMenu: null,
      isAdmin: false,
      form: {
        title: '',
        author: '',
        yearPublished: new Date().getFullYear(),
        rating: 0,
        isbn: '',
        published: false
      },
      filterCriteria: {
        title: '',
        author: '',
        year: null,
        rating: null,
        status: '' 
      }
    };
  },
  computed: {
    displayedBooks() {
      return this.locked ? this.searchResults : this.liveFiltered;
    },
    publishedCount() {
      return this.books.filter(book => book.published).length;
    },
    unpublishedCount() {
      return this.books.filter(book => !book.published).length;
    }
  },
  mounted() {
    this.checkUserRole();
    this.loadBooks();
    document.addEventListener('click', this.closeMenuOnClickOutside);
    
    // Redirect if not authenticated
    if (!this.isAuthenticated) {
      this.$router.push({ name: 'login' })
    }
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeMenuOnClickOutside);
  },
  watch: {
    isAuthenticated(newVal) {
      if (!newVal) {
        this.$router.push({ name: 'login' })
      }
    },
    userData: {
      handler() {
        this.checkUserRole()
      },
      deep: true
    }
  },
  methods: {
    checkUserRole() {
      this.isAdmin = this.userData && this.userData.role === 'admin';
    },

    async loadBooks() {
      this.loading = true;
      this.error = null;
      try {
        const response = await api.getAllBooks();
        this.books = response.data.data;
        this.liveFiltered = this.books;
        this.searchResults = [];
        this.locked = false;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    refreshBooks() {
      this.loadBooks();
    },

    updateLiveFilter() {
      const query = this.searchQuery.toLowerCase();
      this.liveFiltered = this.books.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.isbn.toLowerCase().includes(query) ||
        book.yearPublished.toString().includes(query) ||
        (book.published && 'published'.includes(query)) ||
        (!book.published && 'unpublished'.includes(query))
      );
      this.locked = false;
    },

    handleSearch() {
      const query = this.searchQuery.toLowerCase();
      this.searchResults = this.books.filter(book =>
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.isbn.toLowerCase().includes(query) ||
        book.yearPublished.toString().includes(query) ||
        (book.published && 'published'.includes(query)) ||
        (!book.published && 'unpublished'.includes(query))
      );
      this.locked = true;
      this.searchQuery = '';
    },

  applyFilter() {
    const f = this.filterCriteria;

    this.searchResults = this.books.filter(b => {
      const matchTitle = !f.title || b.title.toLowerCase().includes(f.title.toLowerCase());
      const matchAuthor = !f.author || b.author.toLowerCase().includes(f.author.toLowerCase());
      const matchYear = f.year == null || f.year === '' || b.yearPublished === f.year;
      const matchRating = f.rating == null || f.rating === '' || b.rating === f.rating;
      const matchStatus =
        !f.status ||
        (f.status === 'published' && b.published) ||
        (f.status === 'unpublished' && !b.published);

      return matchTitle && matchAuthor && matchYear && matchRating && matchStatus;
    });

    this.locked = true;
    this.closeFilterForm();
    },

    closeFilterForm() {
      this.showFilterForm = false;
    },

    toggleMenu(bookId) {
      this.activeMenu = this.activeMenu === bookId ? null : bookId;
    },

    closeMenuOnClickOutside(event) {
      if (!event.target.closest('.card-menu')) {
        this.activeMenu = null;
      }
    },

    async saveBook() {
      if (!this.isAdmin) {
        alert('Only administrators can add or edit books.');
        return;
      }
      
      try {
        if (this.editingBook) {
          await api.updateBook(this.editingBook._id, this.form);
        } else {
          await api.createBook(this.form);
        }
        this.closeForm();
        this.loadBooks();
      } catch (err) {
        alert('Error saving book: ' + err.message);
      }
    },

    editBook(book) {
      if (!this.isAdmin) {
        alert('Only administrators can edit books.');
        return;
      }
      
      this.editingBook = book;
      this.form = { ...book };
      this.activeMenu = null;
    },

    async deleteBook(id) {
      if (!this.isAdmin) {
        alert('Only administrators can delete books.');
        return;
      }
      
      if (!confirm('Delete this book?')) return;
      
      try {
        await api.deleteBook(id);
        this.loadBooks();
        this.activeMenu = null;
      } catch (err) {
        alert('Error deleting book: ' + err.message);
      }
    },

    closeForm() {
      this.showAddForm = false;
      this.editingBook = null;
      this.form = {
        title: '',
        author: '',
        yearPublished: new Date().getFullYear(),
        rating: 0,
        isbn: '',
        published: false
      };
    }
  }
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  color: #fff;
  font-family: 'Poppins', sans-serif;
  display: flex;
  flex-direction: column;
  background: none;
}

.container {
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px 20px 40px 20px;
  flex: 1;
}

.header {
  display: flex;
  margin-bottom: 20px;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;   
}

.header .btn-add {
  background-color: #ffc107;
  color: #000;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  text-align: center;
  min-width: 120px;
  flex: 0 0 auto;   
}

.header .btn-add:hover {
  background: greenyellow;
}

.btn-add:hover {
  background: greenyellow;
}

.search-section {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 8px;
  background: white;
  color: #262626;
  font-size: 1rem;
}

.search-input::placeholder {
  color: rgba(0,0,0,0.5);
}

.search-input:focus {
  outline: none;
  border-color: #ffd166;
}

.btn-search {
  padding: 12px 25px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 550;
  cursor: pointer;
}

.btn-search:hover {
  background: #ffbd3d;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.form-container {
  background: #667eea;
  color: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.form-container h2 {
  margin-bottom: 20px;
  color: white;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.form-group input:disabled {
  background: #f5f5f5;
}

.checkbox-group label {
  display: flex;
  align-items: center;
  gap: 10px;
}

.checkbox-group input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-save, .btn-cancel {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
}

.btn-save {
  background: #ffc107; 
  color: white;
}

.btn-cancel {
  background: #ddd;
  color: #262626;
}

.btn-save:hover {
  background: greenyellow;
  color: #000;
}

.counter-btn,.btn-cancel:hover {
  background: greenyellow;
  color: #000;
}

.status {
  text-align: center;
  margin-top: 20px;
  opacity: 0.9;
  font-size: 1.1rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 20px;
}

.card {
  background: rgba(255, 255, 255, 0.12);
  color: white;
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(6px);
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  position: relative;
}

.card:hover {
  transform: translateY(-3px);
  background: magenta;
}

.card-menu {
  position: absolute;
  top: 10px;
  right: 10px;
}

.menu-btn {
  background: rgba(255,255,255,0.2);
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.menu-btn:hover {
  background: rgba(255,255,255,0.3);
}

.dropdown-menu {
  position: absolute;
  top: 35px;
  right: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  overflow: hidden;
  z-index: 10;
  min-width: 120px;
}

.menu-item {
  display: block;
  width: 100%;
  padding: 10px 15px;
  border: none;
  background: white;
  color: #262626;
  text-align: left;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
}

.menu-item:hover {
  background: #f5f5f5;
}

.edit-item {
  color: #667eea;
}

.delete-item {
  color: #f15b5b;
}

.meta {
  display: flex;
  gap: 12px;
  align-items: center;
  margin: 6px 0;
  font-size: 0.95rem;
}

.badge {
  display: inline-block;
  padding: 5px 10px;
  border-radius: 999px;
  background: greenyellow;
  color: white;
  font-weight: 600;
  font-size: 0.85rem;
  margin-top: 12px;
}

.badge.secondary {
  background: #f15b5b;
  color: #fff;
}

.dropdown-input {
  width: 100%;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  background: #667eea;   
  color: white;          
  appearance: none;      
}

.dropdown-input option {
  background: white;     
  color: #262626;       
}

.header .btn-add {
  flex: 1;               
  text-align: center;    
  min-width: 120px;      
}

.counter-btn {
  cursor: default;
  opacity: 0.95;
}

.counter-btn {
  background-color: #ffc107;
}

.top-bar {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  margin-bottom: 30px;
}

.profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-pic {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

@media (max-width: 600px) {
  .header {
    flex-direction: column;   
    align-items: stretch;
  }

  .header .btn-add {
    width: 100%;             
    font-size: 16px;          
    margin-bottom: 8px;       
  }
}
</style>