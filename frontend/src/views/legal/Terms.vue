<template>
  <div class="min-h-screen bg-gray-50 py-12 px-4">
    <div class="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
      <h1 class="text-3xl font-bold mb-6">Terms & Conditions</h1>
      
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p class="mt-4 text-gray-600">Loading...</p>
      </div>
      
      <!-- Content -->
      <div v-else class="prose max-w-none" v-html="content"></div>
      
      <div class="mt-8 pt-6 border-t">
        <router-link to="/" class="text-primary-600 hover:text-primary-700">
          ← Back to Home
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const loading = ref(true)
const content = ref('')
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const fetchContent = async () => {
  try {
    const response = await axios.get(`${API_URL}/settings/site/terms_and_conditions`)
    content.value = response.data.setting.setting_value || '<p>Terms & Conditions content not available.</p>'
  } catch (error) {
    console.error('Error fetching terms:', error)
    content.value = '<p>Error loading Terms & Conditions. Please try again later.</p>'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchContent()
})
</script>

<style scoped>
.prose {
  @apply text-gray-700;
}

.prose :deep(h1) {
  @apply text-3xl font-bold mb-4 mt-8;
}

.prose :deep(h2) {
  @apply text-2xl font-semibold mb-3 mt-6;
}

.prose :deep(h3) {
  @apply text-xl font-semibold mb-2 mt-4;
}

.prose :deep(p) {
  @apply mb-4;
}

.prose :deep(ul), .prose :deep(ol) {
  @apply list-disc pl-6 mb-4;
}

.prose :deep(li) {
  @apply mb-2;
}
</style>

