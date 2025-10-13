<template>
  <div class="create-return-page">
    <div class="page-header">
      <h1 class="text-3xl font-bold text-gray-900">Create Return Request</h1>
      <p class="text-gray-600">Request a return for your order items</p>
    </div>

    <div class="mt-6 max-w-2xl">
      <form @submit.prevent="submitReturn" class="space-y-6">
        <!-- Order Selection -->
        <div>
          <label for="orderId" class="block text-sm font-medium text-gray-700">Select Order</label>
          <select 
            id="orderId" 
            v-model="form.orderId" 
            required
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Choose an order...</option>
            <option v-for="order in orders" :key="order.id" :value="order.id">
              Order #{{ order.id }} - {{ formatDate(order.createdAt) }} - ${{ order.total }}
            </option>
          </select>
        </div>

        <!-- Return Reason -->
        <div>
          <label for="reason" class="block text-sm font-medium text-gray-700">Return Reason</label>
          <select 
            id="reason" 
            v-model="form.reason" 
            required
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select a reason...</option>
            <option value="defective">Defective item</option>
            <option value="not_as_described">Not as described</option>
            <option value="wrong_item">Wrong item received</option>
            <option value="damaged">Damaged during shipping</option>
            <option value="changed_mind">Changed mind</option>
            <option value="other">Other</option>
          </select>
        </div>

        <!-- Additional Comments -->
        <div>
          <label for="comments" class="block text-sm font-medium text-gray-700">Additional Comments</label>
          <textarea 
            id="comments" 
            v-model="form.comments" 
            rows="4"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Please provide any additional details about your return request..."
          ></textarea>
        </div>

        <!-- Items to Return -->
        <div v-if="selectedOrder">
          <label class="block text-sm font-medium text-gray-700 mb-3">Items to Return</label>
          <div class="space-y-3">
            <div v-for="item in selectedOrder.items" :key="item.id" class="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div class="flex items-center">
                <input 
                  :id="`item-${item.id}`" 
                  v-model="form.items" 
                  :value="item.id" 
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                >
                <div class="ml-3">
                  <label :for="`item-${item.id}`" class="text-sm font-medium text-gray-900">
                    {{ item.name }}
                  </label>
                  <p class="text-sm text-gray-500">Quantity: {{ item.quantity }}</p>
                </div>
              </div>
              <div class="text-sm text-gray-900">
                ${{ item.price }}
              </div>
            </div>
          </div>
        </div>

        <!-- Return Method -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">Return Method</label>
          <div class="space-y-2">
            <div class="flex items-center">
              <input 
                id="pickup" 
                v-model="form.returnMethod" 
                value="pickup" 
                type="radio"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              >
              <label for="pickup" class="ml-2 text-sm text-gray-900">Schedule pickup</label>
            </div>
            <div class="flex items-center">
              <input 
                id="dropoff" 
                v-model="form.returnMethod" 
                value="dropoff" 
                type="radio"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
              >
              <label for="dropoff" class="ml-2 text-sm text-gray-900">Drop off at store</label>
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end space-x-3">
          <router-link 
            to="/returns" 
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </router-link>
          <button 
            type="submit" 
            :disabled="loading"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {{ loading ? 'Submitting...' : 'Submit Return Request' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const loading = ref(false)
const orders = ref([])

const form = ref({
  orderId: '',
  reason: '',
  comments: '',
  items: [],
  returnMethod: 'pickup'
})

const selectedOrder = computed(() => {
  return orders.value.find(order => order.id === form.value.orderId)
})

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

const submitReturn = async () => {
  if (form.value.items.length === 0) {
    alert('Please select at least one item to return')
    return
  }

  loading.value = true
  
  try {
    // TODO: Implement API call to submit return request
    console.log('Submitting return request:', form.value)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Redirect to returns page
    router.push('/returns')
  } catch (error) {
    console.error('Error submitting return request:', error)
    alert('Failed to submit return request. Please try again.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.create-return-page {
  @apply p-6;
}
</style>
