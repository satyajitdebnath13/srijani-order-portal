<template>
  <div class="admin-returns-page">
    <div class="page-header">
      <h1 class="text-3xl font-bold text-gray-900">Return Management</h1>
      <p class="text-gray-600">Process and manage return requests</p>
    </div>

    <div class="mt-6">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-blue-100 rounded-lg">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Returns</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.totalReturns }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-yellow-100 rounded-lg">
              <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Pending</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.pendingReturns }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-green-100 rounded-lg">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Approved</p>
              <p class="text-2xl font-semibold text-gray-900">{{ stats.approvedReturns }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center">
            <div class="p-2 bg-purple-100 rounded-lg">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Refunded</p>
              <p class="text-2xl font-semibold text-gray-900">€{{ stats.totalRefunded }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="bg-white p-4 rounded-lg shadow mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label for="search-returns" class="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              id="search-returns"
              name="search"
              v-model="filters.search"
              type="text"
              placeholder="Search returns..."
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label for="return-status" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="return-status"
              name="status"
              v-model="filters.status"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
          <div>
            <label for="return-reason" class="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <select
              id="return-reason"
              name="reason"
              v-model="filters.reason"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Reasons</option>
              <option value="defective">Defective Product</option>
              <option value="wrong_item">Wrong Item</option>
              <option value="not_as_described">Not as Described</option>
              <option value="changed_mind">Changed Mind</option>
            </select>
          </div>
          <div class="flex items-end">
            <button
              @click="loadReturns"
              class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      <!-- Returns Table -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-semibold text-gray-900">All Return Requests</h2>
        </div>
        
        <div v-if="loading" class="p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Loading returns...</p>
        </div>

        <div v-else-if="returns.length === 0" class="p-8 text-center text-gray-500">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          <p class="mt-2">No return requests found</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Return</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="returnItem in returns" :key="returnItem.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900">{{ returnItem.return_number }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ returnItem.customer?.user?.name || 'Unknown' }}</div>
                  <div class="text-sm text-gray-500">{{ returnItem.customer?.user?.email }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ returnItem.order?.order_number || 'N/A' }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm text-gray-900">{{ returnItem.reason }}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  €{{ returnItem.refund_amount || 0 }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(returnItem.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ returnItem.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(returnItem.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <router-link :to="`/admin/returns/${returnItem.id}`" class="text-blue-600 hover:text-blue-900 mr-3">View</router-link>
                  <button v-if="returnItem.status === 'pending'" @click="approveReturn(returnItem.id)" class="text-green-600 hover:text-green-900 mr-3">Approve</button>
                  <button v-if="returnItem.status === 'pending'" @click="rejectReturn(returnItem.id)" class="text-red-600 hover:text-red-900">Reject</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { returnsAPI } from '@/services/api'

const returns = ref([])
const loading = ref(false)
const stats = ref({
  totalReturns: 0,
  pendingReturns: 0,
  approvedReturns: 0,
  totalRefunded: 0
})

const filters = ref({
  search: '',
  status: '',
  reason: ''
})

const getStatusClass = (status) => {
  const classes = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800',
    'refunded': 'bg-blue-100 text-blue-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const approveReturn = async (returnId) => {
  try {
    // In a real implementation, you'd call: await returnsAPI.updateStatus(returnId, { status: 'approved' })
    console.log('Approving return:', returnId)
    // Update local state
    const returnItem = returns.value.find(r => r.id === returnId)
    if (returnItem) {
      returnItem.status = 'approved'
      updateStats()
    }
  } catch (error) {
    console.error('Error approving return:', error)
  }
}

const rejectReturn = async (returnId) => {
  try {
    // In a real implementation, you'd call: await returnsAPI.updateStatus(returnId, { status: 'rejected' })
    console.log('Rejecting return:', returnId)
    // Update local state
    const returnItem = returns.value.find(r => r.id === returnId)
    if (returnItem) {
      returnItem.status = 'rejected'
      updateStats()
    }
  } catch (error) {
    console.error('Error rejecting return:', error)
  }
}

const updateStats = () => {
  stats.value = {
    totalReturns: returns.value.length,
    pendingReturns: returns.value.filter(r => r.status === 'pending').length,
    approvedReturns: returns.value.filter(r => r.status === 'approved').length,
    totalRefunded: returns.value.filter(r => r.status === 'refunded').reduce((sum, r) => sum + (r.refund_amount || 0), 0)
  }
}

const loadReturns = async () => {
  try {
    loading.value = true
    const response = await returnsAPI.getAll(filters.value)
    returns.value = response.data.returns || []
    
    // Calculate stats from the returns
    stats.value = {
      totalReturns: returns.value.length,
      pendingReturns: returns.value.filter(r => r.status === 'pending').length,
      approvedReturns: returns.value.filter(r => r.status === 'approved').length,
      totalRefunded: returns.value.filter(r => r.status === 'refunded').reduce((sum, r) => sum + (r.refund_amount || 0), 0)
    }
  } catch (error) {
    console.error('Error loading returns:', error)
    // Fallback to empty data if API fails
    returns.value = []
    stats.value = {
      totalReturns: 0,
      pendingReturns: 0,
      approvedReturns: 0,
      totalRefunded: 0
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadReturns()
})
</script>
