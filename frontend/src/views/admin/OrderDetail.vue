<template>
  <div class="admin-component">
    <div class="p-6">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p class="mt-4 text-gray-600">Loading order details...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-6">
        <p class="text-red-800">{{ error }}</p>
        <router-link to="/admin/orders" class="mt-4 inline-block btn btn-secondary">
          ← Back to Orders
        </router-link>
      </div>

      <!-- Order Details -->
      <div v-else-if="order" class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Order {{ order.order_number }}</h1>
            <p class="text-gray-600 mt-1">Created {{ formatDate(order.created_at) }}</p>
          </div>
          <router-link to="/admin/orders" class="btn btn-secondary">
            ← Back to Orders
          </router-link>
        </div>

        <!-- Status Badge -->
        <div class="flex items-center space-x-4">
          <span :class="getStatusClass(order.status)" class="px-4 py-2 rounded-full text-sm font-medium">
            {{ formatStatus(order.status) }}
          </span>
          <span class="text-sm text-gray-600">
            Total: <strong class="text-lg text-gray-900">€{{ order.total_amount }}</strong>
          </span>
        </div>

        <!-- Magic Link Section (if available) -->
        <div v-if="magicLink" class="card">
          <div class="p-6 bg-blue-50 border-l-4 border-blue-500">
            <h3 class="text-lg font-semibold text-blue-900 mb-2 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
              Customer Access Link (WhatsApp)
            </h3>
            <div class="flex items-center space-x-2 mt-3">
              <input
                :value="magicLink"
                readonly
                class="flex-1 px-3 py-2 text-sm font-mono bg-white border border-blue-300 rounded focus:outline-none"
              />
              <button @click="copyMagicLink" class="btn btn-primary">
                📋 Copy
              </button>
            </div>
            <p class="mt-2 text-sm text-blue-700">
              Customer hasn't set up their password yet. Send this link via WhatsApp.
            </p>
          </div>
        </div>

        <!-- Update Status Section -->
        <div class="card">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">Update Order Status</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>
                <select v-model="newStatus" class="form-select">
                  <option value="">Select new status...</option>
                  <option v-for="status in availableStatuses" :key="status.value" :value="status.value">
                    {{ status.label }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <input
                  v-model="statusNotes"
                  type="text"
                  class="form-input"
                  placeholder="Add notes about this status change..."
                />
              </div>
            </div>
            <button
              @click="updateStatus"
              :disabled="!newStatus || updatingStatus"
              class="mt-4 btn btn-primary"
            >
              <span v-if="updatingStatus">Updating...</span>
              <span v-else>Update Status</span>
            </button>
          </div>
        </div>

        <!-- Customer Information -->
        <div class="card">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">Customer Information</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-600">Name</p>
                <p class="font-medium text-gray-900">{{ order.customer.user.name }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-600">Email</p>
                <p class="font-medium text-gray-900">{{ order.customer.user.email }}</p>
              </div>
              <div v-if="order.customer.user.phone">
                <p class="text-sm text-gray-600">Phone</p>
                <p class="font-medium text-gray-900">{{ order.customer.user.phone }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Items -->
        <div class="card">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">Order Items</h2>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div v-for="item in order.items" :key="item.id" class="border border-gray-200 rounded-lg p-4">
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h3 class="font-medium text-gray-900">{{ item.product_name }}</h3>
                    <p v-if="item.sku" class="text-sm text-gray-600">SKU: {{ item.sku }}</p>
                    <p v-if="item.description" class="text-sm text-gray-600 mt-1">{{ item.description }}</p>
                    <div class="mt-2 flex flex-wrap gap-2">
                      <span v-if="item.size" class="text-xs bg-gray-100 px-2 py-1 rounded">Size: {{ item.size }}</span>
                      <span v-if="item.color" class="text-xs bg-gray-100 px-2 py-1 rounded">Color: {{ item.color }}</span>
                      <span v-if="item.material" class="text-xs bg-gray-100 px-2 py-1 rounded">Material: {{ item.material }}</span>
                    </div>
                  </div>
                  <div class="text-right ml-4">
                    <p class="text-sm text-gray-600">Qty: {{ item.quantity }}</p>
                    <p class="text-sm text-gray-600">€{{ item.unit_price }} each</p>
                    <p class="font-medium text-gray-900 mt-1">€{{ item.subtotal }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="mt-6 pt-4 border-t border-gray-200">
              <div class="flex justify-between items-center">
                <span class="text-lg font-semibold text-gray-900">Total Amount:</span>
                <span class="text-2xl font-bold text-primary-600">€{{ order.total_amount }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Details -->
        <div class="card">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">Additional Details</h2>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div v-if="order.payment_method">
                <p class="text-sm text-gray-600">Payment Method</p>
                <p class="font-medium text-gray-900">{{ order.payment_method }}</p>
              </div>
              <div v-if="order.estimated_delivery">
                <p class="text-sm text-gray-600">Estimated Delivery</p>
                <p class="font-medium text-gray-900">{{ formatDate(order.estimated_delivery) }}</p>
              </div>
              <div v-if="order.special_instructions" class="md:col-span-2">
                <p class="text-sm text-gray-600">Special Instructions</p>
                <p class="font-medium text-gray-900">{{ order.special_instructions }}</p>
              </div>
              <div v-if="order.internal_notes" class="md:col-span-2">
                <p class="text-sm text-gray-600">Internal Notes</p>
                <p class="font-medium text-gray-900">{{ order.internal_notes }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ordersAPI } from '@/services/api'
import { format } from 'date-fns'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref(null)
const order = ref(null)
const magicLink = ref(null)
const availableStatuses = ref([])
const newStatus = ref('')
const statusNotes = ref('')
const updatingStatus = ref(false)

const fetchOrderDetails = async () => {
  try {
    loading.value = true
    const response = await ordersAPI.getById(route.params.id)
    order.value = response.data.order
    magicLink.value = response.data.magicLink
  } catch (err) {
    error.value = err.response?.data?.error || 'Failed to load order details'
  } finally {
    loading.value = false
  }
}

const fetchStatuses = async () => {
  try {
    const response = await ordersAPI.getStatuses()
    availableStatuses.value = response.data.statuses
  } catch (err) {
    console.error('Failed to fetch statuses:', err)
  }
}

const updateStatus = async () => {
  if (!newStatus.value) return
  
  updatingStatus.value = true
  try {
    await ordersAPI.updateStatus(order.value.id, {
      status: newStatus.value,
      notes: statusNotes.value
    })
    
    alert('Order status updated successfully!')
    newStatus.value = ''
    statusNotes.value = ''
    await fetchOrderDetails()
  } catch (err) {
    alert(err.response?.data?.error || 'Failed to update status')
  } finally {
    updatingStatus.value = false
  }
}

const copyMagicLink = async () => {
  try {
    await navigator.clipboard.writeText(magicLink.value)
    alert('Magic link copied! Ready to send via WhatsApp.')
  } catch (err) {
    const textArea = document.createElement('textarea')
    textArea.value = magicLink.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    alert('Magic link copied!')
  }
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return format(new Date(date), 'PPP')
}

const formatStatus = (status) => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const getStatusClass = (statusValue) => {
  // Find the status in availableStatuses to get its color
  const status = availableStatuses.value.find(s => s.value === statusValue)
  const color = status?.color || 'gray'
  
  const colors = {
    gray: 'bg-gray-100 text-gray-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    purple: 'bg-purple-100 text-purple-800',
    pink: 'bg-pink-100 text-pink-800',
    cyan: 'bg-cyan-100 text-cyan-800',
    teal: 'bg-teal-100 text-teal-800',
    orange: 'bg-orange-100 text-orange-800',
    amber: 'bg-amber-100 text-amber-800'
  }
  return colors[color] || colors.gray
}

onMounted(() => {
  fetchOrderDetails()
  fetchStatuses()
})
</script>

<style scoped>
.admin-component {
  @apply min-h-screen bg-gray-50;
}

.card {
  @apply bg-white shadow rounded-lg;
}

.form-input,
.form-select {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm;
}

.btn {
  @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:ring-primary-500;
}
</style>
