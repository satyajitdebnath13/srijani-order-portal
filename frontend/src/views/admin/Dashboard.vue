<template>
  <div class="admin-dashboard">
    <div class="dashboard-header mb-6 sm:mb-8">
      <h1 class="text-responsive-2xl font-bold text-gray-900">Admin Dashboard</h1>
      <p class="text-responsive-sm text-gray-600 mt-1">Welcome back, {{ user?.name || 'Admin' }}</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid-responsive mb-6 sm:mb-8">
      <div class="card">
        <div class="flex items-center">
          <div class="p-2 sm:p-3 bg-blue-100 rounded-lg">
            <svg class="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div class="ml-3 sm:ml-4">
            <p class="text-xs sm:text-sm font-medium text-gray-600">Total Orders</p>
            <p class="text-lg sm:text-2xl font-semibold text-gray-900">
              <span v-if="loading" class="animate-pulse bg-gray-200 h-6 sm:h-8 w-12 sm:w-16 rounded"></span>
              <span v-else>{{ stats.totalOrders }}</span>
            </p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="p-2 sm:p-3 bg-green-100 rounded-lg">
            <svg class="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
            </svg>
          </div>
          <div class="ml-3 sm:ml-4">
            <p class="text-xs sm:text-sm font-medium text-gray-600">Total Customers</p>
            <p class="text-lg sm:text-2xl font-semibold text-gray-900">
              <span v-if="loading" class="animate-pulse bg-gray-200 h-6 sm:h-8 w-12 sm:w-16 rounded"></span>
              <span v-else>{{ stats.totalCustomers }}</span>
            </p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="p-2 sm:p-3 bg-yellow-100 rounded-lg">
            <svg class="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
            </svg>
          </div>
          <div class="ml-3 sm:ml-4">
            <p class="text-xs sm:text-sm font-medium text-gray-600">Support Tickets</p>
            <p class="text-lg sm:text-2xl font-semibold text-gray-900">
              <span v-if="loading" class="animate-pulse bg-gray-200 h-6 sm:h-8 w-12 sm:w-16 rounded"></span>
              <span v-else>{{ stats.totalTickets }}</span>
            </p>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center">
          <div class="p-2 sm:p-3 bg-red-100 rounded-lg">
            <svg class="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m5 14v-5a2 2 0 00-2-2H6a2 2 0 00-2 2v5a2 2 0 002 2h12a2 2 0 002-2z"></path>
            </svg>
          </div>
          <div class="ml-3 sm:ml-4">
            <p class="text-xs sm:text-sm font-medium text-gray-600">Returns</p>
            <p class="text-lg sm:text-2xl font-semibold text-gray-900">
              <span v-if="loading" class="animate-pulse bg-gray-200 h-6 sm:h-8 w-12 sm:w-16 rounded"></span>
              <span v-else>{{ stats.totalReturns }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="grid-responsive-2 gap-4 sm:gap-6">
      <div class="card">
        <div class="p-4 sm:p-6 border-b border-gray-200">
          <h3 class="text-responsive-lg font-medium text-gray-900">Recent Orders</h3>
        </div>
        <div class="p-4 sm:p-6">
          <div v-if="loading" class="space-y-3 sm:space-y-4">
            <div v-for="n in 3" :key="n" class="flex items-center justify-between">
              <div>
                <div class="animate-pulse bg-gray-200 h-3 sm:h-4 w-20 sm:w-24 rounded mb-2"></div>
                <div class="animate-pulse bg-gray-200 h-2 sm:h-3 w-28 sm:w-32 rounded"></div>
              </div>
              <div class="text-right">
                <div class="animate-pulse bg-gray-200 h-4 sm:h-6 w-12 sm:w-16 rounded mb-2"></div>
                <div class="animate-pulse bg-gray-200 h-2 sm:h-3 w-8 sm:w-12 rounded"></div>
              </div>
            </div>
          </div>
          <div v-else-if="recentOrders.length === 0" class="text-center text-gray-500 py-6 sm:py-8">
            <svg class="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p class="text-sm sm:text-base">No recent orders</p>
          </div>
          <div v-else class="space-y-3 sm:space-y-4">
            <div v-for="order in recentOrders" :key="order.id" class="flex flex-col sm:flex-row sm:items-center justify-between">
              <div class="flex-1">
                <p class="font-medium text-sm sm:text-base text-gray-900">Order #{{ order.id }}</p>
                <p class="text-xs sm:text-sm text-gray-600">{{ order.customerName }}</p>
              </div>
              <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mt-2 sm:mt-0">
                <p class="font-medium text-sm sm:text-base text-gray-900">${{ order.total }}</p>
                <span :class="getStatusClass(order.status)" class="badge badge-sm mt-1 sm:mt-0">
                  {{ order.status }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="p-4 sm:p-6 border-b border-gray-200">
          <h3 class="text-responsive-lg font-medium text-gray-900">Recent Support Tickets</h3>
        </div>
        <div class="p-4 sm:p-6">
          <div v-if="loading" class="space-y-3 sm:space-y-4">
            <div v-for="n in 3" :key="n" class="flex items-center justify-between">
              <div>
                <div class="animate-pulse bg-gray-200 h-3 sm:h-4 w-24 sm:w-32 rounded mb-2"></div>
                <div class="animate-pulse bg-gray-200 h-2 sm:h-3 w-20 sm:w-24 rounded"></div>
              </div>
              <div class="text-right">
                <div class="animate-pulse bg-gray-200 h-4 sm:h-6 w-12 sm:w-16 rounded"></div>
              </div>
            </div>
          </div>
          <div v-else-if="recentTickets.length === 0" class="text-center text-gray-500 py-6 sm:py-8">
            <svg class="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p class="text-sm sm:text-base">No recent tickets</p>
          </div>
          <div v-else class="space-y-3 sm:space-y-4">
            <div v-for="ticket in recentTickets" :key="ticket.id" class="flex flex-col sm:flex-row sm:items-center justify-between">
              <div class="flex-1">
                <p class="font-medium text-sm sm:text-base text-gray-900">{{ ticket.subject }}</p>
                <p class="text-xs sm:text-sm text-gray-600">{{ ticket.customerName }}</p>
              </div>
              <div class="mt-2 sm:mt-0">
                <span :class="getPriorityClass(ticket.priority)" class="badge badge-sm">
                  {{ ticket.priority }}
                </span>
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
import { useAuthStore } from '@/stores/auth'
import { ordersAPI, supportAPI } from '@/services/api'

const authStore = useAuthStore()
const user = ref(authStore.user)

const loading = ref(true)
const stats = ref({
  totalOrders: 0,
  totalCustomers: 0,
  totalTickets: 0,
  totalReturns: 0
})

const recentOrders = ref([])
const recentTickets = ref([])

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

const getPriorityClass = (priority) => {
  const classes = {
    'low': 'bg-green-100 text-green-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'high': 'bg-red-100 text-red-800'
  }
  return classes[priority] || 'bg-gray-100 text-gray-800'
}

const loadDashboardData = async () => {
  try {
    loading.value = true
    
    // Load dashboard statistics
    const statsResponse = await ordersAPI.getStats()
    stats.value = statsResponse.data.stats || {
      totalOrders: 0,
      totalCustomers: 0,
      totalTickets: 0,
      totalReturns: 0
    }

    // Load recent orders
    const ordersResponse = await ordersAPI.getRecent()
    recentOrders.value = ordersResponse.data.orders || []

    // Load recent tickets
    const ticketsResponse = await supportAPI.getRecent()
    recentTickets.value = ticketsResponse.data.tickets || []
  } catch (error) {
    console.error('Error loading dashboard data:', error)
    // Ensure we show empty state on error
    stats.value = {
      totalOrders: 0,
      totalCustomers: 0,
      totalTickets: 0,
      totalReturns: 0
    }
    recentOrders.value = []
    recentTickets.value = []
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
.admin-dashboard {
  @apply p-6;
}
</style>
