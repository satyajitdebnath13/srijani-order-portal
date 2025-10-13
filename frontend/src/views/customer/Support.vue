<template>
  <div class="support-page">
    <div class="page-header">
      <h1 class="text-3xl font-bold text-gray-900">Support Center</h1>
      <p class="text-gray-600">Get help with your orders and account</p>
    </div>

    <div class="mt-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-900">My Support Tickets</h2>
        <router-link 
          to="/support/create" 
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Ticket
        </router-link>
      </div>

      <div v-if="tickets.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No support tickets yet</h3>
        <p class="mt-1 text-sm text-gray-500">Get started by creating a new support ticket.</p>
        <div class="mt-6">
          <router-link 
            to="/support/create" 
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Create Support Ticket
          </router-link>
        </div>
      </div>

      <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
        <ul class="divide-y divide-gray-200">
          <li v-for="ticket in tickets" :key="ticket.id">
            <div class="px-4 py-4 sm:px-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Ticket #{{ ticket.id }}
                    </span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ ticket.subject }}
                    </div>
                    <div class="text-sm text-gray-500">
                      Created {{ formatDate(ticket.createdAt) }}
                    </div>
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <div class="text-right">
                    <span :class="getPriorityClass(ticket.priority)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ ticket.priority }}
                    </span>
                    <div class="mt-1">
                      <span :class="getStatusClass(ticket.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                        {{ ticket.status }}
                      </span>
                    </div>
                  </div>
                  <router-link 
                    :to="`/support/${ticket.id}`" 
                    class="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    View Details
                  </router-link>
                </div>
              </div>
              <div class="mt-2">
                <div class="text-sm text-gray-600">
                  {{ ticket.description.substring(0, 100) }}{{ ticket.description.length > 100 ? '...' : '' }}
                </div>
                <div v-if="ticket.lastMessage" class="text-sm text-gray-500 mt-1">
                  Last message: {{ formatDate(ticket.lastMessage) }}
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Quick Help Section -->
    <div class="mt-8">
      <h2 class="text-xl font-semibold text-gray-900 mb-4">Quick Help</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Order Issues</h3>
          <p class="text-gray-600 text-sm mb-4">Having trouble with your order? Check order status or request changes.</p>
          <router-link to="/orders" class="text-blue-600 hover:text-blue-900 text-sm font-medium">
            View Orders →
          </router-link>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Returns & Exchanges</h3>
          <p class="text-gray-600 text-sm mb-4">Need to return or exchange an item? Start the return process.</p>
          <router-link to="/returns" class="text-blue-600 hover:text-blue-900 text-sm font-medium">
            Manage Returns →
          </router-link>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <h3 class="text-lg font-medium text-gray-900 mb-2">Account Help</h3>
          <p class="text-gray-600 text-sm mb-4">Update your profile, change password, or manage addresses.</p>
          <router-link to="/profile" class="text-blue-600 hover:text-blue-900 text-sm font-medium">
            Manage Profile →
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const tickets = ref([])

const getStatusClass = (status) => {
  const classes = {
    'open': 'bg-green-100 text-green-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'resolved': 'bg-gray-100 text-gray-800',
    'closed': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getPriorityClass = (priority) => {
  const classes = {
    'low': 'bg-green-100 text-green-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-red-100 text-red-800'
  }
  return classes[priority] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const loadTickets = async () => {
  try {
    const response = await supportAPI.getCustomerTickets()
    tickets.value = response.data.tickets
  } catch (error) {
    console.error('Error loading tickets:', error)
  }
}

onMounted(() => {
  loadTickets()
})
</script>

<style scoped>
.support-page {
  @apply p-6;
}
</style>
