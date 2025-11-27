<script setup>
import { ref } from 'vue'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useRouter } from 'vue-router'
import { hashPassword } from '@/utils/crypto'

const router = useRouter()

const id = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

const handleLogin = async () => {
  if (!id.value || !password.value) {
    error.value = 'Please enter both ID and Password'
    return
  }

  loading.value = true
  error.value = ''

  try {
    const userDocRef = doc(db, "member", "user")
    const userDocSnap = await getDoc(userDocRef)

    if (userDocSnap.exists()) {
      const data = userDocSnap.data()
      if (data.userList && Array.isArray(data.userList)) {
        const hashedPassword = await hashPassword(password.value)
        const user = data.userList.find(u => u.id === id.value && u.password === hashedPassword)
        
        if (user) {
          alert('Login Successful!')
          // Redirect to home or user page
          router.push('/')
        } else {
          error.value = 'Invalid ID or Password'
        }
      } else {
        error.value = 'System Error: User list not found'
      }
    } else {
      error.value = 'System Error: Member data not found'
    }
  } catch (e) {
    console.error("Login error:", e)
    error.value = 'Login failed: ' + e.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <h1>Login</h1>
    <div class="login-form">
      <div class="input-group">
        <label for="id">ID</label>
        <input id="id" v-model="id" type="text" placeholder="Enter ID" @keyup.enter="handleLogin" />
      </div>
      
      <div class="input-group">
        <label for="password">Password</label>
        <input id="password" v-model="password" type="password" placeholder="Enter Password" @keyup.enter="handleLogin" />
      </div>

      <button @click="handleLogin" :disabled="loading">
        {{ loading ? 'Logging in...' : 'Login' }}
      </button>

      <p v-if="error" class="error-message">{{ error }}</p>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  max-width: 400px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

label {
  font-weight: bold;
}

input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 10px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

button:hover:not(:disabled) {
  background-color: #45a049;
}

.error-message {
  color: red;
  text-align: center;
  margin-top: 10px;
}
</style>
