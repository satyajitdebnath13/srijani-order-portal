import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useServerStatusStore = defineStore('serverStatus', () => {
  const isWakingUp = ref(false)
  const isConnected = ref(false)
  const retryCount = ref(0)
  const statusMessage = ref('')
  const showOverlay = ref(false)

  const setWakingUp = (message = 'Connecting to server...') => {
    isWakingUp.value = true
    isConnected.value = false
    statusMessage.value = message
    showOverlay.value = true
  }

  const setConnected = () => {
    isWakingUp.value = false
    isConnected.value = true
    statusMessage.value = 'Connected!'
    // Keep overlay visible for a moment to show success
    setTimeout(() => {
      showOverlay.value = false
    }, 800)
  }

  const setRetrying = (attempt, maxAttempts) => {
    retryCount.value = attempt
    statusMessage.value = `Server is starting up... (Attempt ${attempt}/${maxAttempts})`
  }

  const setError = (message = 'Unable to connect to server') => {
    isWakingUp.value = false
    isConnected.value = false
    statusMessage.value = message
    showOverlay.value = true
  }

  const hideOverlay = () => {
    showOverlay.value = false
  }

  const reset = () => {
    isWakingUp.value = false
    isConnected.value = false
    retryCount.value = 0
    statusMessage.value = ''
    showOverlay.value = false
  }

  return {
    isWakingUp,
    isConnected,
    retryCount,
    statusMessage,
    showOverlay,
    setWakingUp,
    setConnected,
    setRetrying,
    setError,
    hideOverlay,
    reset
  }
})

