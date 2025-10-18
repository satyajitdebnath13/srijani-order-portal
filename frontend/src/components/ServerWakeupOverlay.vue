<template>
  <Transition name="fade">
    <div v-if="serverStatus.showOverlay" class="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary-900/95 to-primary-800/95 backdrop-blur-sm">
      <div class="text-center px-6 py-8 max-w-md">
        <!-- Animated Icon -->
        <div class="mb-6 relative">
          <div v-if="serverStatus.isWakingUp" class="relative inline-block">
            <!-- Pulsing circles -->
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-24 h-24 rounded-full bg-white/20 animate-ping"></div>
            </div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-20 h-20 rounded-full bg-white/30 animate-pulse"></div>
            </div>
            
            <!-- Server icon -->
            <div class="relative z-10 w-16 h-16 mx-auto bg-white rounded-full flex items-center justify-center shadow-xl">
              <svg class="w-8 h-8 text-primary-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
              </svg>
            </div>
          </div>

          <!-- Success Icon -->
          <div v-else-if="serverStatus.isConnected" class="relative inline-block">
            <div class="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center shadow-xl animate-scale-in">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>

          <!-- Error Icon -->
          <div v-else class="relative inline-block">
            <div class="w-16 h-16 mx-auto bg-red-500 rounded-full flex items-center justify-center shadow-xl">
              <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
          </div>
        </div>

        <!-- Status Message -->
        <h2 class="text-2xl font-bold text-white mb-3">
          {{ serverStatus.statusMessage }}
        </h2>

        <!-- Description -->
        <p v-if="serverStatus.isWakingUp" class="text-white/80 text-sm mb-6">
          Our server is waking up to serve you better. This usually takes just a few seconds...
        </p>
        <p v-else-if="serverStatus.isConnected" class="text-white/80 text-sm mb-6">
          You're all set! Redirecting you now...
        </p>
        <p v-else class="text-white/80 text-sm mb-6">
          We're having trouble connecting. Please check your internet connection.
        </p>

        <!-- Progress Bar (only when waking up) -->
        <div v-if="serverStatus.isWakingUp" class="mb-6">
          <div class="w-full h-2 bg-white/20 rounded-full overflow-hidden">
            <div class="h-full bg-gradient-to-r from-white to-primary-200 rounded-full animate-progress"></div>
          </div>
          <p class="text-white/60 text-xs mt-2">
            Establishing secure connection...
          </p>
        </div>

        <!-- Retry Button (only on error) -->
        <button
          v-if="!serverStatus.isWakingUp && !serverStatus.isConnected"
          @click="handleRetry"
          class="px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition-colors shadow-lg"
        >
          Try Again
        </button>

        <!-- Fun fact while waiting -->
        <div v-if="serverStatus.isWakingUp && showFunFact" class="mt-8 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
          <p class="text-white/70 text-xs italic">
            💡 Did you know? We use eco-friendly servers that sleep when not in use to save energy!
          </p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useServerStatusStore } from '@/stores/serverStatus'

const serverStatus = useServerStatusStore()
const showFunFact = ref(false)

// Show fun fact after 3 seconds of waiting
onMounted(() => {
  setTimeout(() => {
    if (serverStatus.isWakingUp) {
      showFunFact.value = true
    }
  }, 3000)
})

const handleRetry = () => {
  window.location.reload()
}
</script>

<style scoped>
/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Progress bar animation */
@keyframes progress {
  0% {
    width: 0%;
  }
  50% {
    width: 70%;
  }
  100% {
    width: 100%;
  }
}

.animate-progress {
  animation: progress 3s ease-in-out infinite;
}

/* Scale in animation for success icon */
@keyframes scaleIn {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

.animate-scale-in {
  animation: scaleIn 0.5s ease-out;
}
</style>

