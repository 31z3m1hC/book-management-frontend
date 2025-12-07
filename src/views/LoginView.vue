<template>
  <div class="login-wrapper">
    <!-- Modal -->
    <div v-if="modal.show" class="modal show" @click="handleModalBackdropClick">
      <div class="modal-content">
        <div class="modal-title">{{ modal.title }}</div>
        <div class="modal-message">{{ modal.message }}</div>
        <button class="modal-btn" @click="closeModal">OK</button>
      </div>
    </div>

    <div class="container">
      <h1>Book Manager</h1>
      <p class="subtitle" v-if="!showRegisterForm">Login</p>
      <p class="subtitle" v-else>Register</p>

      <!-- Login Form -->
      <form v-if="!showRegisterForm" @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Username</label>
          <input 
            type="text" 
            v-model="loginData.username" 
            :class="{ error: errors.loginUsername }"
            @input="clearError('loginUsername')"
          />
          <div v-if="errors.loginUsername" class="error-text show">
            {{ errors.loginUsername }}
          </div>
        </div>

        <div class="form-group">
          <label>Password</label>
          <input 
            type="password" 
            v-model="loginData.password"
            :class="{ error: errors.loginPassword }"
            @input="clearError('loginPassword')"
          />
          <div v-if="errors.loginPassword" class="error-text show">
            {{ errors.loginPassword }}
          </div>
        </div>

        <button type="submit" class="btn" :disabled="isLoading">
          {{ isLoading ? 'Logging in...' : 'Login' }}
        </button>

        <div class="toggle-form">
          Don't have an account? 
          <a href="#" @click.prevent="showRegisterForm = true">Register here</a>
        </div>
      </form>

      <!-- Register Form -->
      <form v-else @submit.prevent="handleRegister">
        <div class="form-group">
          
          <label>Full Name</label>
          <input 
            type="text" 
            v-model="registerData.fullName"
            :class="{ error: errors.regFullName }"
            @input="clearError('regFullName')"
          />
          <div v-if="errors.regFullName" class="error-text show">
            {{ errors.regFullName }}
          </div>
        </div>

        <div class="form-group">
          <label>Username</label>
          <input 
            type="text" 
            v-model="registerData.username"
            :class="{ error: errors.regUsername }"
            @input="clearError('regUsername')"
          />
          <div v-if="errors.regUsername" class="error-text show">
            {{ errors.regUsername }}
          </div>
        </div>

        <div class="form-group">
          <label>Email</label>
          <input 
            type="email" 
            v-model="registerData.email"
            :class="{ error: errors.regEmail }"
            @input="clearError('regEmail')"
          />
          <div v-if="errors.regEmail" class="error-text show">
            {{ errors.regEmail }}
          </div>
        </div>

        <div class="form-group">
          <label>Password</label>
          <input 
            type="password" 
            v-model="registerData.password"
            :class="{ error: errors.regPassword }"
            @focus="showPasswordReqs = true"
            @input="validatePasswordRequirements"
          />
          
          <div v-if="showPasswordReqs" class="password-requirements show">
            <strong>Password must contain:</strong>
            <ul>
              <li :class="passwordReqs.length ? 'valid' : 'requirement'">
                {{ passwordReqs.length ? '✓' : '✗' }} At least 6 characters
              </li>
              <li :class="passwordReqs.letter ? 'valid' : 'requirement'">
                {{ passwordReqs.letter ? '✓' : '✗' }} At least one letter
              </li>
              <li :class="passwordReqs.number ? 'valid' : 'requirement'">
                {{ passwordReqs.number ? '✓' : '✗' }} At least one number
              </li>
              <li :class="passwordReqs.special ? 'valid' : 'requirement'">
                {{ passwordReqs.special ? '✓' : '✗' }} One special character
              </li>
            </ul>
          </div>
          
          <div v-if="errors.regPassword" class="error-text show">
            {{ errors.regPassword }}
          </div>
        </div>

        <button type="submit" class="btn" :disabled="isLoading">
          {{ isLoading ? 'Registering...' : 'Register' }}
        </button>

        <div class="toggle-form">
          Already have an account? 
          <a href="#" @click.prevent="showRegisterForm = false">Login here</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoginView',
  data() {
    return {
      showRegisterForm: false,
      isLoading: false,
      showPasswordReqs: false,
      loginData: {
        username: '',
        password: ''
      },
      registerData: {
        fullName: '',
        username: '',
        email: '',
        password: ''
      },
      errors: {},
      passwordReqs: {
        length: false,
        letter: false,
        number: false,
        special: false
      },
      modal: {
        show: false,
        title: '',
        message: '',
        type: 'error'
      }
    }
  },
  methods: {
    clearError(field) {
      delete this.errors[field]
    },
    
    clearAllErrors() {
      this.errors = {}
    },
    
    isValidEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailRegex.test(email)
    },
    
    isValidPassword(password) {
      return this.passwordReqs.length && 
             this.passwordReqs.letter && 
             this.passwordReqs.number && 
             this.passwordReqs.special
    },
    
    validatePasswordRequirements() {
      const password = this.registerData.password
      this.passwordReqs.length = password.length >= 6
      this.passwordReqs.letter = /[a-zA-Z]/.test(password)
      this.passwordReqs.number = /[0-9]/.test(password)
      this.passwordReqs.special = /[!@#$%^&*(),.?":{}|<>]/.test(password)
      this.clearError('regPassword')
    },
    
    showModal(title, message, type = 'error') {
      this.modal = {
        show: true,
        title,
        message,
        type
      }
    },
    
    closeModal() {
      this.modal.show = false
    },
    
    handleModalBackdropClick(e) {
      if (e.target.classList.contains('modal')) {
        this.closeModal()
      }
    },
    
    async handleLogin() {
      this.clearAllErrors()
      
      if (!this.loginData.username.trim()) {
        this.errors.loginUsername = 'Username is required'
      }
      if (!this.loginData.password) {
        this.errors.loginPassword = 'Password is required'
      }
      
      if (Object.keys(this.errors).length > 0) return
      
      this.isLoading = true
      
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 
          (import.meta.env.MODE === 'production'
            ? 'https://chimezie-book-manager-api-ym1o.onrender.com/api'
            : 'http://localhost:3000/api')
        
        const response = await fetch(`${API_URL}/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            username: this.loginData.username.trim(),
            password: this.loginData.password
          })
        })
        
        const data = await response.json()
        
        if (data.success) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
          
          this.showModal(
            'Login Successful!', 
            `Welcome back, ${data.user.fullName}!`, 
            'success'
          )
          
          setTimeout(() => {
            this.$router.push({ name: 'home' })
          }, 2000)
        } else {
          this.showModal(
            'Login Failed', 
            'Invalid username or password. Please check your credentials and try again.',
            'error'
          )
        }
      } catch (error) {
        this.showModal(
          'Connection Error',
          'Unable to connect to the server. Please check your internet connection and try again.',
          'error'
        )
      } finally {
        this.isLoading = false
      }
    },
    
    async handleRegister() {
      this.clearAllErrors()
      
      if (!this.registerData.fullName.trim()) {
        this.errors.regFullName = 'Full name is required'
      }
      if (!this.registerData.username.trim()) {
        this.errors.regUsername = 'Username is required'
      }
      if (!this.registerData.email.trim()) {
        this.errors.regEmail = 'Email is required'
      } else if (!this.isValidEmail(this.registerData.email)) {
        this.errors.regEmail = 'Please enter a valid email address'
      }
      if (!this.registerData.password) {
        this.errors.regPassword = 'Password is required'
      } else if (!this.isValidPassword(this.registerData.password)) {
        this.errors.regPassword = 'Password must meet all requirements'
      }
      
      if (Object.keys(this.errors).length > 0) return
      
      this.isLoading = true
      
      try {
        const API_URL = import.meta.env.VITE_API_BASE_URL || 
          (import.meta.env.MODE === 'production'
            ? 'https://book-manager-api-ym1o.onrender.com/api'
            : 'http://localhost:3000/api')
        
        const response = await fetch(`${API_URL}/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fullName: this.registerData.fullName.trim(),
            username: this.registerData.username.trim(),
            email: this.registerData.email.trim(),
            password: this.registerData.password
          })
        })
        
        const data = await response.json()
        
        if (data.success) {
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(data.user))
          
          this.showModal(
            'Registration Successful!', 
            `Welcome, ${data.user.fullName}! Your account has been created.`,
            'success'
          )
          
          setTimeout(() => {
            this.$router.push({ name: 'home' })
          }, 2000)
        } else {
          this.showModal(
            'Registration Failed',
            data.message || data.error || 'Unable to create account. Please try again.',
            'error'
          )
        }
      } catch (error) {
        this.showModal(
          'Connection Error',
          `Unable to connect to the server: ${error.message}`,
          'error'
        )
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style scoped>
* { margin: 0; padding: 0; box-sizing: border-box; }

.login-wrapper {
  font-family: "Poppins", sans-serif;
  background: linear-gradient(135deg, #5563de, #74abe2);
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.container {
  background: #5563de;
  color: white;
  padding: 40px;
  max-width: 420px;
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
  text-align: center;
}

h1 {
  font-size: 2rem;
  color: white;
  margin-bottom: 10px;
  font-weight: 700;
}

.subtitle {
  color: white;
  font-size: 0.9rem;
  margin-bottom: 25px;
}

.form-group {
  text-align: left;
  margin-bottom: 18px;
}

label {
  display: block;
  margin-bottom: 6px;
  font-weight: 600;
  font-size: 0.9rem;
}

input {
  width: 100%;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1.8px solid #ddd;
  font-size: 1rem;
  transition: 0.3s;
}

input:focus {
  border-color: #5563de;
  outline: none;
}

input.error {
  border-color: #d9534f;
}

.error-text {
  color: #d9534f;
  margin-top: 5px;
  font-size: 0.8rem;
}

.password-requirements {
  font-size: 0.8rem;
  padding: 10px;
  background: #f8f8f8;
  border-radius: 8px;
  margin-top: 6px;
  color: #333;
}

.password-requirements ul {
  margin-top: 5px;
  list-style: none;
  padding-left: 0;
}

.password-requirements .requirement { 
  color: #d9534f; 
}

.password-requirements .valid { 
  color: #28a745; 
}

.btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: #ffbd3d;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.25s ease;
  margin-top: 10px;
}

.btn:hover:not(:disabled) {
  background: #90ee90;
  transform: translateY(-2px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.toggle-form {
  margin-top: 18px;
  font-size: 0.85rem;
  color: white;
}

.toggle-form a {
  color: white;
  font-weight: 700;
  text-decoration: none;
}

.toggle-form a:hover { 
  text-decoration: underline; 
}

/* Modal Styling */
.modal {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal.show { 
  display: flex; 
}

.modal-content {
  background: #fff;
  color: #333;
  width: 92%;
  max-width: 380px;
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
  margin-bottom: 18px; 
}

.modal-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: #ffbd3d;
  color: white;
  font-weight: 700;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.25s ease;
  margin-top: 10px;
}

.modal-btn:hover {
  background: #90ee90;
  transform: translateY(-2px);
}
</style>