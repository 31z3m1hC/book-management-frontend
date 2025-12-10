<template>
  <div class="page">
    <div class="container">
      <div class="topBar">
        <div class="profileSection">
          <img src="@/assets/profile.png" alt="Profile" class="profilePic" />
        </div>
      </div>

      <div class="header">
        <button class="buttonAdd counterButton" disabled>
          Published: {{ publishedCount }}
        </button>
        <button class="buttonAdd counterButton" disabled>
          Unpublished: {{ unpublishedCount }}
        </button>
        <button v-if="isAdmin" @click="showAddForm = true" class="buttonAdd">Add New Book</button>
        <!-----<button v-if="isAdmin" @click="loadSampleBooks" class="buttonAdd">Load Sample Books</button>---->
        <button @click="refreshBooks" class="buttonAdd">Refresh</button>
        <button @click="showFilterForm = true" class="buttonAdd">Filter</button>
      </div>

      <!-- Search Bar -->
      <div class="searchSection">
        <input 
          v-model="searchQuery" 
          @input="updateLiveFilter"
          @keyup.enter="handleSearch"
          placeholder="Search by title, author, ISBN, year, or publication status..."
          class="searchInput"
        >
        <button @click="handleSearch" class="searchButton">Search</button>
      </div>

      <!-- Add/Edit Form Modal -->
      <div v-if="showAddForm || editingBook" class="modal" @click.self="closeForm">
        <div class="formContainer">
          <h2>{{ editingBook ? 'Edit Book' : 'Add New Book' }}</h2>
          <form @submit.prevent="saveBook">
            <div class="formGroup">
              <label>Title</label>
              <input v-model="form.title" required>
            </div>
            <div class="formGroup">
              <label>Author</label>
              <input v-model="form.author" required>
            </div>
            <div class="formRow">
              <div class="formGroup">
                <label>Year</label>
                <input v-model.number="form.yearPublished" type="number" required>
              </div>
              <div class="formGroup">
                <label>Rating</label>
                <input v-model.number="form.rating" type="number" min="0" max="5" step="0.1" required>
              </div>
            </div>
            <div class="formGroup">
              <label>ISBN</label>
              <input v-model="form.isbn" required :disabled="editingBook">
            </div>
            <div class="formGroup">
              <label>Book Link (URL)</label>
              <input
                v-model="form.content"
                placeholder="https://www.gutenberg.org/ebooks/12345"
                class="linkInput"
              />
            </div>
            <div class="formGroup checkboxGroup">
              <label>
                <input type="checkbox" v-model="form.published">
                <span>Published: {{ form.published ? 'True' : 'False' }}</span>
              </label>
            </div>
            <div class="formActions">
              <button type="submit" class="saveButton">Save</button>
              <button type="button" @click="closeForm" class="cancelButton">Cancel</button>
            </div>
          </form>
        </div>
      </div>

      <!-- Error Toast Notification -->
      <transition name="toast">
        <div v-if="showToast" class="toast">
          <div class="toastContent">
            <span class="toastIcon"></span>
            <span class="toastMessage">{{ toastMessage }}</span>
          </div>
        </div>
      </transition>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="modal show" @click="handleDeleteModalBackdropClick">
        <div class="modalContent">
          <div class="modalTitle">Confirm Delete</div>
          <div class="modalMessage">Are you sure you want to delete this book? This action cannot be undone.</div>
          <div class="modalActions">
            <button class="modalButton modalCancelButton" @click="closeDeleteModal">Cancel</button>
            <button class="modalButton modalDeleteButton" @click="confirmDelete">Delete</button>
          </div>
        </div>
      </div>

      <!-- Filter Form Modal -->
      <div v-if="showFilterForm" class="modal" @click.self="closeFilterForm">
        <div class="formContainer">
          <h2>Filter Books</h2>
          <form @submit.prevent="applyFilter">
            <div class="formGroup">
              <label>Title</label>
              <input v-model="filterCriteria.title" placeholder="Filter by title">
            </div>
            <div class="formGroup">
              <label>Author</label>
              <input v-model="filterCriteria.author" placeholder="Filter by author">
            </div>
            <div class="formRow">
              <div class="formGroup">
                <label>Year</label>
                <input v-model.number="filterCriteria.year" type="number" placeholder="Filter by year">
              </div>
              <div class="formGroup">
                <label> Rating</label>
                <input v-model.number="filterCriteria.rating" type="number" min="0" max="5" step="0.1">
              </div>
            </div>
            <div class="formGroup">
              <label>Publication Status</label>
              <select v-model="filterCriteria.status" class="dropdownInput">
                  <option value="">All</option>
                  <option value="published">Published</option>
                  <option value="unpublished">Unpublished</option>
              </select>
            </div>
            <div class="formActions">
              <button type="submit" class="saveButton">Apply Filter</button>
              <button type="button" @click="closeFilterForm" class="cancelButton">Cancel</button>
            </div>
          </form>
        </div>
      </div>

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
          @click="handleCardClick($event, book)"
        >
          <div v-if="isAdmin" class="cardMenu">
            <button @click.stop="toggleMenu(book._id)" class="menuButton">⋮</button>
            <div v-if="activeMenu === book._id" class="dropdownMenu">
              <button @click.stop="editBook(book)" class="menuItem editItem buttonAdd">Edit</button>
              <button @click.stop="deleteBook(book._id)" class="menuItem deleteItem buttonAdd">Delete</button>
            </div>
          </div>
          
          <div class="cardContent">
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
            <span class="badge" :class="{ secondary: !book.published }">
              {{ book.published ? "Published" : "Unpublished" }}
            </span>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script>
    import { 
      loadSampleBooks as loadSampleBooksService, 
      loadBooks as fetchBooks,
      deleteBook as deleteBookService,
      createBook as createBookService,
      updateBook as updateBookService
    } from '@/services/bookService';


    export default {
      props: {
        isAuthenticated: { type: Boolean, default: false },
        userData: { type: Object, default: null }
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
          showToast: false,
          toastMessage: '',

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
          return this.books.filter(b => b.published).length;
        },

        unpublishedCount() {
          return this.books.filter(b => !b.published).length;
        }
      },

      mounted() {
        this.checkUserRole();
        this.loadBooks();

        document.addEventListener('click', this.closeMenuOnClickOutside);

        if (!this.isAuthenticated) {
          this.$router.push({ name: 'login' });
        }
      },

      beforeUnmount() {
        document.removeEventListener('click', this.closeMenuOnClickOutside);
      },

      watch: {
        isAuthenticated(newVal) {
          if (!newVal) this.$router.push({ name: 'login' });
        },

        userData: {
          handler() {
            this.checkUserRole();
          },
          deep: true
        }
      },

      methods: {
        checkUserRole() {
          this.isAdmin = this.userData && this.userData.role === 'admin';
        },

        async loadSampleBooks() {
          await loadSampleBooksService(this.isAdmin, this.loadBooks);
        },

        async loadBooks() {
          this.loading = true;
          this.error = null;

          try {
            const books = await fetchBooks();
            this.books = books;
            this.liveFiltered = books;
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
          const q = this.searchQuery.toLowerCase();

          this.liveFiltered = this.books.filter(book =>
            book.title.toLowerCase().includes(q) ||
            book.author.toLowerCase().includes(q) ||
            book.isbn.toLowerCase().includes(q) ||
            book.yearPublished.toString().includes(q) ||
            (book.published && "published".includes(q)) ||
            (!book.published && "unpublished".includes(q))
          );

          this.locked = false;
        },

        handleSearch() {
          const q = this.searchQuery.toLowerCase();

          this.searchResults = this.books.filter(book =>
            book.title.toLowerCase().includes(q) ||
            book.author.toLowerCase().includes(q) ||
            book.isbn.toLowerCase().includes(q) ||
            book.yearPublished.toString().includes(q) ||
            (book.published && "published".includes(q)) ||
            (!book.published && "unpublished".includes(q))
          );

          this.locked = true;
          this.searchQuery = "";
        },

        applyFilter() {
          const f = this.filterCriteria;

          this.searchResults = this.books.filter(b => {
            const matchTitle = !f.title || b.title.toLowerCase().includes(f.title.toLowerCase());
            const matchAuthor = !f.author || b.author.toLowerCase().includes(f.author.toLowerCase());
            const matchYear = !f.year || b.yearPublished === f.year;
            const matchRating = !f.rating || b.rating === f.rating;
            const matchStatus =
              !f.status ||
              (f.status === "published" && b.published) ||
              (f.status === "unpublished" && !b.published);

            return matchTitle && matchAuthor && matchYear && matchRating && matchStatus;
          });

          this.locked = true;
          this.closeFilterForm();
        },

        closeFilterForm() {
          this.showFilterForm = false;
        },

        handleCardClick(event, book) {
          // Only open link if click wasn't on menu button or menu items
          if (event.target.closest('.cardMenu') || event.target.closest('.menuButton') || event.target.closest('.dropdownMenu')) {
            return;
          }
          
          if (!book.content || book.content.trim() === '') {
            alert('This book has no link available');
            return;
          }

          let url = book.content.trim();

          // Ensure URL has a protocol
          if (!url.match(/^https?:\/\//i)) {
            url = 'https://' + url;
          }

          // Open in new tab
          window.open(url, '_blank', 'noopener,noreferrer');
        },

        openBookLink(book) {
          console.log('openBookLink called with:', book.title);
          console.log('URL:', book.content);
          
          if (!book.content || book.content.trim() === '') {
            alert('This book has no link available');
            return;
          }

          let url = book.content.trim();

          // Ensure URL has a protocol
          if (!url.match(/^https?:\/\//i)) {
            url = 'https://' + url;
          }

          console.log('Opening URL:', url);

          try {
            // Open in new tab with security features
            const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
            
            // Check if popup was blocked
            if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
              // Popup was blocked, show alternative
              if (confirm(`Unable to open link automatically. The link is:\n${url}\n\nClick OK to navigate to the link.`)) {
                window.location.href = url;
              }
            }
          } catch (err) {
            console.error('Error opening link:', err);
            alert('Unable to open link. Please copy and paste it manually:\n' + url);
          }
        },

        handleDeleteModalBackdropClick(e) {
          if (e.target.classList.contains("modal")) this.closeDeleteModal();
        },

        async confirmDelete() {
          if (!this.bookToDelete) return;

          try {
            const response = await deleteBookService(this.bookToDelete);
            await this.loadBooks();
          } catch (err) {
            console.error('Delete error:', err);
            alert("Error deleting book: " + (err.response?.data?.message || err.message));
          } finally {
            this.closeDeleteModal();
          }
        },

        closeDeleteModal() {
          this.showDeleteModal = false;
          this.bookToDelete = null;
        },

        async deleteBook(id) {
          this.bookToDelete = id;
          this.showDeleteModal = true;
        },

        toggleMenu(bookId) {
          this.activeMenu = this.activeMenu === bookId ? null : bookId;
        },

        closeMenuOnClickOutside(e) {
          if (!e.target.closest(".cardMenu")) {
            this.activeMenu = null;
          }
        },

        async saveBook() {
          if (!this.isAdmin) {
            alert("Only administrators can add or edit books.");
            return;
          }

          try {
            if (this.editingBook) {
              await updateBookService(this.editingBook._id, this.form);
            } else {
              await createBookService(this.form);
            }

            this.closeForm();
            this.loadBooks();
          } catch (err) {
            alert("Error saving book: " + err.message);
          }
        },

        editBook(book) {
          this.editingBook = book;
          this.form = { ...book };
          this.activeMenu = null;
          this.showAddForm = true;
        },

        closeForm() {
          this.showAddForm = false;
          this.editingBook = null;

          this.form = {
            title: "",
            author: "",
            yearPublished: new Date().getFullYear(),
            rating: 0,
            isbn: "",
            published: false,
            content: ""
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

.header .buttonAdd {
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

.header .buttonAdd:hover {
  background: greenyellow;
}

.buttonAdd:hover {
  background: greenyellow;
}

.searchSection {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  align-items: center;
}

.searchInput {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-radius: 8px;
  background: white;
  color: #262626;
  font-size: 1rem;
}

.searchInput::placeholder {
  color: rgba(0,0,0,0.5);
}

.searchInput:focus {
  outline: none;
  border-color: #ffd166;
}

.searchButton {
  padding: 12px 25px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 550;
  cursor: pointer;
}

.searchButton:hover {
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

.formContainer {
  background: #667eea;
  color: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.formContainer h2 {
  margin-bottom: 20px;
  color: white;
}

.formGroup {
  margin-bottom: 15px;
}

.formGroup label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
}

.formGroup input {
  width: 100%;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
}

.formGroup input:disabled {
  background: #f5f5f5;
}

.linkInput {
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.checkboxGroup label {
  display: flex;
  align-items: center;
  gap: 10px;
}

.checkboxGroup input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

.formRow {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.formActions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.saveButton, .cancelButton {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 5px;
  font-weight: 600;
  cursor: pointer;
}

.saveButton {
  background: #ffc107; 
  color: white;
}

.cancelButton {
  background: #ddd;
  color: #262626;
}

.saveButton:hover {
  background: greenyellow;
  color: #000;
}

.counterButton,.cancelButton:hover {
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
  backdrop-filter: blur(6px);
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  position: relative;
  padding: 20px;
}

.card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.3);
  background: rgba(255, 255, 255, 0.18);
}

.cardContent {
  flex: 1;
  cursor: pointer;
}

.cardMenu {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.menuButton {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
  font-weight: bold;
}

.menuButton:hover {
  background: rgba(0, 0, 0, 0.9);
}

.dropdownMenu {
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

.menuItem {
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

.menuItem:hover {
  background: #f5f5f5;
}

.editItem {
  color: #667eea;
}

.deleteItem {
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

.dropdownInput {
  width: 100%;
  padding: 10px;
  border: 2px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  background: #667eea;   
  color: white;          
  appearance: none;      
}

.dropdownInput option {
  background: white;     
  color: #262626;       
}

.header .buttonAdd {
  flex: 1;               
  text-align: center;    
  min-width: 120px;      
}

.counterButton {
  cursor: default;
  opacity: 0.95;
}

.counterButton {
  background-color: #ffc107;
}

.topBar {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  margin-bottom: 30px;
}

.profileSection {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profilePic {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.linkSection {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 2px solid #e0e0e0;
  text-align: center;
}

.readOnlineBtn {
  display: inline-block;
  padding: 12px 30px;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.readOnlineBtn:hover {
  background: #5568d3;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

@media (max-width: 600px) {
  .header {
    flex-direction: column;   
    align-items: stretch;
  }

  .header .buttonAdd {
    width: 100%;             
    font-size: 16px;          
    margin-bottom: 8px;       
  }
}

/* Delete Confirmation Modal */
.modal.show { 
  display: flex; 
}

.modalContent {
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

.modalTitle {
  font-weight: 700;
  font-size: 1.4rem;
  margin-bottom: 8px;
  color: #333;
}

.modalMessage { 
  font-size: 0.95rem; 
  color: #555; 
  margin-bottom: 20px; 
}

.modalActions {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.modalButton {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.25s ease;
}

.modalCancelButton {
  background: #ddd;
  color: #262626;
}

.modalCancelButton:hover {
  background: #c0c0c0;
}

.modalDeleteButton {
  background: #f15b5b;
  color: white;
}

.modalDeleteButton:hover {
  background: #d84848;
  transform: translateY(-2px);
}

/* Toast Notification */
.toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  background: #f15b5b;
  color: white;
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  animation: slideDown 0.3s ease;
}

.toastContent {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toastIcon {
  font-size: 1.2rem;
}

.toastMessage {
  font-weight: 600;
  font-size: 0.95rem;
}

.toast-enter-active, .toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}


</style>