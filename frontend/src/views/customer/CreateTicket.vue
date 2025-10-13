<template>
  <div class="create-ticket-page">
    <div class="page-header">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Create Support Ticket</h1>
          <p class="text-gray-600">Get help with your orders and account</p>
        </div>
        <router-link 
          to="/support" 
          class="text-blue-600 hover:text-blue-900 text-sm font-medium"
        >
          ← Back to Support
        </router-link>
      </div>
    </div>

    <div class="mt-6 max-w-2xl">
      <form @submit.prevent="submitTicket" class="space-y-6">
        <!-- Subject -->
        <div>
          <label for="subject" class="block text-sm font-medium text-gray-700">Subject</label>
          <input 
            type="text" 
            id="subject" 
            v-model="form.subject" 
            required
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Brief description of your issue"
          >
        </div>

        <!-- Category -->
        <div>
          <label for="category" class="block text-sm font-medium text-gray-700">Category</label>
          <select 
            id="category" 
            v-model="form.category" 
            required
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select a category...</option>
            <option value="order">Order Issues</option>
            <option value="shipping">Shipping & Delivery</option>
            <option value="returns">Returns & Exchanges</option>
            <option value="account">Account Issues</option>
            <option value="payment">Payment Issues</option>
            <option value="product">Product Questions</option>
            <option value="other">Other</option>
          </select>
        </div>

        <!-- Priority -->
        <div>
          <label for="priority" class="block text-sm font-medium text-gray-700">Priority</label>
          <select 
            id="priority" 
            v-model="form.priority" 
            required
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select priority...</option>
            <option value="low">Low - General inquiry</option>
            <option value="medium">Medium - Need assistance</option>
            <option value="high">High - Urgent issue</option>
          </select>
        </div>

        <!-- Related Order -->
        <div>
          <label for="orderId" class="block text-sm font-medium text-gray-700">Related Order (Optional)</label>
          <select 
            id="orderId" 
            v-model="form.orderId"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select an order...</option>
            <option v-for="order in orders" :key="order.id" :value="order.id">
              Order #{{ order.id }} - {{ formatDate(order.createdAt) }} - ${{ order.total }}
            </option>
          </select>
        </div>

        <!-- Description -->
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <textarea 
            id="description" 
            v-model="form.description" 
            rows="6"
            required
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Please provide detailed information about your issue..."
          ></textarea>
        </div>

        <!-- File Upload -->
        <div>
          <label for="attachments" class="block text-sm font-medium text-gray-700">Attachments (Optional)</label>
          <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div class="space-y-1 text-center">
              <svg class="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <div class="flex text-sm text-gray-600">
                <label for="attachments" class="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                  <span>Upload files</span>
                  <input id="attachments" name="attachments" type="file" class="sr-only" multiple @change="handleFileUpload">
                </label>
                <p class="pl-1">or drag and drop</p>
              </div>
              <p class="text-xs text-gray-500">PNG, JPG, PDF up to 10MB each</p>
            </div>
          </div>
        </div>

        <!-- Contact Preferences -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">Contact Preferences</label>
          <div class="space-y-2">
            <div class="flex items-center">
              <input 
                id="email-updates" 
                v-model="form.contactPreferences" 
                value="email" 
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
              <label for="email-updates" class="ml-2 text-sm text-gray-700">
                Send updates via email
              </label>
            </div>
            <div class="flex items-center">
              <input 
                id="sms-updates" 
                v-model="form.contactPreferences" 
                value="sms" 
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
              <label for="sms-updates" class="ml-2 text-sm text-gray-700">
                Send updates via SMS
              </label>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end space-x-3">
          <router-link 
            to="/support" 
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </router-link>
          <button 
            type="submit" 
            :disabled="loading"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {{ loading ? 'Creating Ticket...' : 'Create Ticket' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const loading = ref(false)
const orders = ref([])

const form = ref({
  subject: '',
  category: '',
  priority: '',
  orderId: '',
  description: '',
  attachments: [],
  contactPreferences: ['email']
})

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const handleFileUpload = (event) => {
  const files = Array.from(event.target.files)
  form.value.attachments = files
}

const loadOrders = async () => {
  try {
    const response = await ordersAPI.getCustomerOrders()
    orders.value = response.data.orders
  } catch (error) {
    console.error('Error loading orders:', error)
  }
}

const submitTicket = async () => {
  loading.value = true
  
  try {
    // TODO: Implement API call to create support ticket
    console.log('Creating support ticket:', form.value)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Redirect to support page
    router.push('/support')
  } catch (error) {
    console.error('Error creating ticket:', error)
    alert('Failed to create support ticket. Please try again.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.create-ticket-page {
  @apply p-6;
}
</style>
