<template>
  <div id="app">
    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutModal" class="modal show" @click="handleModalBackdropClick">
      <div class="modal-content">
        <div class="modal-title">Confirm Logout</div>
        <div class="modal-message">Are you sure you want to logout?</div>
        <div class="modal-actions">
          <button class="modal-btn modal-btn-cancel" @click="closeLogoutModal">Cancel</button>
          <button class="modal-btn modal-btn-confirm" @click="confirmLogout">Logout</button>
        </div>
      </div>
    </div>

    <!-- App Header -->
    <header class="app-header">
      <div class="header-content">
        <h1>Book Manager</h1>
        
        <!-- User Info & Logout (only show when authenticated) -->
        <div v-if="isAuthenticated" class="user-section">
          <span class="welcome-text">Welcome, {{ userName }}!</span>
          <button @click="showLogoutModal = true" class="logout-btn">Logout</button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="app-main">
      <router-view 
        :is-authenticated="isAuthenticated"
        :user-data="userData"
        @login-success="handleLoginSuccess"
        @logout="handleLogout"
      />
    </main>

    <!-- App Footer -->
    <footer class="app-footer">
      © 2025 Book Manager • Powered by Vue & Node.js
    </footer>
  </div>
</template>

<script>
import auth from '@/views/utils/auth'

export default {
  name: 'App',
  data() {
    return {
      isAuthenticated: false,
      userData: null,
      userName: '',
      showLogoutModal: false
    }
  },
  mounted() {
    this.checkAuth()
    // Update auth state when route changes
    this.$watch('$route', () => {
      this.checkAuth()
    })
  },
  methods: {
    checkAuth() {
      this.isAuthenticated = auth.isAuthenticated()
      if (this.isAuthenticated) {
        this.userData = auth.getUser()
        this.userName = this.userData?.fullName || this.userData?.username || 'User'
      } else {
        this.userData = null
        this.userName = ''
      }
    },
    handleLoginSuccess(user) {
      this.isAuthenticated = true
      this.userData = user
      this.userName = user?.fullName || user?.username || 'User'
    },
    handleModalBackdropClick(e) {
      if (e.target.classList.contains('modal')) {
        this.closeLogoutModal()
      }
    },
    closeLogoutModal() {
      this.showLogoutModal = false
    },
    confirmLogout() {
      this.closeLogoutModal()
      auth.logout()
      this.isAuthenticated = false
      this.userData = null
      this.userName = ''
      this.$router.push({ name: 'login' })
    },
    handleLogout() {
      this.showLogoutModal = true
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Poppins', Arial, sans-serif;
  min-height: 100vh;
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Background gradient only for authenticated pages */
#app:not(:has(.login-wrapper)) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Header */
.app-header {
  padding: 20px 30px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

/* Hide header on login page */
#app:has(.login-wrapper) .app-header {
  display: none;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.app-header h1 {
  color: white;
  font-size: 2rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  font-weight: 700;
}

/* User Section */
.user-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.welcome-text {
  color: white;
  font-size: 0.95rem;
  font-weight: 500;
}

.logout-btn {
  padding: 8px 20px;
  background: #ffc107;
  border: 2px solid white;
  color: #000;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.logout-btn:hover {
  background: greenyellow;
  color: #000;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

/* Main content */
.app-main {
  flex: 1;
  padding: 20px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

/* Remove padding on login page for full-screen experience */
#app:has(.login-wrapper) .app-main {
  padding: 0;
  max-width: 100%;
}

/* Footer */
.app-footer {
  text-align: center;
  padding: 15px;
  color: white;
  font-size: 0.9rem;
  background: rgba(0, 0, 0, 0.2);
}

/* Hide footer on login page */
#app:has(.login-wrapper) .app-footer {
  display: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .app-header h1 {
    font-size: 1.5rem;
  }
  
  .header-content {
    justify-content: center;
    text-align: center;
  }
  
  .user-section {
    flex-direction: column;
    gap: 10px;
  }
  
  .welcome-text {
    font-size: 0.85rem;
  }
}

/* Logout Modal Styling */
.modal {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

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

.modal-btn-confirm {
  background: #ffc107;
  color: #000;
}

.modal-btn-confirm:hover {
  background: greenyellow;
  transform: translateY(-2px);
}
</style>