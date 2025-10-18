<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Loading State -->
      <div v-if="loading" class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p class="mt-4 text-gray-600">Verifying your link...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-lg shadow-xl p-8">
        <div class="text-center">
          <svg class="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <h2 class="mt-4 text-2xl font-bold text-gray-900">Invalid or Expired Link</h2>
          <p class="mt-2 text-gray-600">{{ error }}</p>
          <router-link to="/login" class="mt-6 inline-block btn btn-primary">
            Go to Login
          </router-link>
        </div>
      </div>

      <!-- Password Setup Form -->
      <div v-else-if="user" class="bg-white rounded-lg shadow-xl p-8">
        <div class="text-center mb-8">
          <h2 class="text-3xl font-bold text-gray-900">Welcome, {{ user.name }}!</h2>
          <p class="mt-2 text-gray-600">Set up your password to confirm your order</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Email (Read-only) -->
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              v-model="user.email"
              type="email"
              disabled
              class="form-input bg-gray-50 cursor-not-allowed"
            />
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Create Password *
            </label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              minlength="8"
              class="form-input"
              placeholder="Enter your password (min. 8 characters)"
              :class="{ 'border-red-500': passwordError }"
            />
            <p v-if="passwordError" class="mt-1 text-sm text-red-600">{{ passwordError }}</p>
            <p class="mt-1 text-xs text-gray-500">Password must be at least 8 characters long</p>
          </div>

          <!-- Confirm Password -->
          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <input
              id="confirmPassword"
              v-model="form.confirmPassword"
              type="password"
              required
              minlength="8"
              class="form-input"
              placeholder="Re-enter your password"
              :class="{ 'border-red-500': confirmPasswordError }"
            />
            <p v-if="confirmPasswordError" class="mt-1 text-sm text-red-600">{{ confirmPasswordError }}</p>
          </div>

          <!-- Submit Button -->
          <div>
            <button
              type="submit"
              :disabled="submitting || !isFormValid"
              class="w-full btn btn-primary py-3 text-base"
            >
              <span v-if="submitting" class="flex items-center justify-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Setting up...
              </span>
              <span v-else>Set Password & Continue</span>
            </button>
          </div>
        </form>

        <!-- Security Note -->
        <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div class="flex items-start">
            <svg class="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
            </svg>
            <div>
              <p class="text-sm font-medium text-blue-900">Secure Setup</p>
              <p class="text-xs text-blue-700 mt-1">Your password will be encrypted and stored securely. After setting your password, you'll be able to confirm your order.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(true)
const submitting = ref(false)
const error = ref(null)
const user = ref(null)
const passwordError = ref(null)
const confirmPasswordError = ref(null)

const form = ref({
  password: '',
  confirmPassword: ''
})

const isFormValid = computed(() => {
  return form.value.password.length >= 8 && 
         form.value.confirmPassword.length >= 8 &&
         form.value.password === form.value.confirmPassword
})

const verifyMagicLink = async () => {
  const token = route.params.token
  
  if (!token) {
    error.value = 'No verification token provided'
    loading.value = false
    return
  }

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/auth/verify-magic-link/${token}`
    )
    
    if (response.data.valid) {
      user.value = response.data.user
    } else {
      error.value = 'Invalid verification link'
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'This link is invalid or has expired. Please contact support.'
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  // Reset errors
  passwordError.value = null
  confirmPasswordError.value = null

  // Validate password
  if (form.value.password.length < 8) {
    passwordError.value = 'Password must be at least 8 characters long'
    return
  }

  // Validate password match
  if (form.value.password !== form.value.confirmPassword) {
    confirmPasswordError.value = 'Passwords do not match'
    return
  }

  submitting.value = true

  try {
    const response = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/auth/setup-password`,
      {
        token: route.params.token,
        password: form.value.password,
        confirmPassword: form.value.confirmPassword
      }
    )

    // Store auth data
    authStore.user = response.data.user
    authStore.token = response.data.token
    localStorage.setItem('user', JSON.stringify(response.data.user))
    localStorage.setItem('token', response.data.token)

    // Redirect to order approval if order ID is in query
    const orderId = route.query.order
    if (orderId) {
      router.push(`/orders/${orderId}/approve`)
    } else {
      router.push('/dashboard')
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to set up password. Please try again.'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  verifyMagicLink()
})
</script>

<style scoped>
.form-input {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm;
}

.btn {
  @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>

