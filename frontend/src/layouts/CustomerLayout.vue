<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Top Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="container-responsive">
        <div class="flex justify-between items-center h-16">
          <!-- Logo and Mobile Menu Button -->
          <div class="flex items-center">
            <h1 class="text-xl sm:text-2xl font-bold text-primary-600">Srijani</h1>
            
            <!-- Mobile menu button -->
            <button
              @click="mobileMenuOpen = !mobileMenuOpen"
              class="ml-4 lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <!-- Desktop Navigation -->
          <div class="hidden lg:flex lg:items-center lg:space-x-8">
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
          
          <!-- User Actions -->
          <div class="flex items-center space-x-2 sm:space-x-4">
            <router-link to="/profile" class="text-gray-700 hover:text-primary-600 p-2 rounded-md hover:bg-gray-100">
              <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </router-link>
            <button @click="handleLogout" class="text-gray-700 hover:text-primary-600 p-2 rounded-md hover:bg-gray-100">
              <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <!-- Mobile Navigation Menu -->
      <div v-if="mobileMenuOpen" class="lg:hidden border-t border-gray-200 bg-white">
        <div class="container-responsive py-4 space-y-2">
          <router-link 
            to="/dashboard" 
            :class="['mobile-nav-link', { 'mobile-nav-link-active': $route.path === '/dashboard' }]"
            @click="mobileMenuOpen = false"
          >
            Dashboard
          </router-link>
          <router-link 
            to="/orders" 
            :class="['mobile-nav-link', { 'mobile-nav-link-active': $route.path.startsWith('/orders') }]"
            @click="mobileMenuOpen = false"
          >
            My Orders
          </router-link>
          <router-link 
            to="/support" 
            :class="['mobile-nav-link', { 'mobile-nav-link-active': $route.path.startsWith('/support') }]"
            @click="mobileMenuOpen = false"
          >
            Support
          </router-link>
          <router-link 
            to="/returns" 
            :class="['mobile-nav-link', { 'mobile-nav-link-active': $route.path.startsWith('/returns') }]"
            @click="mobileMenuOpen = false"
          >
            Returns
          </router-link>
        </div>
      </div>
    </nav>
    
    <!-- Main Content -->
    <main class="container-responsive py-6 sm:py-8">
      <router-view />
    </main>
    
    <!-- Footer -->
    <footer class="bg-white border-t mt-12">
      <div class="container-responsive py-6 sm:py-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <div>
            <h3 class="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Legal</h3>
            <div class="space-y-2 text-xs sm:text-sm text-gray-600">
              <router-link to="/legal/terms" class="block hover:text-primary-600 transition-colors">Terms & Conditions</router-link>
              <router-link to="/legal/privacy" class="block hover:text-primary-600 transition-colors">Privacy Policy</router-link>
              <router-link to="/legal/returns" class="block hover:text-primary-600 transition-colors">Return Policy</router-link>
              <router-link to="/legal/shipping" class="block hover:text-primary-600 transition-colors">Shipping Policy</router-link>
            </div>
          </div>
          <div>
            <h3 class="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Belgium Office</h3>
            <p class="text-xs sm:text-sm text-gray-600">Your Belgium Address</p>
          </div>
          <div>
            <h3 class="font-semibold text-sm sm:text-base mb-3 sm:mb-4">India Office</h3>
            <p class="text-xs sm:text-sm text-gray-600">Your India Address</p>
          </div>
        </div>
        <div class="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t text-center text-xs sm:text-sm text-gray-500">
          &copy; {{ new Date().getFullYear() }} Srijani. All rights reserved.
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const mobileMenuOpen = ref(false);

const handleLogout = () => {
  authStore.logout();
  router.push('/login');
};
</script>

<style scoped>
.nav-link {
  @apply inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm sm:text-base text-gray-700 hover:text-primary-600 hover:border-primary-300 transition-colors duration-200;
}

.nav-link-active {
  @apply border-primary-600 text-primary-600 font-medium;
}

.mobile-nav-link {
  @apply block px-3 py-2 text-sm text-gray-700 hover:text-primary-600 hover:bg-primary-50 rounded-md transition-colors duration-200;
}

.mobile-nav-link-active {
  @apply text-primary-600 bg-primary-50 font-medium;
}
</style>

