<template>
  <div class="support-detail-page">
    <div class="page-header">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Support Ticket #{{ ticketId }}</h1>
          <p class="text-gray-600">{{ ticket?.subject }}</p>
        </div>
        <router-link 
          to="/support" 
          class="text-blue-600 hover:text-blue-900 text-sm font-medium"
        >
          ← Back to Support
        </router-link>
      </div>
    </div>

    <div v-if="ticket" class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Ticket Messages -->
      <div class="lg:col-span-2">
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Conversation</h2>
          </div>
          <div class="p-6">
            <div class="space-y-6">
              <div v-for="message in messages" :key="message.id" class="flex">
                <div class="flex-shrink-0">
                  <div :class="message.sender === 'customer' ? 'bg-blue-500' : 'bg-gray-500'" class="h-8 w-8 rounded-full flex items-center justify-center">
                    <span class="text-white text-sm font-medium">
                      {{ message.sender === 'customer' ? 'C' : 'S' }}
                    </span>
                  </div>
                </div>
                <div class="ml-4 flex-1">
                  <div class="flex items-center justify-between">
                    <h3 class="text-sm font-medium text-gray-900">
                      {{ message.sender === 'customer' ? 'You' : 'Support Team' }}
                    </h3>
                    <p class="text-sm text-gray-500">{{ formatDate(message.timestamp) }}</p>
                  </div>
                  <div class="mt-1 text-sm text-gray-700">
                    <p>{{ message.content }}</p>
                  </div>
                  <div v-if="message.attachments && message.attachments.length > 0" class="mt-2">
                    <div class="text-xs text-gray-500">Attachments:</div>
                    <div class="space-y-1">
                      <div v-for="attachment in message.attachments" :key="attachment.id" class="text-sm text-blue-600 hover:text-blue-800">
                        <a :href="attachment.url" target="_blank">{{ attachment.name }}</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reply Form -->
        <div class="mt-6 bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Reply</h2>
          </div>
          <div class="p-6">
            <form @submit.prevent="sendReply" class="space-y-4">
              <div>
                <label for="reply" class="block text-sm font-medium text-gray-700">Message</label>
                <textarea 
                  id="reply" 
                  v-model="replyForm.content" 
                  rows="4"
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Type your message here..."
                ></textarea>
              </div>
              <div class="flex justify-end">
                <button 
                  type="submit" 
                  :disabled="loading"
                  class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {{ loading ? 'Sending...' : 'Send Reply' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Ticket Information -->
      <div class="space-y-6">
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Ticket Details</h2>
          </div>
          <div class="p-6">
            <dl class="space-y-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Ticket ID</dt>
                <dd class="text-sm text-gray-900">{{ ticket.id }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Status</dt>
                <dd>
                  <span :class="getStatusClass(ticket.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ ticket.status }}
                  </span>
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Priority</dt>
                <dd>
                  <span :class="getPriorityClass(ticket.priority)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ ticket.priority }}
                  </span>
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Category</dt>
                <dd class="text-sm text-gray-900">{{ ticket.category }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Created</dt>
                <dd class="text-sm text-gray-900">{{ formatDate(ticket.createdAt) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd class="text-sm text-gray-900">{{ formatDate(ticket.updatedAt) }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div v-if="ticket.relatedOrder" class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Related Order</h2>
          </div>
          <div class="p-6">
            <div class="text-sm">
              <p class="text-gray-900 font-medium">Order #{{ ticket.relatedOrder.id }}</p>
              <p class="text-gray-600">{{ formatDate(ticket.relatedOrder.createdAt) }}</p>
              <p class="text-gray-600">Total: ${{ ticket.relatedOrder.total }}</p>
            </div>
            <div class="mt-4">
              <router-link 
                :to="`/orders/${ticket.relatedOrder.id}`" 
                class="text-blue-600 hover:text-blue-900 text-sm font-medium"
              >
                View Order Details →
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="mt-6 text-center py-12">
      <div class="text-gray-500">Loading ticket details...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const ticketId = route.params.id
const ticket = ref(null)
const messages = ref([])
const loading = ref(false)

const replyForm = ref({
  content: ''
})

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

const loadTicketDetails = async () => {
  try {
    const response = await supportAPI.getById(ticketId)
    ticket.value = response.data.ticket
    messages.value = response.data.messages
  } catch (error) {
    console.error('Error loading ticket details:', error)
  }
}

const sendReply = async () => {
  if (!replyForm.value.content.trim()) return

  loading.value = true
  
  try {
    // TODO: Implement API call to send reply
    console.log('Sending reply:', replyForm.value.content)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Add message to local state
    messages.value.push({
      id: messages.value.length + 1,
      sender: 'customer',
      content: replyForm.value.content,
      timestamp: new Date().toISOString(),
      attachments: []
    })
    
    // Clear form
    replyForm.value.content = ''
  } catch (error) {
    console.error('Error sending reply:', error)
    alert('Failed to send reply. Please try again.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadTicketDetails()
})
</script>

<style scoped>
.support-detail-page {
  @apply p-6;
}
</style>
