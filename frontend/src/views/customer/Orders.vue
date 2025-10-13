<template>
  <div class="customer-orders-page">
    <div class="page-header">
      <h1 class="text-3xl font-bold text-gray-900">My Orders</h1>
      <p class="text-gray-600">Track and manage your orders</p>
    </div>

    <div class="mt-6">
      <div v-if="orders.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">No orders yet</h3>
        <p class="mt-1 text-sm text-gray-500">Your orders will appear here once you place them.</p>
      </div>

      <div v-else class="bg-white shadow overflow-hidden sm:rounded-md">
        <ul class="divide-y divide-gray-200">
          <li v-for="order in orders" :key="order.id">
            <div class="px-4 py-4 sm:px-6">
              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Order #{{ order.id }}
                    </span>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ order.items.length }} item(s)
                    </div>
                    <div class="text-sm text-gray-500">
                      Placed {{ formatDate(order.createdAt) }}
                    </div>
                  </div>
                </div>
                <div class="flex items-center space-x-4">
                  <div class="text-right">
                    <div class="text-sm font-medium text-gray-900">${{ order.total }}</div>
                    <span :class="getStatusClass(order.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                      {{ order.status }}
                    </span>
                  </div>
                  <router-link 
                    :to="`/orders/${order.id}`" 
                    class="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    View Details
                  </router-link>
                </div>
              </div>
              <div v-if="order.items" class="mt-2">
                <div class="text-sm text-gray-600">
                  {{ order.items.map(item => item.name).join(', ') }}
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

const orders = ref([])

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
  return new Date(dateString).toLocaleDateString()
}

const loadOrders = async () => {
  try {
    const response = await ordersAPI.getCustomerOrders()
    orders.value = response.data.orders
  } catch (error) {
    console.error('Error loading orders:', error)
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.customer-orders-page {
  @apply p-6;
}
</style>
