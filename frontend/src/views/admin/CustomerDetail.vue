<template>
  <div class="admin-component">
    <div class="p-6" v-if="customer">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Customer Details</h1>
          <p class="text-gray-600 mt-1">{{ customer.user?.name || 'Unknown' }} ({{ customer.user?.email || 'No email' }})</p>
        </div>
        <router-link to="/admin/customers" class="btn btn-secondary">
          ← Back to Customers
        </router-link>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          @click="sendPasswordReset"
          :disabled="sendingReset"
          class="btn btn-primary"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
          </svg>
          {{ sendingReset ? 'Sending...' : 'Send Password Reset' }}
        </button>
        <router-link :to="`/admin/orders/create?customer=${customer.id}`" class="btn btn-primary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Create New Order
        </router-link>
        <button class="btn btn-secondary">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
          Send Email
        </button>
      </div>

      <!-- Customer Information -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- Account Info -->
        <div class="card">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">Account Information</h2>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-500">Name</label>
              <p class="text-gray-900">{{ customer.user.name }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Email</label>
              <p class="text-gray-900">{{ customer.user.email }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Phone</label>
              <p class="text-gray-900">{{ customer.user.phone || 'Not provided' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">WhatsApp</label>
              <p class="text-gray-900">{{ customer.whatsapp_number || 'Not provided' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Language Preference</label>
              <p class="text-gray-900">{{ customer.language_preference?.toUpperCase() || 'EN' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Account Status</label>
              <span :class="customer.user?.is_active ? 'text-green-600' : 'text-red-600'" class="font-medium">
                {{ customer.user?.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Email Verified</label>
              <span :class="customer.user?.email_verified ? 'text-green-600' : 'text-yellow-600'" class="font-medium">
                {{ customer.user?.email_verified ? 'Yes' : 'No' }}
              </span>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Member Since</label>
              <p class="text-gray-900">{{ formatDate(customer.user?.created_at) }}</p>
            </div>
            <div v-if="customer.user?.last_login">
              <label class="text-sm font-medium text-gray-500">Last Login</label>
              <p class="text-gray-900">{{ formatDate(customer.user.last_login) }}</p>
            </div>
          </div>
        </div>

        <!-- Business Info -->
        <div class="card">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">Business Information</h2>
          </div>
          <div class="p-6 space-y-4">
            <div>
              <label class="text-sm font-medium text-gray-500">Company Name</label>
              <p class="text-gray-900">{{ customer.company_name || 'Not provided' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">VAT Number</label>
              <p class="text-gray-900">{{ customer.vat_number || 'Not provided' }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Total Orders</label>
              <p class="text-2xl font-bold text-primary-600">{{ customer.total_orders || 0 }}</p>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Total Spent</label>
              <p class="text-2xl font-bold text-green-600">€{{ parseFloat(customer.total_spent || 0).toFixed(2) }}</p>
            </div>
            <div v-if="customer.customer_notes">
              <label class="text-sm font-medium text-gray-500">Internal Notes</label>
              <p class="text-gray-900 text-sm bg-yellow-50 p-3 rounded">{{ customer.customer_notes }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Order History -->
      <div class="card mb-6">
        <div class="p-6 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-900">Order History</h2>
            <div class="flex gap-2">
              <button
                v-for="filter in orderFilters"
                :key="filter.value"
                @click="selectedOrderFilter = filter.value"
                :class="[
                  'px-3 py-1 text-sm font-medium rounded-lg transition-colors',
                  selectedOrderFilter === filter.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                ]"
              >
                {{ filter.label }}
                <span v-if="filter.value !== 'all'" class="ml-1 text-xs">
                  ({{ getOrderCountByStatus(filter.value) }})
                </span>
              </button>
            </div>
          </div>
        </div>
        <div v-if="loadingOrders" class="p-6 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
        <div v-else-if="filteredOrders.length === 0" class="p-6 text-center text-gray-500">
          No orders found{{ selectedOrderFilter !== 'all' ? ' with this status' : '' }}.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order #</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr 
                v-for="order in filteredOrders" 
                :key="order.id" 
                :class="[
                  'hover:bg-gray-50 transition-colors',
                  order.status === 'pending_approval' ? 'bg-yellow-50 border-l-4 border-yellow-400' : ''
                ]"
              >
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ order.order_number }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(order.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(order.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ formatStatus(order.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  €{{ parseFloat(order.total_amount).toFixed(2) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <router-link :to="`/admin/orders/${order.id}`" class="text-primary-600 hover:text-primary-900">
                    View Details →
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Support Tickets -->
      <div class="card">
        <div class="p-6 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">Support Tickets</h2>
        </div>
        <div v-if="loadingTickets" class="p-6 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
        <div v-else-if="tickets.length === 0" class="p-6 text-center text-gray-500">
          No support tickets found for this customer.
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ticket #</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="ticket in tickets" :key="ticket.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{{ ticket.ticket_number }}
                </td>
                <td class="px-6 py-4 text-sm text-gray-900">
                  {{ ticket.subject }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getTicketStatusClass(ticket.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                    {{ ticket.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(ticket.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <router-link :to="`/admin/support/${ticket.id}`" class="text-primary-600 hover:text-primary-900">
                    View →
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class="card border-2 border-red-200 mt-6">
        <div class="p-6 border-b border-red-200 bg-red-50">
          <h2 class="text-xl font-semibold text-red-900 flex items-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
            Danger Zone
          </h2>
        </div>
        <div class="p-6">
          <div class="bg-white rounded-lg border border-red-200 p-4">
            <h3 class="text-lg font-semibold text-gray-900 mb-2">Deactivate Customer Account</h3>
            <p class="text-gray-600 mb-4">
              This will deactivate the customer account. The customer will no longer be able to log in, 
              but all order history and data will be preserved for record-keeping purposes.
            </p>
            <div class="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
              <p class="text-sm text-yellow-800">
                <strong>⚠️ Warning:</strong> This action will:
              </p>
              <ul class="list-disc list-inside text-sm text-yellow-800 mt-2 space-y-1">
                <li>Prevent the customer from logging in</li>
                <li>Hide the customer from the active customer list</li>
                <li>Preserve all order and support ticket history</li>
                <li>Can be reversed by reactivating the account</li>
              </ul>
            </div>
            <button
              @click="showDeleteModal = true"
              class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center"
            >
              <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
              Deactivate Customer Account
            </button>
          </div>
        </div>
      </div>

      <!-- Password Reset Modal -->
      <div v-if="showResetModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-4">Password Reset Link</h3>
          <p class="text-gray-600 mb-4">
            Password reset link has been sent to <strong>{{ customer.user.email }}</strong>
          </p>
          <div class="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
            <p class="text-sm text-blue-900 font-medium mb-2">Copy link for WhatsApp:</p>
            <input
              :value="resetLink"
              readonly
              class="w-full text-xs font-mono bg-white border border-blue-300 rounded px-2 py-1 mb-2"
              ref="resetLinkInput"
            />
            <button @click="copyResetLink" class="btn btn-primary btn-sm w-full">
              📋 Copy Link
            </button>
          </div>
          <button @click="showResetModal = false" class="btn btn-secondary w-full">
            Close
          </button>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
            <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-4 text-center">Deactivate Customer Account?</h3>
          <p class="text-gray-600 mb-4 text-center">
            Are you sure you want to deactivate <strong>{{ customer.user.name }}</strong>'s account?
          </p>
          <div class="bg-red-50 border border-red-200 rounded p-3 mb-4">
            <p class="text-sm text-red-800">
              <strong>This will:</strong>
            </p>
            <ul class="list-disc list-inside text-sm text-red-800 mt-2 space-y-1">
              <li>Deactivate the customer account immediately</li>
              <li>Prevent {{ customer.user.name }} from logging in</li>
              <li>Preserve all order and ticket history</li>
            </ul>
          </div>
          <div class="mb-4">
            <label class="flex items-center">
              <input
                type="checkbox"
                v-model="deleteConfirmed"
                class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <span class="ml-2 text-sm text-gray-700">
                I understand this action will deactivate the customer account
              </span>
            </label>
          </div>
          <div class="flex gap-3">
            <button
              @click="showDeleteModal = false; deleteConfirmed = false"
              class="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
              :disabled="deleting"
            >
              Cancel
            </button>
            <button
              @click="handleDeleteCustomer"
              :disabled="!deleteConfirmed || deleting"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ deleting ? 'Deactivating...' : 'Deactivate Account' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="loading" class="p-6 text-center text-gray-600">
      Loading customer details...
    </div>

    <div v-else class="p-6 text-center text-red-600">
      Customer not found or an error occurred.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { format } from 'date-fns'

const route = useRoute()
const customer = ref(null)
const orders = ref([])
const tickets = ref([])
const loading = ref(true)
const loadingOrders = ref(false)
const loadingTickets = ref(false)
const sendingReset = ref(false)
const showResetModal = ref(false)
const resetLink = ref('')
const resetLinkInput = ref(null)
const showDeleteModal = ref(false)
const deleteConfirmed = ref(false)
const deleting = ref(false)
const selectedOrderFilter = ref('all')

// Order filter options
const orderFilters = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending_approval' },
  { label: 'Confirmed', value: 'confirmed' },
  { label: 'In Production', value: 'in_production' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' }
]

// Computed: Filtered orders based on selected filter
const filteredOrders = computed(() => {
  if (selectedOrderFilter.value === 'all') {
    return orders.value
  }
  return orders.value.filter(order => order.status === selectedOrderFilter.value)
})

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const fetchCustomerDetails = async () => {
  try {
    loading.value = true
    const token = localStorage.getItem('token')
    
    // Fetch customer details using the customer detail endpoint
    const response = await axios.get(`${API_URL}/auth/customers/${route.params.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    customer.value = response.data.customer
    
    if (customer.value) {
      fetchOrders()
      fetchTickets()
    }
  } catch (error) {
    console.error('Error fetching customer:', error)
  } finally {
    loading.value = false
  }
}

const fetchOrders = async () => {
  loadingOrders.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/orders`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { customer_id: customer.value.id }
    })
    orders.value = response.data.orders || []
  } catch (error) {
    console.error('Error fetching orders:', error)
  } finally {
    loadingOrders.value = false
  }
}

const fetchTickets = async () => {
  loadingTickets.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/support`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { customer_id: customer.value.id }
    })
    tickets.value = response.data.tickets || []
  } catch (error) {
    console.error('Error fetching tickets:', error)
  } finally {
    loadingTickets.value = false
  }
}

const sendPasswordReset = async () => {
  if (!confirm(`Send password reset link to ${customer.value.user.email}?`)) return
  
  sendingReset.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await axios.post(
      `${API_URL}/auth/send-password-reset/${customer.value.user.id}`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )
    
    resetLink.value = response.data.resetUrl
    showResetModal.value = true
    alert('Password reset link sent successfully!')
  } catch (error) {
    console.error('Error sending password reset:', error)
    alert('Failed to send password reset link')
  } finally {
    sendingReset.value = false
  }
}

const copyResetLink = async () => {
  try {
    await navigator.clipboard.writeText(resetLink.value)
    alert('Link copied to clipboard!')
  } catch (err) {
    resetLinkInput.value.select()
    document.execCommand('copy')
    alert('Link copied to clipboard!')
  }
}

const formatDate = (date) => {
  if (!date) return 'Never'
  try {
    return format(new Date(date), 'PPP')
  } catch (error) {
    return 'Invalid date'
  }
}

const formatStatus = (status) => {
  return status.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

const getStatusClass = (status) => {
  const classes = {
    'pending_approval': 'bg-yellow-100 text-yellow-800',
    'confirmed': 'bg-blue-100 text-blue-800',
    'in_production': 'bg-purple-100 text-purple-800',
    'shipped': 'bg-indigo-100 text-indigo-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getTicketStatusClass = (status) => {
  const classes = {
    'open': 'bg-yellow-100 text-yellow-800',
    'in_progress': 'bg-blue-100 text-blue-800',
    'resolved': 'bg-green-100 text-green-800',
    'closed': 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const getOrderCountByStatus = (status) => {
  return orders.value.filter(order => order.status === status).length
}

const handleDeleteCustomer = async () => {
  if (!deleteConfirmed.value) return
  
  deleting.value = true
  try {
    const token = localStorage.getItem('token')
    await axios.delete(`${API_URL}/auth/customers/${customer.value.user.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    alert(`Customer account for ${customer.value.user.name} has been deactivated successfully.`)
    
    // Redirect to customers list
    window.location.href = '/admin/customers'
  } catch (error) {
    console.error('Error deactivating customer:', error)
    alert('Failed to deactivate customer account. Please try again.')
  } finally {
    deleting.value = false
    showDeleteModal.value = false
    deleteConfirmed.value = false
  }
}

onMounted(() => {
  fetchCustomerDetails()
})
</script>

<style scoped>
.admin-component {
  @apply min-h-screen bg-gray-50;
}

.card {
  @apply bg-white shadow rounded-lg;
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

.btn-sm {
  @apply px-3 py-1 text-xs;
}
</style>

