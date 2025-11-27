<template>
  <div class="page">
    <div class="container">

      <!-- Header Buttons -->
      <div class="header">
          <button class="btn-add counter-btn" disabled>
            Published: {{ publishedCount }}
          </button>
         <button class="btn-add counter-btn" disabled>
            Unpublished: {{ unpublishedCount }}
         </button>
        <button @click="showAddForm = true" class="btn-add">Add New Book</button>
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
          <!-- Dropdown Menu Button -->
          <div class="card-menu">
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

    <footer>
      © 2025 Node.js Demo • Data served from your backend
    </footer>
  </div>
</template>

<script>
import api from '@/services/api';

export default {
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
      showFilterForm: false, // NEW
      editingBook: null,
      activeMenu: null,
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
        status: '' // "published", "unpublished", or ""
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
    this.loadBooks();
    document.addEventListener('click', this.closeMenuOnClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.closeMenuOnClickOutside);
  },
  methods: {
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
      this.loadBooks(); // reload all books
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

    // NEW: Apply filter criteria via modal
      applyFilter() {
        this.searchResults = this.books.filter(book => {
          return (!this.filterCriteria.title || book.title.toLowerCase().includes(this.filterCriteria.title.toLowerCase())) &&
                (!this.filterCriteria.author || book.author.toLowerCase().includes(this.filterCriteria.author.toLowerCase())) &&
                (!this.filterCriteria.year || book.yearPublished === this.filterCriteria.year) &&
                (!this.filterCriteria.rating || book.rating >= this.filterCriteria.rating) &&
                (!this.filterCriteria.status ||
                  (this.filterCriteria.status === 'published' && book.published) ||
                  (this.filterCriteria.status === 'unpublished' && !book.published));
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
      this.editingBook = book;
      this.form = { ...book };
      this.activeMenu = null;
    },

    async deleteBook(id) {
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
}

.btn-add {
  background-color: #ffc107; /* yellow */
  color: #000;
  padding: 8px 16px; /* consistent size */
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
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

.btn-clear {
  padding: 12px 20px;
  background: #f15b5b;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
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
  color: #667eea;
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
  background:  #ffc107; 
  color: white;
}

.btn-cancel {
  background: #ddd;
  color: #262626;
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


.btn-save:hover {
  background: greenyellow;
  color: #000; /* optional, for contrast */
}

.btn-cancel:hover {
  background: greenyellow;
  color: #000;
}


.dropdown-input {
  width: 100%;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  background: #667eea;   /* blue background */
  color: white;          /* white text */
  appearance: none;      /* remove default browser arrow styling */
}

.dropdown-input option {
  background: white;     /* dropdown options background */
  color: #262626;        /* option text color */
}

.header .btn-add {
  flex: 1;               /* each button takes equal space */
  text-align: center;    /* center the text inside */
  min-width: 120px;      /* optional: set a minimum width */
}


footer {
  text-align: center;
  padding: 12px 0;
  font-size: 0.9rem;
  background: rgba(255, 255, 255, 0.1);
}
</style>
