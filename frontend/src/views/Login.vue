<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Srijani Order Portal
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Sign in to your account
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div v-if="authStore.error" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {{ authStore.error }}
        </div>
        
        <div class="rounded-md shadow-sm space-y-4">
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
            <span v-else>Signing in...</span>
          </button>
        </div>
        
        <div class="text-center text-sm">
          <span class="text-gray-600">Don't have an account?</span>
          <router-link to="/register" class="ml-1 font-medium text-primary-600 hover:text-primary-500">
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

