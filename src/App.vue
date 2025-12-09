<template>
  <div id="app">
    <!-- LogoutModal Component -->
    <LogoutView
      :show="showLogoutModal"
      @cancel="closeLogoutModal"
      @confirm="confirmLogout"
    />

    <!-- App Header -->
    <header class="appHeader">
      <div class="headerContent">
        <h1>Book Manager</h1>

        <div v-if="isAuthenticated" class="userSection">
          <span class="welcomeText">Welcome, {{ userName }}!</span>
          <button @click="showLogoutModal = true" class="logoutButton">Logout</button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="appMain">
      <router-view
        :is-authenticated="isAuthenticated"
        :user-data="userData"
        @login-success="handleLoginSuccess"
        @logout="handleLogout"
      />
    </main>

    <footer class="appFooter">
      © 2025 Book Manager • Powered by Vue & Node.js
    </footer>
  </div>
</template>

<script>
  import { ref, onMounted, watch } from 'vue'
  import { useRouter, useRoute } from 'vue-router'
  import auth from '@/views/utils/auth'
  import LogoutView from '@/views/LogoutView.vue'

  export default {
    name: 'App',
    components: { LogoutView },

    setup() {
      const router = useRouter()
      const route = useRoute()

      const isAuthenticated = ref(false)
      const userData = ref(null)
      const userName = ref('')
      const showLogoutModal = ref(false)

      const checkAuth = () => {
        isAuthenticated.value = auth.isAuthenticated()
        if (isAuthenticated.value) {
          userData.value = auth.getUser()
          userName.value = userData.value?.fullName || userData.value?.username || 'User'
        } else {
          userData.value = null
          userName.value = ''
        }
      }

      const handleLoginSuccess = (user) => {
        isAuthenticated.value = true
        userData.value = user
        userName.value = user.fullName || user.username || 'User'
      }

      const closeLogoutModal = () => {
        showLogoutModal.value = false
      }

      const confirmLogout = () => {
        closeLogoutModal()
        auth.logout()
        isAuthenticated.value = false
        userData.value = null
        userName.value = ''
        router.push({ name: 'login' })
      }

      const handleLogout = () => {
        showLogoutModal.value = true
      }

      onMounted(() => {
        checkAuth()
      })

      watch(route, () => {
        checkAuth()
      })

      return {
        isAuthenticated,
        userData,
        userName,
        showLogoutModal,
        checkAuth,
        handleLoginSuccess,
        closeLogoutModal,
        confirmLogout,
        handleLogout
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
  #app:not(:has(.loginWrapper)) {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  /* Header */
  .appHeader {
    padding: 20px 30px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  /* Hide header on login page */
  #app:has(.loginWrapper) .appHeader {
    display: none;
  }

  .headerContent {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 15px;
  }

  .appHeader h1 {
    color: white;
    font-size: 2rem;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    font-weight: 700;
  }

  /* User Section */
  .userSection {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .welcomeText {
    color: white;
    font-size: 0.95rem;
    font-weight: 500;
  }

  .logoutButton {
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

  .logoutButton:hover {
    background: greenyellow;
    color: #000;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  /* Main content */
  .appMain {
    flex: 1;
    padding: 20px;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
  }

  /* Remove padding on login page for full-screen experience */
  #app:has(.loginWrapper) .appMain {
    padding: 0;
    max-width: 100%;
  }

  /* Footer */
  .appFooter {
    text-align: center;
    padding: 15px;
    color: white;
    font-size: 0.9rem;
    background: rgba(0, 0, 0, 0.2);
  }

  /* Hide footer on login page */
  #app:has(.loginWrapper) .appFooter {
    display: none;
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .appHeader h1 {
      font-size: 1.5rem;
    }
    
    .headerContent {
      justify-content: center;
      text-align: center;
    }
    
    .userSection {
      flex-direction: column;
      gap: 10px;
    }
    
    .welcomeText {
      font-size: 0.85rem;
    }
  }
</style>
