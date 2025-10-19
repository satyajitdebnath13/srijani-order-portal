<template>
  <div class="create-return-page p-6">
    <div class="page-header mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Create Return Request</h1>
      <p class="text-gray-600">Select items to return and provide details</p>
    </div>

    <!-- Step Indicator -->
    <div class="mb-8">
      <div class="flex items-center justify-center">
        <div class="flex items-center">
          <div :class="['flex items-center justify-center w-10 h-10 rounded-full', step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600']">
            <span class="font-semibold">1</span>
          </div>
          <div :class="['w-24 h-1', step >= 2 ? 'bg-primary-600' : 'bg-gray-200']"></div>
          <div :class="['flex items-center justify-center w-10 h-10 rounded-full', step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600']">
            <span class="font-semibold">2</span>
          </div>
          <div :class="['w-24 h-1', step >= 3 ? 'bg-primary-600' : 'bg-gray-200']"></div>
          <div :class="['flex items-center justify-center w-10 h-10 rounded-full', step >= 3 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600']">
            <span class="font-semibold">3</span>
          </div>
        </div>
      </div>
      <div class="flex justify-center mt-2 text-sm text-gray-600">
        <span class="w-32 text-center">Select Order</span>
        <span class="w-32 text-center">Select Items</span>
        <span class="w-32 text-center">Confirm</span>
      </div>
    </div>

    <!-- Step 1: Select Order -->
    <div v-if="step === 1" class="max-w-3xl mx-auto">
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Select Order to Return</h2>
        
        <div v-if="loading" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          <p class="mt-2 text-gray-600">Loading orders...</p>
        </div>

        <div v-else-if="eligibleOrders.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
          </svg>
          <p class="mt-4 text-gray-600">No eligible orders for return</p>
          <p class="text-sm text-gray-500 mt-2">Only delivered orders can be returned</p>
          <router-link to="/customer/orders" class="mt-4 inline-block text-primary-600 hover:text-primary-800 font-medium">
            View All Orders →
          </router-link>
        </div>

        <div v-else class="space-y-4">
          <div
            v-for="order in eligibleOrders"
            :key="order.id"
            @click="selectOrder(order)"
            class="p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md"
            :class="selectedOrder?.id === order.id ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="font-semibold text-gray-900">{{ order.order_number }}</p>
                <p class="text-sm text-gray-600 mt-1">{{ formatDate(order.created_at) }}</p>
                <p class="text-xs text-gray-500 mt-1">{{ order.items?.length || 0 }} items</p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-gray-900">${{ order.total_amount }}</p>
                <span class="inline-block mt-1 text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                  {{ formatStatus(order.status) }}
                </span>
                <div v-if="order.package_video_url" class="mt-2">
                  <span class="inline-flex items-center text-xs text-green-600">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"></path>
                    </svg>
                    Video uploaded
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="eligibleOrders.length > 0" class="flex justify-end mt-6">
          <button
            @click="step = 2"
            :disabled="!selectedOrder"
            class="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    </div>

    <!-- Step 2: Select Items -->
    <div v-if="step === 2" class="max-w-3xl mx-auto">
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Select Items to Return</h2>
        
        <!-- Video Requirement Check -->
        <div v-if="!selectedOrder.package_video_url" class="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-r-lg">
          <div class="flex">
            <svg class="h-6 w-6 text-red-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
            </svg>
            <div>
              <p class="font-semibold text-red-800">📹 Package Opening Video Required</p>
              <p class="text-sm text-red-700 mt-1">
                You must upload a package opening video before creating a return request.
              </p>
              <router-link
                :to="`/customer/orders/${selectedOrder.id}`"
                class="inline-block mt-2 text-sm font-semibold text-red-800 underline hover:text-red-900"
              >
                Upload Video Now →
              </router-link>
            </div>
          </div>
        </div>

        <!-- Item Selection -->
        <div class="space-y-4">
          <div
            v-for="item in selectedOrder.items"
            :key="item.id"
            class="border-2 rounded-lg p-4 transition-all"
            :class="isItemSelected(item.id) ? 'border-primary-600 bg-primary-50' : 'border-gray-200'"
          >
            <div class="flex items-start">
              <input
                type="checkbox"
                :id="`item-${item.id}`"
                :checked="isItemSelected(item.id)"
                @change="toggleItem(item)"
                :disabled="!selectedOrder.package_video_url"
                class="mt-1 h-5 w-5 text-primary-600 rounded focus:ring-primary-500 disabled:opacity-50"
              />
              <div class="ml-4 flex-1">
                <label :for="`item-${item.id}`" class="font-semibold text-gray-900 cursor-pointer">
                  {{ item.product_name }}
                </label>
                <p class="text-sm text-gray-600 mt-1">
                  Quantity: {{ item.quantity }} × {{ formatPrice(item.unit_price) }} = {{ formatPrice(item.quantity * parseFloat(item.unit_price)) }}
                </p>
                
                <!-- Reason Selection (shown when item is selected) -->
                <div v-if="isItemSelected(item.id)" class="mt-4 space-y-3 bg-white p-4 rounded-lg border border-primary-200">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Reason for Return *
                    </label>
                    <select
                      v-model="getItemData(item.id).return_reason"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select a reason</option>
                      <option value="wrong_size">Wrong Size</option>
                      <option value="wrong_color">Wrong Color</option>
                      <option value="defective">Defective/Damaged</option>
                      <option value="not_as_described">Not as Described</option>
                      <option value="quality_issues">Quality Issues</option>
                      <option value="changed_mind">Changed Mind</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Description *
                    </label>
                    <textarea
                      v-model="getItemData(item.id).return_description"
                      rows="3"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Please provide details about why you're returning this item..."
                      required
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex gap-4 mt-6">
          <button @click="step = 1" class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors">
            Back
          </button>
          <button
            @click="validateAndContinue"
            :disabled="selectedItems.length === 0 || !selectedOrder.package_video_url"
            class="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            Continue ({{ selectedItems.length }} item{{ selectedItems.length !== 1 ? 's' : '' }} selected)
          </button>
        </div>
      </div>
    </div>

    <!-- Step 3: Return Details & Submit -->
    <div v-if="step === 3" class="max-w-3xl mx-auto">
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">Confirm Return Details</h2>
        
        <!-- Selected Items Summary -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 class="font-semibold text-gray-900 mb-3">Items to Return:</h3>
          <ul class="space-y-2">
            <li v-for="item in selectedItems" :key="item.order_item_id" class="text-sm flex justify-between">
              <div>
                <span class="font-medium text-gray-900">{{ getOrderItem(item.order_item_id).product_name }}</span>
                <span class="text-gray-600"> - {{ formatReason(item.return_reason) }}</span>
              </div>
              <span class="text-gray-900 font-medium">{{ formatPrice(getOrderItem(item.order_item_id).quantity * parseFloat(getOrderItem(item.order_item_id).unit_price)) }}</span>
            </li>
          </ul>
          <div class="mt-3 pt-3 border-t border-gray-200 flex justify-between font-semibold">
            <span>Total Return Amount:</span>
            <span>{{ formatPrice(calculateTotalReturnAmount()) }}</span>
          </div>
        </div>

        <!-- Return Type -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-3">
            Return Type *
          </label>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label class="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all"
                   :class="returnType === 'refund' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'">
              <input type="radio" v-model="returnType" value="refund" class="mt-1 mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500" />
              <div>
                <p class="font-semibold text-gray-900">Refund</p>
                <p class="text-sm text-gray-600 mt-1">Get your money back</p>
              </div>
            </label>
            <label class="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all"
                   :class="returnType === 'exchange' ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'">
              <input type="radio" v-model="returnType" value="exchange" class="mt-1 mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500" />
              <div>
                <p class="font-semibold text-gray-900">Exchange</p>
                <p class="text-sm text-gray-600 mt-1">Replace with different item</p>
              </div>
            </label>
          </div>
        </div>

        <!-- Additional Notes -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            v-model="reasonDetails"
            rows="4"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Any additional information about your return..."
          ></textarea>
        </div>

        <!-- Video Confirmation -->
        <div class="bg-green-50 border-l-4 border-green-400 p-4 mb-6 rounded-r-lg">
          <div class="flex">
            <svg class="h-6 w-6 text-green-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
            </svg>
            <div>
              <p class="font-semibold text-green-800">📹 Package Opening Video Attached</p>
              <p class="text-sm text-green-700 mt-1">
                Your video has been included with this return request.
              </p>
            </div>
          </div>
        </div>

        <div class="flex gap-4">
          <button @click="step = 2" class="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-colors">
            Back
          </button>
          <button
            @click="submitReturn"
            :disabled="submitting || !returnType"
            class="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
          >
            {{ submitting ? 'Submitting...' : 'Submit Return Request' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { formatPrice } from '@/utils/currency'
import { useRouter } from 'vue-router'
import { ordersAPI, returnsAPI } from '@/services/api'
import { format } from 'date-fns'

const router = useRouter()

const step = ref(1)
const loading = ref(false)
const submitting = ref(false)
const eligibleOrders = ref([])
const selectedOrder = ref(null)
const selectedItems = ref([])
const returnType = ref('refund')
const reasonDetails = ref('')

const fetchEligibleOrders = async () => {
  loading.value = true
  try {
    const response = await ordersAPI.getCustomerOrders()
    // Filter for delivered/completed orders only
    eligibleOrders.value = response.data.orders.filter(order => 
      order.status === 'delivered' || order.status === 'completed'
    )
  } catch (error) {
    console.error('Error fetching orders:', error)
    alert('Failed to load orders')
  } finally {
    loading.value = false
  }
}

const selectOrder = (order) => {
  selectedOrder.value = order
  selectedItems.value = []
}

const isItemSelected = (itemId) => {
  return selectedItems.value.some(item => item.order_item_id === itemId)
}

const toggleItem = (item) => {
  const index = selectedItems.value.findIndex(i => i.order_item_id === item.id)
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push({
      order_item_id: item.id,
      quantity: item.quantity,
      return_reason: '',
      return_description: ''
    })
  }
}

const getItemData = (itemId) => {
  return selectedItems.value.find(item => item.order_item_id === itemId) || {}
}

const getOrderItem = (itemId) => {
  return selectedOrder.value.items.find(item => item.id === itemId) || {}
}

const validateAndContinue = () => {
  // Validate all items have reasons and descriptions
  for (const item of selectedItems.value) {
    if (!item.return_reason || !item.return_description) {
      alert('Please provide a reason and description for all selected items')
      return
    }
  }
  step.value = 3
}

const calculateTotalReturnAmount = () => {
  let total = 0
  selectedItems.value.forEach(item => {
    const orderItem = getOrderItem(item.order_item_id)
    total += orderItem.quantity * orderItem.unit_price
  })
  return total.toFixed(2)
}

const submitReturn = async () => {
  if (!returnType.value) {
    alert('Please select a return type')
    return
  }

  submitting.value = true

  try {
    await returnsAPI.create({
      order_id: selectedOrder.value.id,
      items: selectedItems.value,
      reason: selectedItems.value[0].return_reason, // Primary reason
      reason_details: reasonDetails.value,
      return_type: returnType.value,
      video_url: selectedOrder.value.package_video_url,
      video_type: selectedOrder.value.package_video_type
    })

    alert('✅ Return request submitted successfully! We will review your request and contact you soon.')
    router.push('/customer/returns')
  } catch (error) {
    console.error('Error creating return:', error)
    alert(error.response?.data?.error || 'Failed to create return request. Please try again.')
  } finally {
    submitting.value = false
  }
}

const formatDate = (date) => {
  return format(new Date(date), 'MMM dd, yyyy')
}

const formatStatus = (status) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatReason = (reason) => {
  return reason.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

onMounted(() => {
  fetchEligibleOrders()
})
</script>

<style scoped>
.create-return-page {
  min-height: calc(100vh - 200px);
}
</style>
