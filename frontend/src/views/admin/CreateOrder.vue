<template>
  <div class="admin-component">
    <div class="p-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Create New Order</h1>
          <p class="text-gray-600 mt-1">Create and manage new customer orders</p>
        </div>
        <router-link to="/admin/orders" class="btn btn-secondary">
          ← Back to Orders
        </router-link>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Customer Selection Section -->
        <div class="card">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">Customer Information</h2>
            <p class="text-gray-600 mt-1">Select an existing customer or create a new one</p>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <!-- Customer Type Selection -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Customer Type</label>
                <div class="flex space-x-4">
                  <label class="flex items-center">
                    <input
                      v-model="customerType"
                      type="radio"
                      value="existing"
                      class="form-radio text-primary-600"
                    />
                    <span class="ml-2 text-sm text-gray-700">Existing Customer</span>
                  </label>
                  <label class="flex items-center">
                    <input
                      v-model="customerType"
                      type="radio"
                      value="new"
                      class="form-radio text-primary-600"
                    />
                    <span class="ml-2 text-sm text-gray-700">New Customer</span>
                  </label>
                </div>
              </div>

              <!-- Existing Customer Selection -->
              <div v-if="customerType === 'existing'" class="space-y-4">
                <div>
                  <label for="customer-select" class="block text-sm font-medium text-gray-700 mb-2">
                    Select Customer
                  </label>
                  <select
                    id="customer-select"
                    v-model="form.customer_id"
                    class="form-select"
                    required
                  >
                    <option value="">Choose a customer...</option>
                    <option
                      v-for="customer in customers"
                      :key="customer.id"
                      :value="customer.id"
                    >
                      {{ customer.user.name }} ({{ customer.user.email }})
                    </option>
                  </select>
                </div>
              </div>

              <!-- New Customer Form -->
              <div v-if="customerType === 'new'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="customer-name" class="block text-sm font-medium text-gray-700 mb-2">
                    Customer Name *
                  </label>
                  <input
                    id="customer-name"
                    v-model="form.customer_name"
                    type="text"
                    class="form-input"
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div>
                  <label for="customer-email" class="block text-sm font-medium text-gray-700 mb-2">
                    Customer Email *
                  </label>
                  <input
                    id="customer-email"
                    v-model="form.customer_email"
                    type="email"
                    class="form-input"
                    placeholder="Enter customer email"
                    required
                  />
                </div>
                <div>
                  <label for="customer-phone" class="block text-sm font-medium text-gray-700 mb-2">
                    Customer Phone
                  </label>
                  <input
                    id="customer-phone"
                    v-model="form.customer_phone"
                    type="tel"
                    class="form-input"
                    placeholder="Enter customer phone"
                  />
                </div>
                <div class="flex items-end">
                  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 w-full">
                    <div class="flex items-center">
                      <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <div>
                        <p class="text-sm font-medium text-blue-900">Auto Account Creation</p>
                        <p class="text-xs text-blue-700">A customer account will be created automatically with login credentials sent via email</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Items Section -->
        <div class="card">
          <div class="p-6 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">Order Items</h2>
                <p class="text-gray-600 mt-1">Add products to this order</p>
              </div>
              <button
                type="button"
                @click="addItem"
                class="btn btn-primary btn-sm"
              >
                + Add Item
              </button>
            </div>
          </div>
          <div class="p-6">
            <div class="space-y-4">
              <div
                v-for="(item, index) in form.items"
                :key="index"
                class="border border-gray-200 rounded-lg p-4"
              >
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-medium text-gray-900">Item {{ index + 1 }}</h3>
                  <button
                    type="button"
                    @click="removeItem(index)"
                    class="text-red-600 hover:text-red-800"
                    :disabled="form.items.length === 1"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                    <input
                      v-model="item.product_name"
                      type="text"
                      class="form-input"
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                    <input
                      v-model="item.sku"
                      type="text"
                      class="form-input"
                      placeholder="Enter SKU"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                    <input
                      v-model.number="item.quantity"
                      type="number"
                      min="1"
                      class="form-input"
                      placeholder="1"
                      required
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Unit Price (€) *</label>
                    <input
                      v-model.number="item.unit_price"
                      type="number"
                      step="0.01"
                      min="0"
                      class="form-input"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Size</label>
                    <input
                      v-model="item.size"
                      type="text"
                      class="form-input"
                      placeholder="e.g., M, L, XL"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <input
                      v-model="item.color"
                      type="text"
                      class="form-input"
                      placeholder="e.g., Red, Blue"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Material</label>
                    <input
                      v-model="item.material"
                      type="text"
                      class="form-input"
                      placeholder="e.g., Cotton, Silk"
                    />
                  </div>
                  <div class="md:col-span-2">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
                    <textarea
                      v-model="item.description"
                      class="form-textarea"
                      rows="2"
                      placeholder="Enter product description"
                    ></textarea>
                  </div>
                </div>
                
                <div class="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div class="flex justify-between items-center">
                    <span class="text-sm text-gray-600">Subtotal:</span>
                    <span class="font-medium text-gray-900">€{{ calculateSubtotal(item).toFixed(2) }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <div class="flex justify-between items-center">
                <span class="text-lg font-semibold text-primary-900">Total Amount:</span>
                <span class="text-2xl font-bold text-primary-900">€{{ calculateTotal().toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Order Details Section -->
        <div class="card">
          <div class="p-6 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900">Order Details</h2>
            <p class="text-gray-600 mt-1">Additional order information</p>
          </div>
          <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label for="payment-method" class="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  id="payment-method"
                  v-model="form.payment_method"
                  class="form-select"
                >
                  <option value="">Select payment method...</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="cash_on_delivery">Cash on Delivery</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label for="currency" class="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  id="currency"
                  v-model="form.currency"
                  class="form-select"
                >
                  <option value="EUR">EUR (€)</option>
                  <option value="USD">USD ($)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
              <div>
                <label for="estimated-delivery" class="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Delivery
                </label>
                <input
                  id="estimated-delivery"
                  v-model="form.estimated_delivery"
                  type="date"
                  class="form-input"
                />
              </div>
              <div>
                <label for="shipping-address" class="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Address ID (UUID)
                </label>
                <input
                  id="shipping-address"
                  v-model="form.shipping_address_id"
                  type="text"
                  class="form-input"
                  placeholder="Optional: Enter valid UUID (e.g., 123e4567-e89b-12d3-a456-426614174000)"
                  pattern="[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
                />
                <p class="text-xs text-gray-500 mt-1">
                  Leave empty if no specific address. Must be a valid UUID format.
                </p>
              </div>
            </div>
            
            <div class="mt-6 space-y-4">
              <div>
                <label for="special-instructions" class="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions
                </label>
                <textarea
                  id="special-instructions"
                  v-model="form.special_instructions"
                  class="form-textarea"
                  rows="3"
                  placeholder="Any special instructions for this order..."
                ></textarea>
              </div>
              <div>
                <label for="internal-notes" class="block text-sm font-medium text-gray-700 mb-2">
                  Internal Notes
                </label>
                <textarea
                  id="internal-notes"
                  v-model="form.internal_notes"
                  class="form-textarea"
                  rows="3"
                  placeholder="Internal notes (not visible to customer)..."
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        <!-- Submit Section -->
        <div class="card">
          <div class="p-6">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold text-gray-900">Ready to Create Order?</h3>
                <p class="text-gray-600 mt-1">
                  {{ customerType === 'new' ? 'A new customer account will be created and login credentials will be sent via email.' : 'The order will be sent to the selected customer for approval.' }}
                </p>
              </div>
              <div class="flex space-x-3">
                <router-link to="/admin/orders" class="btn btn-secondary">
                  Cancel
                </router-link>
                <button
                  type="submit"
                  :disabled="loading || !isFormValid"
                  class="btn btn-primary"
                >
                  <span v-if="loading" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                  <span v-else>Create Order</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ordersAPI, authAPI } from '@/services/api'

const router = useRouter()

// Reactive data
const loading = ref(false)
const customerType = ref('existing')
const customers = ref([])

const form = ref({
  customer_id: '',
  customer_email: '',
  customer_name: '',
  customer_phone: '',
  items: [
    {
      product_name: '',
      sku: '',
      description: '',
      quantity: 1,
      unit_price: 0,
      size: '',
      color: '',
      material: ''
    }
  ],
  payment_method: '',
  currency: 'EUR',
  estimated_delivery: '',
  shipping_address_id: '',
  billing_address_id: '',
  special_instructions: '',
  internal_notes: ''
})

// Computed properties
const isFormValid = computed(() => {
  if (customerType.value === 'existing') {
    return form.value.customer_id && form.value.items.every(item => 
      item.product_name && item.quantity > 0 && item.unit_price >= 0
    )
  } else {
    return form.value.customer_email && form.value.customer_name && 
           form.value.items.every(item => 
             item.product_name && item.quantity > 0 && item.unit_price >= 0
           )
  }
})

// Methods
const addItem = () => {
  form.value.items.push({
    product_name: '',
    sku: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    size: '',
    color: '',
    material: ''
  })
}

const removeItem = (index) => {
  if (form.value.items.length > 1) {
    form.value.items.splice(index, 1)
  }
}

const calculateSubtotal = (item) => {
  return (item.quantity || 0) * (item.unit_price || 0)
}

const calculateTotal = () => {
  return form.value.items.reduce((total, item) => {
    return total + calculateSubtotal(item)
  }, 0)
}

const fetchCustomers = async () => {
  try {
    const response = await authAPI.getAllCustomers({ limit: 100 })
    customers.value = response.data.customers
  } catch (error) {
    console.error('Error fetching customers:', error)
  }
}

const handleSubmit = async () => {
  if (!isFormValid.value) return
  
  loading.value = true
  try {
    // Helper function to validate UUID
    const isValidUUID = (uuid) => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      return uuid && uuidRegex.test(uuid);
    };

    const orderData = {
      ...form.value,
      // Clean up address IDs - only send valid UUIDs or empty strings
      shipping_address_id: isValidUUID(form.value.shipping_address_id) ? form.value.shipping_address_id : '',
      billing_address_id: isValidUUID(form.value.billing_address_id) ? form.value.billing_address_id : '',
      // Remove customer fields if using existing customer
      ...(customerType.value === 'existing' && {
        customer_email: undefined,
        customer_name: undefined,
        customer_phone: undefined
      }),
      // Remove customer_id if creating new customer
      ...(customerType.value === 'new' && {
        customer_id: undefined
      })
    }

    const response = await ordersAPI.create(orderData)
    
    // Show success message
    alert(response.data.message)
    
    // Redirect to orders list
    router.push('/admin/orders')
  } catch (error) {
    console.error('Error creating order:', error)
    alert(error.response?.data?.error || 'Failed to create order')
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchCustomers()
})
</script>

<style scoped>
.admin-component {
  @apply min-h-screen bg-gray-50;
}

.form-input,
.form-select,
.form-textarea {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm;
}

.form-radio {
  @apply h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300;
}

.btn {
  @apply inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500;
}

.btn-secondary {
  @apply text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:ring-primary-500;
}

.btn-sm {
  @apply px-3 py-1.5 text-xs;
}

.card {
  @apply bg-white shadow rounded-lg;
}
</style>