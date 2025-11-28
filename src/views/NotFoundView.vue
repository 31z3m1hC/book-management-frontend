<template>
  <div class="not-found">
    <div class="content">
      <div class="error-code">404</div>
      <h1>Page Not Found</h1>
      <p class="message">
        Oops! The page you're looking for doesn't exist.
      </p>
      <div class="actions">
        <button @click="goHome" class="btn-primary">
          Go to Home
        </button>
        <button @click="goBack" class="btn-secondary">
          Go Back
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundView',
  methods: {
    goHome() {
      this.$router.push({ name: 'home' });
    },
    goBack() {
      this.$router.go(-1);
    }
  }
}
</script>

<style scoped>
.not-found {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.content {
  text-align: center;
  color: white;
  max-width: 500px;
}

.error-code {
  font-size: 8rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 20px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 15px;
  font-weight: 700;
}

.message {
  font-size: 1.1rem;
  margin-bottom: 30px;
  opacity: 0.9;
}

.actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #ffc107;
  color: #000;
}

.btn-primary:hover {
  background: #90ee90;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
}

.btn-secondary:hover {
  background: white;
  color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

@media (max-width: 600px) {
  .error-code {
    font-size: 5rem;
  }
  
  h1 {
    font-size: 2rem;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>