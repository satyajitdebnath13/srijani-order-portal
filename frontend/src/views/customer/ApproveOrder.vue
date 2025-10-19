<template>
  <div class="approve-order-page">
    <div class="page-header">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Approve Order</h1>
          <p class="text-gray-600">Review and approve order #{{ order?.order_number || orderId }}</p>
        </div>
        <div class="flex space-x-3">
          <router-link 
            :to="`/orders/${orderId}`" 
            class="text-blue-600 hover:text-blue-900 text-sm font-medium"
          >
            ← Back to Order Details
          </router-link>
          <router-link 
            to="/dashboard" 
            class="text-gray-600 hover:text-gray-900 text-sm font-medium"
          >
            Dashboard
          </router-link>
        </div>
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
              <div class="space-y-3">
                <div v-for="item in order.items" :key="item.id" class="border border-gray-200 rounded-lg p-3">
                  <div class="flex justify-between items-start mb-2">
                    <h4 class="font-medium text-gray-900">{{ item.product_name }}</h4>
                    <span class="text-sm font-medium text-gray-900">{{ formatPrice(item.subtotal) }}</span>
                  </div>
                  <div class="text-sm text-gray-600 space-y-1">
                    <div>Quantity: {{ item.quantity }}</div>
                    <div>Unit Price: {{ formatPrice(item.unit_price) }}</div>
                    <div v-if="item.sku">SKU: {{ item.sku }}</div>
                    <div v-if="item.size">Size: {{ item.size }}</div>
                    <div v-if="item.color">Color: {{ item.color }}</div>
                    <div v-if="item.material">Material: {{ item.material }}</div>
                    <div v-if="item.description" class="mt-2 text-gray-500">{{ item.description }}</div>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 class="text-sm font-medium text-gray-500 mb-2">Order Details</h3>
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span>Order Number:</span>
                  <span class="font-medium">{{ order.order_number }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Order Date:</span>
                  <span>{{ new Date(order.created_at).toLocaleDateString() }}</span>
                </div>
                <div class="flex justify-between">
                  <span>Status:</span>
                  <span class="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                    {{ order.status.replace('_', ' ').toUpperCase() }}
                  </span>
                </div>
                <div class="flex justify-between">
                  <span>Payment Method:</span>
                  <span>{{ order.payment_method || 'Not specified' }}</span>
                </div>
                <div v-if="order.estimated_delivery" class="flex justify-between">
                  <span>Estimated Delivery:</span>
                  <span>{{ new Date(order.estimated_delivery).toLocaleDateString() }}</span>
                </div>
                <div class="border-t border-gray-200 pt-3 mt-3">
                  <div class="flex justify-between font-medium text-lg">
                    <span>Total Amount:</span>
                    <span>{{ formatPrice(order.total_amount) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Terms and Conditions -->
      <div class="bg-white shadow rounded-lg mb-6">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-lg font-medium text-gray-900">Terms & Conditions</h2>
        </div>
        <div class="p-6">
          <div class="space-y-4">
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 class="text-sm font-medium text-blue-900 mb-2">Important Information</h3>
              <p class="text-sm text-blue-800">
                By approving this order, you confirm that you have read and agree to our Terms & Conditions and Privacy Policy. 
                Please review these documents before proceeding.
              </p>
            </div>
            
            <div class="flex space-x-4">
              <a 
                href="/legal/terms" 
                target="_blank"
                class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                Terms & Conditions
              </a>
              <a 
                href="/legal/privacy" 
                target="_blank"
                class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                </svg>
                Privacy Policy
              </a>
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
                    <span class="block text-gray-500">Cancel this order and notify the admin</span>
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
                    <span class="block text-gray-500">Ask admin to modify the order</span>
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

            <!-- Terms Acceptance -->
            <div v-if="form.decision === 'approve'" class="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div class="flex items-start">
                <input 
                  id="terms-accepted" 
                  v-model="form.termsAccepted" 
                  type="checkbox"
                  class="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
                  required
                >
                <label for="terms-accepted" class="ml-3 text-sm text-gray-700">
                  <span class="font-medium">I confirm that I have read and agree to the</span>
                  <a href="/legal/terms" target="_blank" class="text-blue-600 hover:text-blue-800 underline">Terms & Conditions</a>
                  <span class="font-medium"> and </span>
                  <a href="/legal/privacy" target="_blank" class="text-blue-600 hover:text-blue-800 underline">Privacy Policy</a>
                  <span class="font-medium">. I understand that by approving this order, I am entering into a legally binding agreement.</span>
                </label>
              </div>
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
                :disabled="!isFormValid || loading"
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
import { ref, computed, onMounted } from 'vue'
import { formatPrice } from '@/utils/currency'
import { useRoute, useRouter } from 'vue-router'
import { ordersAPI } from '@/services/api'

const route = useRoute()
const router = useRouter()
const orderId = route.params.id
const order = ref(null)
const loading = ref(false)

const form = ref({
  decision: '',
  reason: '',
  notes: '',
  termsAccepted: false
})

// Computed properties
const isFormValid = computed(() => {
  if (!form.value.decision) return false
  
  if (form.value.decision === 'approve') {
    return form.value.termsAccepted
  }
  
  if (form.value.decision === 'reject' || form.value.decision === 'request-changes') {
    return form.value.reason.trim().length > 0
  }
  
  return true
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
    
    // Check if order is in pending_approval status
    if (order.value.status !== 'pending_approval') {
      alert('This order is not available for approval.')
      router.push(`/orders/${orderId}`)
    }
  } catch (error) {
    console.error('Error loading order details:', error)
    alert('Failed to load order details. Please try again.')
  }
}

const submitApproval = async () => {
  if (!isFormValid.value) return

  loading.value = true
  
  try {
    if (form.value.decision === 'approve') {
      // Approve the order
      await ordersAPI.approve(orderId, { terms_accepted: form.value.termsAccepted })
      alert('Order approved successfully! You will receive a confirmation email shortly.')
      router.push(`/orders/${orderId}`)
    } else {
      // For reject or request changes, we'll need to implement a different endpoint
      // For now, we'll show a message that this feature is coming soon
      alert('Order rejection and change requests are being processed. You will be contacted shortly.')
      router.push(`/orders/${orderId}`)
    }
  } catch (error) {
    console.error('Error submitting approval:', error)
    alert(error.response?.data?.error || 'Failed to submit approval decision. Please try again.')
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
