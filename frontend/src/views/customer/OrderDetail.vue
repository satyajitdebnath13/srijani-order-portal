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
                  <p class="text-sm font-medium text-gray-900">{{ formatPrice(item.price) }}</p>
                </div>
              </div>
            </div>
            
            <div class="mt-6 pt-6 border-t border-gray-200">
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Subtotal</span>
                <span class="text-gray-900">{{ formatPrice(order.subtotal) }}</span>
              </div>
              <div class="flex justify-between text-sm mt-2">
                <span class="text-gray-600">Shipping</span>
                <span class="text-gray-900">{{ formatPrice(order.shipping) }}</span>
              </div>
              <div class="flex justify-between text-lg font-medium mt-4">
                <span class="text-gray-900">Total</span>
                <span class="text-gray-900">{{ formatPrice(order.total) }}</span>
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

      <!-- Package Opening Video Section -->
      <div v-if="order.status === 'delivered' || order.status === 'completed'" class="mt-6 bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900 flex items-center">
            <span class="mr-2">📹</span>
            Package Opening Video
          </h2>
        </div>
        <div class="p-6">
          <div v-if="!order.package_video_url" class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded-r-lg">
            <div class="flex">
              <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                </svg>
              </div>
              <div class="ml-3">
                <p class="text-sm text-yellow-700">
                  <strong>Important:</strong> Please upload a package opening video to enable returns.
                </p>
              </div>
            </div>
          </div>
          
          <VideoUpload
            :order-id="order.id"
            :existing-video-url="order.package_video_url"
            :existing-video-type="order.package_video_type"
            @uploaded="handleVideoUploaded"
          />
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
            <address v-if="order.shippingAddress" class="text-sm text-gray-600 not-italic">
              {{ order.shippingAddress.street }}<br>
              {{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.zipCode }}<br>
              {{ order.shippingAddress.country }}
            </address>
            <p v-else class="text-sm text-gray-500 italic">No shipping address provided</p>
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
import { formatPrice } from '@/utils/currency'
import { useRoute } from 'vue-router'
import { ordersAPI } from '@/services/api'
import VideoUpload from '@/components/VideoUpload.vue'

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

const handleVideoUploaded = (videoData) => {
  // Refresh order data to show uploaded video
  loadOrderDetails()
  
  // Show success message
  alert('✅ Video uploaded successfully! You can now create a return if needed.')
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
