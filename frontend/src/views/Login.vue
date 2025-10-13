<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-6 sm:space-y-8">
      <div>
        <h2 class="mt-6 text-center text-2xl sm:text-3xl font-extrabold text-gray-900">
          Srijani Order Portal
        </h2>
        <p class="mt-2 text-center text-sm sm:text-base text-gray-600">
          Sign in to your account
        </p>
      </div>
      
      <form class="mt-6 sm:mt-8 space-y-4 sm:space-y-6" @submit.prevent="handleLogin">
        <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded text-sm sm:text-base">
          {{ authStore.error }}
        </div>
        
        <div class="rounded-md shadow-sm space-y-3 sm:space-y-4">
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
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              required
              class="input"
              placeholder="Enter your password"
            />
          </div>
        </div>
        
        <div>
          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full btn btn-primary"
          >
            <span v-if="!authStore.loading">Sign in</span>
            <span v-else class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </span>
          </button>
        </div>
        
        <div class="text-center text-xs sm:text-sm">
          <span class="text-gray-600">Don't have an account?</span>
          <router-link to="/register" class="ml-1 font-medium text-primary-600 hover:text-primary-500 transition-colors">
            Register here
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const form = ref({
  email: '',
  password: ''
});

const handleLogin = async () => {
  const success = await authStore.login(form.value);
  if (success) {
    if (authStore.isAdmin) {
      router.push('/admin/dashboard');
    } else {
      router.push('/dashboard');
    }
  }
};
</script>

