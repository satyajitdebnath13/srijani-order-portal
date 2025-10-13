<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Top Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-2xl font-bold text-primary-600">Srijani</h1>
            <div class="hidden md:ml-10 md:flex md:space-x-8">
              <router-link 
                to="/dashboard" 
                :class="['nav-link', { 'nav-link-active': $route.path === '/dashboard' }]"
              >
                Dashboard
              </router-link>
              <router-link 
                to="/orders" 
                :class="['nav-link', { 'nav-link-active': $route.path.startsWith('/orders') }]"
              >
                My Orders
              </router-link>
              <router-link 
                to="/support" 
                :class="['nav-link', { 'nav-link-active': $route.path.startsWith('/support') }]"
              >
                Support
              </router-link>
              <router-link 
                to="/returns" 
                :class="['nav-link', { 'nav-link-active': $route.path.startsWith('/returns') }]"
              >
                Returns
              </router-link>
            </div>
          </div>
          
          <div class="flex items-center space-x-4">
            <router-link to="/profile" class="text-gray-700 hover:text-primary-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </router-link>
            <button @click="handleLogout" class="text-gray-700 hover:text-primary-600">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <router-view />
    </main>
    
    <!-- Footer -->
    <footer class="bg-white border-t mt-12">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 class="font-semibold mb-2">Legal</h3>
            <div class="space-y-2 text-sm text-gray-600">
              <router-link to="/legal/terms" class="block hover:text-primary-600">Terms & Conditions</router-link>
              <router-link to="/legal/privacy" class="block hover:text-primary-600">Privacy Policy</router-link>
              <router-link to="/legal/returns" class="block hover:text-primary-600">Return Policy</router-link>
              <router-link to="/legal/shipping" class="block hover:text-primary-600">Shipping Policy</router-link>
            </div>
          </div>
          <div>
            <h3 class="font-semibold mb-2">Belgium Office</h3>
            <p class="text-sm text-gray-600">Your Belgium Address</p>
          </div>
          <div>
            <h3 class="font-semibold mb-2">India Office</h3>
            <p class="text-sm text-gray-600">Your India Address</p>
          </div>
        </div>
        <div class="mt-6 pt-6 border-t text-center text-sm text-gray-500">
          &copy; {{ new Date().getFullYear() }} Srijani. All rights reserved.
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.nav-link {
  @apply inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-gray-700 hover:text-primary-600 hover:border-primary-300 transition-colors duration-200;
}

.nav-link-active {
  @apply border-primary-600 text-primary-600 font-medium;
}
</style>

