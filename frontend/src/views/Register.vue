<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-6 sm:space-y-8">
      <div>
        <h2 class="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
        <p class="mt-2 text-center text-sm sm:text-base text-gray-600">
          Join Srijani Order Portal
        </p>
      </div>
      
      <form class="mt-6 sm:mt-8 space-y-4 sm:space-y-6" @submit.prevent="handleRegister">
        <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded text-sm sm:text-base">
          {{ authStore.error }}
        </div>
        
        <div class="space-y-3 sm:space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              class="input"
              placeholder="Enter your full name"
            />
          </div>
          
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              class="input"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              required
              class="input"
              placeholder="Enter your phone number"
            />
          </div>
          
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              minlength="8"
              class="input"
              placeholder="At least 8 characters"
            />
          </div>
          
          <div>
            <label for="confirm-password" class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              id="confirm-password"
              v-model="form.confirmPassword"
              type="password"
              required
              class="input"
              placeholder="Re-enter your password"
            />
          </div>
        </div>
        
        <div v-if="passwordError" class="text-red-600 text-sm">
          {{ passwordError }}
        </div>
        
        <div>
          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full btn btn-primary"
          >
            <span v-if="!authStore.loading">Create Account</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </span>
          </button>
        </div>
        
        <div class="text-center text-xs sm:text-sm">
          <span class="text-gray-600">Already have an account?</span>
          <router-link to="/login" class="ml-1 font-medium text-primary-600 hover:text-primary-500 transition-colors">
            Sign in here
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const form = ref({
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
});

const passwordError = computed(() => {
  if (form.value.password && form.value.confirmPassword) {
    if (form.value.password !== form.value.confirmPassword) {
      return 'Passwords do not match';
    }
  }
  return null;
});

const handleRegister = async () => {
  if (passwordError.value) {
    return;
  }
  
  const { confirmPassword, ...registerData } = form.value;
  const success = await authStore.register(registerData);
  
  if (success) {
    router.push('/dashboard');
  }
};
</script>

