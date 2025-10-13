<template>
  <div class="returns-page">
    <div class="page-header">
      <h1 class="text-3xl font-bold text-gray-900">My Returns</h1>
      <p class="text-gray-600">Track and manage your return requests</p>
    </div>

    <div class="mt-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-900">Return Requests</h2>
        <router-link 
          to="/returns/create" 
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Return Request
        </router-link>
      </div>

      <div v-if="returns.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m5 14v-5a2 2 0 00-2-2H6a2 2 0 00-2 2v5a2 2 0 002 2h12a2 2 0 002-2z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No returns yet</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by creating a new return request.</p>
        <div class="mt-6">
          <router-link 
            to="/returns/create" 
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Create Return Request
          </router-link>
        </div>
      </div>

      <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
        <ul class="divide-y divide-gray-200">
          <li v-for="returnItem in returns" :key="returnItem.id">
            <div class="px-4 py-4 sm:px-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Return #{{ returnItem.id }}
                    </span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      Order #{{ returnItem.orderId }}
                    </div>
                    <div class="text-sm text-gray-500">
                      Created {{ formatDate(returnItem.createdAt) }}
                    </div>
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <span :class="getStatusClass(returnItem.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ returnItem.status }}
                  </span>
                  <router-link 
                    :to="`/returns/${returnItem.id}`" 
                    class="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    View Details
                  </router-link>
                </div>
              </div>
              <div class="mt-2">
                <div class="text-sm text-gray-900">
                  Reason: {{ returnItem.reason }}
                </div>
                <div v-if="returnItem.items" class="text-sm text-gray-500 mt-1">
                  {{ returnItem.items.length }} item(s)
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const returns = ref([])

const getStatusClass = (status) => {
  const classes = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'processing': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const loadReturns = async () => {
  try {
    const response = await returnsAPI.getCustomerReturns()
    returns.value = response.data.returns
  } catch (error) {
    console.error('Error loading returns:', error)
  }
}

onMounted(() => {
  loadReturns()
})
</script>

<style scoped>
.returns-page {
  @apply p-6;
}
</style>
