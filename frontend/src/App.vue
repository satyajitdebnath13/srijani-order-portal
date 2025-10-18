<template>
  <div>
    <!-- Server Wakeup Overlay -->
    <ServerWakeupOverlay />
    
    <!-- Main App Content -->
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { performHealthCheck } from '@/services/api';
import ServerWakeupOverlay from '@/components/ServerWakeupOverlay.vue';

const authStore = useAuthStore();

onMounted(async () => {
  // Perform health check to wake up server proactively
  // Only in production (when using remote backend)
  const isProduction = import.meta.env.VITE_API_URL && 
                       import.meta.env.VITE_API_URL.includes('render.com');
  
  if (isProduction) {
    await performHealthCheck();
  }
  
  // Fetch user data if authenticated
  if (authStore.isAuthenticated) {
    authStore.fetchUser();
  }
});
</script>

