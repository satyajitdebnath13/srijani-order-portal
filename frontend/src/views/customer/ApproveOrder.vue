<template>
  <div class="approve-order-page">
    <div class="page-header">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Approve Order</h1>
          <p class="text-gray-600">Review and approve order #{{ orderId }}</p>
        </div>
        <router-link 
          :to="`/orders/${orderId}`" 
          class="text-blue-600 hover:text-blue-900 text-sm font-medium"
        >
          ← Back to Order Details
        </router-link>
      </div>
    </div>

    <div v-if="order" class="mt-6 max-w-4xl">
      <!-- Order Summary -->
      <div class="bg-white shadow rounded-lg mb-6">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Order Summary</h2>
        </div>
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-2">Order Items</h3>
              <div class="space-y-2">
                <div v-for="item in order.items" :key="item.id" class="flex justify-between text-sm">
                  <span>{{ item.name }} (x{{ item.quantity }})</span>
                  <span>${{ item.price }}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-2">Order Total</h3>
              <div class="space-y-1 text-sm">
                <div class="flex justify-between">
                  <span>Subtotal:</span>
                  <span>${{ order.subtotal }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Shipping:</span>
                  <span>${{ order.shipping }}</span>
                </div>
                <div class="flex justify-between font-medium text-lg">
                  <span>Total:</span>
                  <span>${{ order.total }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Approval Form -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Order Approval</h2>
        </div>
        <div class="p-6">
          <form @submit.prevent="submitApproval" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-3">Approval Decision</label>
              <div class="space-y-3">
                <div class="flex items-center">
                  <input 
                    id="approve" 
                    v-model="form.decision" 
                    value="approve" 
                    type="radio"
                    class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                  >
                  <label for="approve" class="ml-3 text-sm text-gray-700">
                    <span class="font-medium text-green-600">Approve Order</span>
                    <span class="block text-gray-500">Confirm this order and proceed with fulfillment</span>
                  </label>
                </div>
                <div class="flex items-center">
                  <input 
                    id="reject" 
                    v-model="form.decision" 
                    value="reject" 
                    type="radio"
                    class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
                  >
                  <label for="reject" class="ml-3 text-sm text-gray-700">
                    <span class="font-medium text-red-600">Reject Order</span>
                    <span class="block text-gray-500">Cancel this order and notify the customer</span>
                  </label>
                </div>
                <div class="flex items-center">
                  <input 
                    id="request-changes" 
                    v-model="form.decision" 
                    value="request-changes" 
                    type="radio"
                    class="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300"
                  >
                  <label for="request-changes" class="ml-3 text-sm text-gray-700">
                    <span class="font-medium text-yellow-600">Request Changes</span>
                    <span class="block text-gray-500">Ask customer to modify the order</span>
                  </label>
                </div>
              </div>
            </div>

            <div v-if="form.decision === 'reject' || form.decision === 'request-changes'">
              <label for="reason" class="block text-sm font-medium text-gray-700 mb-2">
                {{ form.decision === 'reject' ? 'Rejection Reason' : 'Change Request Details' }}
              </label>
              <textarea 
                id="reason" 
                v-model="form.reason" 
                rows="4"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                :placeholder="form.decision === 'reject' ? 'Please explain why this order is being rejected...' : 'Please specify what changes are needed...'"
              ></textarea>
            </div>

            <div>
              <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
              <textarea 
                id="notes" 
                v-model="form.notes" 
                rows="3"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Any additional comments or instructions..."
              ></textarea>
            </div>

            <div class="flex justify-end space-x-3">
              <router-link 
                :to="`/orders/${orderId}`" 
                class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </router-link>
              <button 
                type="submit" 
                :disabled="!form.decision || loading"
                :class="getSubmitButtonClass(form.decision)"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white disabled:opacity-50"
              >
                {{ loading ? 'Processing...' : getSubmitButtonText(form.decision) }}
              </button>
            </div>
          </form>
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
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const orderId = route.params.id
const order = ref(null)
const loading = ref(false)

const form = ref({
  decision: '',
  reason: '',
  notes: ''
})

const getSubmitButtonClass = (decision) => {
  const classes = {
    'approve': 'bg-green-600 hover:bg-green-700',
    'reject': 'bg-red-600 hover:bg-red-700',
    'request-changes': 'bg-yellow-600 hover:bg-yellow-700'
  }
  return classes[decision] || 'bg-gray-600 hover:bg-gray-700'
}

const getSubmitButtonText = (decision) => {
  const texts = {
    'approve': 'Approve Order',
    'reject': 'Reject Order',
    'request-changes': 'Request Changes'
  }
  return texts[decision] || 'Submit Decision'
}

const loadOrderDetails = async () => {
  try {
    const response = await ordersAPI.getById(orderId)
    order.value = response.data.order
  } catch (error) {
    console.error('Error loading order details:', error)
  }
}

const submitApproval = async () => {
  if (!form.value.decision) return

  loading.value = true
  
  try {
    // TODO: Implement API call to submit approval decision
    console.log('Submitting approval decision:', {
      orderId,
      decision: form.value.decision,
      reason: form.value.reason,
      notes: form.value.notes
    })
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Redirect to order details
    router.push(`/orders/${orderId}`)
  } catch (error) {
    console.error('Error submitting approval:', error)
    alert('Failed to submit approval decision. Please try again.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadOrderDetails()
})
</script>

<style scoped>
.approve-order-page {
  @apply p-6;
}
</style>
