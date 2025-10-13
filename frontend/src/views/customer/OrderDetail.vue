<template>
  <div class="order-detail-page">
    <div class="page-header">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Order #{{ orderId }}</h1>
          <p class="text-gray-600">Order details and tracking information</p>
        </div>
        <router-link 
          to="/orders" 
          class="text-blue-600 hover:text-blue-900 text-sm font-medium"
        >
          ← Back to Orders
        </router-link>
      </div>
    </div>

    <div v-if="order" class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Order Information -->
      <div class="lg:col-span-2">
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Order Items</h2>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div v-for="item in order.items" :key="item.id" class="flex items-center justify-between py-4 border-b border-gray-100">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-lg"></div>
                  <div class="ml-4">
                    <h3 class="text-sm font-medium text-gray-900">{{ item.name }}</h3>
                    <p class="text-sm text-gray-500">Quantity: {{ item.quantity }}</p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-900">${{ item.price }}</p>
                </div>
              </div>
            </div>
            
            <div class="mt-6 pt-6 border-t border-gray-200">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Subtotal</span>
                <span class="text-gray-900">${{ order.subtotal }}</span>
              </div>
              <div class="flex justify-between text-sm mt-2">
                <span class="text-gray-600">Shipping</span>
                <span class="text-gray-900">${{ order.shipping }}</span>
              </div>
              <div class="flex justify-between text-lg font-medium mt-4">
                <span class="text-gray-900">Total</span>
                <span class="text-gray-900">${{ order.total }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Status Timeline -->
        <div class="mt-6 bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Order Status</h2>
          </div>
          <div class="p-6">
            <div class="flow-root">
              <ul class="-mb-8">
                <li v-for="(status, index) in orderStatusHistory" :key="index" class="relative pb-8">
                  <div v-if="index !== orderStatusHistory.length - 1" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></div>
                  <div class="relative flex space-x-3">
                    <div>
                      <span :class="getStatusIconClass(status.status)" class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white">
                        <svg class="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                        </svg>
                      </span>
                    </div>
                    <div class="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p class="text-sm text-gray-500">{{ status.description }}</p>
                      </div>
                      <div class="text-right text-sm whitespace-nowrap text-gray-500">
                        {{ formatDate(status.timestamp) }}
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="space-y-6">
        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Order Summary</h2>
          </div>
          <div class="p-6">
            <dl class="space-y-4">
              <div>
                <dt class="text-sm font-medium text-gray-500">Order Number</dt>
                <dd class="text-sm text-gray-900">{{ order.id }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Order Date</dt>
                <dd class="text-sm text-gray-900">{{ formatDate(order.createdAt) }}</dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Status</dt>
                <dd>
                  <span :class="getStatusClass(order.status)" class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                    {{ order.status }}
                  </span>
                </dd>
              </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Payment Method</dt>
                <dd class="text-sm text-gray-900">{{ order.paymentMethod }}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div class="bg-white shadow rounded-lg">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-lg font-medium text-gray-900">Shipping Address</h2>
          </div>
          <div class="p-6">
            <address class="text-sm text-gray-600 not-italic">
              {{ order.shippingAddress.street }}<br>
              {{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.zipCode }}<br>
              {{ order.shippingAddress.country }}
            </address>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="mt-6 text-center py-12">
      <div class="text-gray-500">Loading order details...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const orderId = route.params.id
const order = ref(null)
const orderStatusHistory = ref([])

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

const getStatusIconClass = (status) => {
  const classes = {
    'pending': 'bg-yellow-500',
    'approved': 'bg-green-500',
    'shipped': 'bg-blue-500',
    'delivered': 'bg-green-500',
    'cancelled': 'bg-red-500'
  }
  return classes[status] || 'bg-gray-500'
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString()
}

const loadOrderDetails = async () => {
  try {
    const response = await ordersAPI.getById(orderId)
    order.value = response.data.order
    orderStatusHistory.value = response.data.statusHistory
  } catch (error) {
    console.error('Error loading order details:', error)
  }
}

onMounted(() => {
  loadOrderDetails()
})
</script>

<style scoped>
.order-detail-page {
  @apply p-6;
}
</style>
