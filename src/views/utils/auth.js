// utils/auth.js
// Authentication utility functions

export const auth = {
  // Get the current user from localStorage
  getUser() {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },
  
  // Get the authentication token
  getToken() {
    return localStorage.getItem('token')
  },
  
  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getToken()
  },
  
  // Logout user
  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
  
  // Get authorization header for API calls
  getAuthHeader() {
    const token = this.getToken()
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  },
  
  // Make authenticated API call
  async fetchWithAuth(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...options.headers
    }
    
    const response = await fetch(url, {
      ...options,
      headers
    })
    
    // If unauthorized, logout and redirect
    if (response.status === 401 || response.status === 403) {
      this.logout()
      window.location.href = '/login'
    }
    
    return response
  }
}

export default auth