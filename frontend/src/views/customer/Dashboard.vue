<template>
  <div>
    <h1 class="text-responsive-2xl font-bold mb-4 sm:mb-6">Welcome back, {{ authStore.user?.name }}!</h1>
    
    <!-- Stats Cards -->
    <div class="grid-responsive-3 mb-6 sm:mb-8">
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs sm:text-sm text-gray-600">Active Orders</p>
            <p class="text-xl sm:text-3xl font-bold text-primary-600 mt-1">{{ stats.active }}</p>
          </div>
          <svg class="w-8 h-8 sm:w-12 sm:h-12 text-primary-200" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clip-rule="evenodd"/>
          </svg>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs sm:text-sm text-gray-600">Delivered</p>
            <p class="text-xl sm:text-3xl font-bold text-green-600 mt-1">{{ stats.delivered }}</p>
          </div>
          <svg class="w-8 h-8 sm:w-12 sm:h-12 text-green-200" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"/>
            <path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
          </svg>
        </div>
      </div>
      
      <div class="card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs sm:text-sm text-gray-600">Open Tickets</p>
            <p class="text-xl sm:text-3xl font-bold text-orange-600 mt-1">{{ stats.tickets }}</p>
          </div>
          <svg class="w-8 h-8 sm:w-12 sm:h-12 text-orange-200" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/>
          </svg>
        </div>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="grid-responsive-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <router-link to="/support/create" class="card hover:shadow-lg transition-shadow cursor-pointer">
        <div class="flex items-center space-x-3 sm:space-x-4">
          <div class="bg-primary-100 p-2 sm:p-3 rounded-lg">
            <svg class="w-5 h-5 sm:w-6 sm:h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-sm sm:text-lg">Get Support</h3>
            <p class="text-xs sm:text-sm text-gray-600">Create a support ticket</p>
          </div>
        </div>
      </router-link>
      
      <router-link to="/returns/create" class="card hover:shadow-lg transition-shadow cursor-pointer">
        <div class="flex items-center space-x-3 sm:space-x-4">
          <div class="bg-orange-100 p-2 sm:p-3 rounded-lg">
            <svg class="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"/>
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-sm sm:text-lg">Request Return</h3>
            <p class="text-xs sm:text-sm text-gray-600">Start a return or exchange</p>
          </div>
        </div>
      </router-link>
    </div>
    
    <!-- Recent Orders -->
    <div class="card">
      <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
        <h2 class="text-responsive-xl font-semibold mb-2 sm:mb-0">Recent Orders</h2>
        <router-link to="/orders" class="text-primary-600 hover:text-primary-700 text-xs sm:text-sm font-medium">
          View All →
        </router-link>
      </div>
      
      <div v-if="loading" class="text-center py-6 sm:py-8 text-gray-500">
        <svg class="animate-spin h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-xs sm:text-sm">Loading orders...</p>
      </div>
      
      <div v-else-if="orders.length === 0" class="text-center py-6 sm:py-8">
        <svg class="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-400 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
        </svg>
        <p class="text-sm sm:text-base text-gray-600">No orders yet</p>
      </div>
      
      <div v-else class="space-y-3 sm:space-y-4">
        <div v-for="order in orders" :key="order.id" 
             class="flex flex-col p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div class="flex-1">
            <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mb-2">
              <p class="font-medium text-sm sm:text-lg">{{ order.order_number }}</p>
              <span :class="getStatusClass(order.status)" class="badge badge-sm mt-1 sm:mt-0">
                {{ formatStatus(order.status) }}
              </span>
            </div>
            <p class="text-xs sm:text-sm text-gray-600">{{ formatDate(order.created_at) }}</p>
            <p class="text-sm sm:text-base font-medium text-gray-900 mt-1">€{{ parseFloat(order.total_amount).toFixed(2) }}</p>
          </div>
          <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-3 sm:mt-4">
            <router-link :to="`/orders/${order.id}`" class="btn btn-secondary btn-sm text-center">
              View Details
            </router-link>
            <router-link v-if="order.status === 'pending_approval'" 
                        :to="`/orders/${order.id}/approve`" 
                        class="btn btn-primary btn-sm text-center">
              Approve Order
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { ordersAPI, supportAPI } from '@/services/api';
import { format } from 'date-fns';

const authStore = useAuthStore();
const orders = ref([]);
const loading = ref(false);

const stats = computed(() => {
  const active = orders.value.filter(o => 
    !['delivered', 'completed', 'cancelled'].includes(o.status)
  ).length;
  
  const delivered = orders.value.filter(o => 
    ['delivered', 'completed'].includes(o.status)
  ).length;
  
  return { active, delivered, tickets: 0 };
});

const fetchOrders = async () => {
  loading.value = true;
  try {
    const response = await ordersAPI.getAll({ limit: 5 });
    orders.value = response.data.orders;
    
    // Fetch ticket count
    const ticketsResponse = await supportAPI.getAll({ status: 'open' });
    stats.value.tickets = ticketsResponse.data.pagination.total;
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    loading.value = false;
  }
};

const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    return format(new Date(date), 'MMM dd, yyyy');
  } catch (error) {
    return 'Invalid date';
  }
};

const formatStatus = (status) => status.replace(/_/g, ' ').toUpperCase();

const getStatusClass = (status) => {
  const classes = {
    pending_approval: 'badge-warning',
    confirmed: 'badge-info',
    in_production: 'badge-info',
    shipped: 'badge-info',
    delivered: 'badge-success',
    completed: 'badge-success',
    cancelled: 'badge-danger'
  };
  return classes[status] || 'badge-info';
};

onMounted(() => {
  fetchOrders();
});
</script>

