<template>
  <div class="admin-orders-page">
    <div class="page-header">
      <h1 class="text-3xl font-bold text-gray-900">Order Management</h1>
      <p class="text-gray-600">Manage and track all customer orders</p>
    </div>

    <div class="mt-6">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-semibold text-gray-900">All Orders</h2>
        <router-link 
          to="/admin/orders/create" 
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Order
        </router-link>
      </div>

      <!-- Filters -->
      <div class="bg-white p-4 rounded-lg shadow mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label for="order-status-filter" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select 
              id="order-status-filter"
              name="status"
              v-model="filters.status" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label for="customer-search" class="block text-sm font-medium text-gray-700 mb-1">Customer</label>
            <input 
              id="customer-search"
              name="customer"
              v-model="filters.customer" 
              type="text" 
              placeholder="Search by customer name"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label for="date-from" class="block text-sm font-medium text-gray-700 mb-1">Date From</label>
            <input 
              id="date-from"
              name="dateFrom"
              v-model="filters.dateFrom" 
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
          <div>
            <label for="date-to" class="block text-sm font-medium text-gray-700 mb-1">Date To</label>
            <input 
              id="date-to"
              name="dateTo"
              v-model="filters.dateTo" 
              type="date"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
        </div>
      </div>

      <!-- Orders Table -->
      <div class="bg-white shadow overflow-hidden sm:rounded-md">
        <div v-if="loading" class="p-8 text-center">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p class="mt-2 text-gray-600">Loading orders...</p>
        </div>

        <div v-else-if="orders.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">No orders found</h3>
          <p class="mt-1 text-sm text-gray-500">Get started by creating a new order.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Number</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ order.order_number || `#${order.id}` }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ order.customer?.user?.name || 'Unknown Customer' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(order.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ order.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  €{{ order.total_amount || 0 }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(order.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <router-link 
                    :to="`/admin/orders/${order.id}`" 
                    class="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    View
                  </router-link>
                  <button 
                    @click="updateOrderStatus(order)"
                    class="text-green-600 hover:text-green-900"
                  >
                    Update Status
                  </button>
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
import { ref, computed, onMounted } from 'vue'
import { ordersAPI } from '@/services/api'

const orders = ref([])
const loading = ref(false)

const filters = ref({
  status: '',
  customer: '',
  dateFrom: '',
  dateTo: ''
})

const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    const matchesStatus = !filters.value.status || order.status === filters.value.status
    const customerName = order.customer?.user?.name || 'Unknown Customer'
    const matchesCustomer = !filters.value.customer || 
      customerName.toLowerCase().includes(filters.value.customer.toLowerCase())
    const matchesDateFrom = !filters.value.dateFrom || new Date(order.created_at) >= new Date(filters.value.dateFrom)
    const matchesDateTo = !filters.value.dateTo || new Date(order.created_at) <= new Date(filters.value.dateTo)
    
    return matchesStatus && matchesCustomer && matchesDateFrom && matchesDateTo
  })
})

const getStatusClass = (status) => {
  const classes = {
    'pending': 'bg-yellow-100 text-yellow-800',
    'approved': 'bg-green-100 text-green-800',
    'shipped': 'bg-blue-100 text-blue-800',
    'delivered': 'bg-green-100 text-green-800',
    'cancelled': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const updateOrderStatus = (order) => {
  // TODO: Implement order status update
  console.log('Update order status:', order)
}

const loadOrders = async () => {
  try {
    loading.value = true
    const response = await ordersAPI.getAll()
    orders.value = response.data.orders || []
  } catch (error) {
    console.error('Error loading orders:', error)
    // Fallback to empty array if API fails
    orders.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.admin-orders-page {
  @apply p-6;
}
</style>
