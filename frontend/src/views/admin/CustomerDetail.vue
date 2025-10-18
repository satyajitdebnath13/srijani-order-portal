<template>
  <div class="admin-component">
    <div class="p-6" v-if="customer">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Customer Details</h1>
          <p class="text-gray-600 mt-1">{{ customer.user.name }} ({{ customer.user.email }})</p>
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
              <span :class="customer.user.is_active ? 'text-green-600' : 'text-red-600'" class="font-medium">
                {{ customer.user.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Email Verified</label>
              <span :class="customer.user.email_verified ? 'text-green-600' : 'text-yellow-600'" class="font-medium">
                {{ customer.user.email_verified ? 'Yes' : 'No' }}
              </span>
            </div>
            <div>
              <label class="text-sm font-medium text-gray-500">Member Since</label>
              <p class="text-gray-900">{{ formatDate(customer.user.created_at) }}</p>
            </div>
            <div v-if="customer.user.last_login">
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
          <h2 class="text-xl font-semibold text-gray-900">Order History</h2>
        </div>
        <div v-if="loadingOrders" class="p-6 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
        <div v-else-if="orders.length === 0" class="p-6 text-center text-gray-500">
          No orders found for this customer.
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
              <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-50">
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
import { ref, onMounted } from 'vue'
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

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

const fetchCustomerDetails = async () => {
  try {
    loading.value = true
    const token = localStorage.getItem('token')
    
    // Fetch customer details
    const response = await axios.get(`${API_URL}/auth/customers`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { search: route.params.id }
    })
    
    // Find the specific customer
    const customers = response.data.customers
    customer.value = customers.find(c => c.id === route.params.id || c.user.id === route.params.id)
    
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
  return format(new Date(date), 'PPP')
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

