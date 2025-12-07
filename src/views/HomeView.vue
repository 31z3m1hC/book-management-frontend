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

            <div class="form-group">
              <label>Book Content</label>
              <textarea 
                v-model="form.content" 
                placeholder="Enter book content, chapters, or description..."
                rows="8"
                class="content-textarea"
              ></textarea>
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

      <!-- Book Content Modal -->
      <div v-if="showContentModal" class="modal show" @click="handleContentModalBackdropClick">
        <div class="content-modal-container">
          <div class="content-header">
            <h2>{{ selectedBook?.title }}</h2>
            <button @click="closeContentModal" class="close-btn">✕</button>
          </div>
          <div class="content-author">by {{ selectedBook?.author }}</div>
          <div class="content-body">
            <p v-if="selectedBook?.content">{{ selectedBook.content }}</p>
            <p v-else class="no-content">No content available for this book.</p>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal show" @click="handleDeleteModalBackdropClick">
        <div class="modal-content">
          <div class="modal-title">Confirm Delete</div>
          <div class="modal-message">Are you sure you want to delete this book? This action cannot be undone.</div>
          <div class="modal-actions">
            <button class="modal-btn modal-btn-cancel" @click="closeDeleteModal">Cancel</button>
            <button class="modal-btn modal-btn-delete" @click="confirmDelete">Delete</button>
          </div>
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
          @click="viewBookContent(book)"
        >
          <!-- Dropdown Menu Button (Admin Only) -->
          <div v-if="isAdmin" class="card-menu">
            <button @click.stop="toggleMenu(book._id)" class="menu-btn">⋮</button>
          <div v-if="activeMenu === book._id" class="dropdown-menu">
              <button @click.stop="editBook(book)" class="menu-item edit-item btn-add">Edit</button>
              <button @click.stop="deleteBook(book._id)" class="menu-item delete-item btn-add">Delete</button>
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
      showDeleteModal: false,
      showContentModal: false,
      selectedBook: null,
      bookToDelete: null,
      editingBook: null,
      activeMenu: null,
      isAdmin: false,
      form: {
        title: '',
        author: '',
        yearPublished: new Date().getFullYear(),
        rating: 0,
        isbn: '',
        published: false,
        content: ''
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

    async loadSampleBooks() {
      if (!this.isAdmin) {
        alert('Only administrators can load sample books.');
        return;
      }

      const sampleBooks = [
        {
          title: "The Great Gatsby",
          author: "F. Scott Fitzgerald",
          yearPublished: 1925,
          rating: 4.5,
          isbn: "978-0743273565",
          published: true,
          content: `Chapter 1\n\nIn my younger and more vulnerable years my father gave me some advice that I've been turning over in my mind ever since.\n\n"Whenever you feel like criticizing any one," he told me, "just remember that all the people in this world haven't had the advantages that you've had."\n\nHe didn't say any more, but we've always been unusually communicative in a reserved way, and I understood that he meant a great deal more than that. In consequence, I'm inclined to reserve all judgments, a habit that has opened up many curious natures to me and also made me the victim of not a few veteran bores.\n\nThe abnormal mind is quick to detect and attach itself to this quality when it appears in a normal person, and so it came about that in college I was unjustly accused of being a politician, because I was privy to the secret griefs of wild, unknown men.`
        },
        {
          title: "1984",
          author: "George Orwell",
          yearPublished: 1949,
          rating: 4.7,
          isbn: "978-0451524935",
          published: true,
          content: `Part One\n\nChapter 1\n\nIt was a bright cold day in April, and the clocks were striking thirteen. Winston Smith, his chin nuzzled into his breast in an effort to escape the vile wind, slipped quickly through the glass doors of Victory Mansions, though not quickly enough to prevent a swirl of gritty dust from entering along with him.\n\nThe hallway smelt of boiled cabbage and old rag mats. At one end of it a coloured poster, too large for indoor display, had been tacked to the wall. It depicted simply an enormous face, more than a metre wide: the face of a man of about forty-five, with a heavy black moustache and ruggedly handsome features.\n\nWinston made for the stairs. It was no use trying the lift. Even at the best of times it was seldom working, and at present the electric current was cut off during daylight hours.`
        },
        {
          title: "To Kill a Mockingbird",
          author: "Harper Lee",
          yearPublished: 1960,
          rating: 4.8,
          isbn: "978-0061120084",
          published: true,
          content: `Part One\n\nChapter 1\n\nWhen he was nearly thirteen, my brother Jem got his arm badly broken at the elbow. When it healed, and Jem's fears of never being able to play football were assuaged, he was seldom self-conscious about his injury. His left arm was somewhat shorter than his right; when he stood or walked, the back of his hand was at right angles to his body, his thumb parallel to his thigh.\n\nHe couldn't have cared less, so long as he could pass and punt.\n\nWhen enough years had gone by to enable us to look back on them, we sometimes discussed the events leading to his accident. I maintain that the Ewells started it all, but Jem, who was four years my senior, said it started long before that.`
        },
        {
          title: "Pride and Prejudice",
          author: "Jane Austen",
          yearPublished: 1813,
          rating: 4.6,
          isbn: "978-0141439518",
          published: true,
          content: `Chapter 1\n\nIt is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.\n\nHowever little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.\n\n"My dear Mr. Bennet," said his lady to him one day, "have you heard that Netherfield Park is let at last?"\n\nMr. Bennet replied that he had not.\n\n"But it is," returned she; "for Mrs. Long has just been here, and she told me all about it."\n\nMr. Bennet made no answer.`
        },
        {
          title: "The Catcher in the Rye",
          author: "J.D. Salinger",
          yearPublished: 1951,
          rating: 4.0,
          isbn: "978-0316769174",
          published: false,
          content: `Chapter 1\n\nIf you really want to hear about it, the first thing you'll probably want to know is where I was born, and what my lousy childhood was like, and how my parents were occupied and all before they had me, and all that David Copperfield kind of crap, but I don't feel like going into it, if you want to know the truth.\n\nIn the first place, that stuff bores me, and in the second place, my parents would have about two hemorrhages apiece if I told anything pretty personal about them. They're quite touchy about anything like that, especially my father. They're nice and all—I'm not saying that—but they're also touchy as hell.`
        }
      ];

      try {
        this.loading = true;
        let successCount = 0;
        let errorCount = 0;

        for (const book of sampleBooks) {
          try {
            await api.createBook(book);
            successCount++;
          } catch (err) {
            errorCount++;
          }
        }

        if (successCount > 0) {
          alert(`Successfully added ${successCount} sample books with content!${errorCount > 0 ? ` (${errorCount} already existed)` : ''}`);
          this.loadBooks();
        } else {
          alert('All sample books already exist in the database.');
        }
      } catch (err) {
        alert('Error loading sample books: ' + err.message);
      } finally {
        this.loading = false;
      }
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

    handleDeleteModalBackdropClick(e) {
      if (e.target.classList.contains('modal')) {
        this.closeDeleteModal()
      }
    },

    closeDeleteModal() {
      this.showDeleteModal = false;
      this.bookToDelete = null;
    },

    viewBookContent(book) {
      this.selectedBook = book;
      this.showContentModal = true;
    },

    handleContentModalBackdropClick(e) {
      if (e.target.classList.contains('modal')) {
        this.closeContentModal();
      }
    },

    closeContentModal() {
      this.showContentModal = false;
      this.selectedBook = null;
    },

    async confirmDelete() {
      if (!this.bookToDelete) return;
      
      try {
        await api.deleteBook(this.bookToDelete);
        this.loadBooks();
        this.activeMenu = null;
        this.closeDeleteModal();
      } catch (err) {
        alert('Error deleting book: ' + err.message);
        this.closeDeleteModal();
      }
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
      
      this.bookToDelete = id;
      this.showDeleteModal = true;
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
        published: false,
        content: ''
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

.content-textarea {
  width: 100%;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 0.95rem;
  font-family: inherit;
  resize: vertical;
  min-height: 150px;
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
  cursor: pointer;
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

/* Delete Confirmation Modal */
.modal.show { 
  display: flex; 
}

.modal-content {
  background: #fff;
  color: #333;
  width: 92%;
  max-width: 400px;
  border-radius: 12px;
  padding: 35px 25px;
  text-align: center;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-40px); }
  to { opacity: 1; transform: translateY(0); }
}

.modal-title {
  font-weight: 700;
  font-size: 1.4rem;
  margin-bottom: 8px;
  color: #333;
}

.modal-message { 
  font-size: 0.95rem; 
  color: #555; 
  margin-bottom: 20px; 
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.modal-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.25s ease;
}

.modal-btn-cancel {
  background: #ddd;
  color: #262626;
}

.modal-btn-cancel:hover {
  background: #c0c0c0;
}

.modal-btn-delete {
  background: #f15b5b;
  color: white;
}

.modal-btn-delete:hover {
  background: #d84848;
  transform: translateY(-2px);
}

/* Book Content Modal */
.content-modal-container {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 800px;
  max-height: 85vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideDown 0.3s ease;
}

.content-header {
  background: #667eea;
  color: white;
  padding: 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 1.5rem;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.content-author {
  padding: 15px 30px;
  background: #f5f5f5;
  color: #666;
  font-style: italic;
  border-bottom: 1px solid #ddd;
}

.content-body {
  padding: 30px;
  overflow-y: auto;
  flex: 1;
  color: #333;
  line-height: 1.8;
  font-size: 1rem;
}

.content-body p {
  white-space: pre-wrap;
  margin: 0;
}

.no-content {
  color: #999;
  font-style: italic;
  text-align: center;
  padding: 40px 20px;
}
</style>