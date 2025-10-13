<template>
  <div class="profile-page">
    <div class="page-header">
      <h1 class="text-3xl font-bold text-gray-900">My Profile</h1>
      <p class="text-gray-600">Manage your account information and preferences</p>
    </div>

    <div class="mt-6 max-w-2xl">
      <div class="bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-6">Personal Information</h3>
          
          <form @submit.prevent="updateProfile" class="space-y-6">
            <div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label for="firstName" class="block text-sm font-medium text-gray-700">First Name</label>
                <input 
                  type="text" 
                  id="firstName" 
                  v-model="form.firstName" 
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
              </div>
              <div>
                <label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</label>
                <input 
                  type="text" 
                  id="lastName" 
                  v-model="form.lastName" 
                  required
                  class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
              </div>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700">Email Address</label>
              <input 
                type="email" 
                id="email" 
                v-model="form.email" 
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
            </div>

            <div>
              <label for="phone" class="block text-sm font-medium text-gray-700">Phone Number</label>
              <input 
                type="tel" 
                id="phone" 
                v-model="form.phone"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
            </div>

            <div>
              <label for="dateOfBirth" class="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input 
                type="date" 
                id="dateOfBirth" 
                v-model="form.dateOfBirth"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
            </div>

            <div class="flex justify-end">
              <button 
                type="submit" 
                :disabled="loading"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {{ loading ? 'Updating...' : 'Update Profile' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Address Information -->
      <div class="mt-6 bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-6">Address Information</h3>
          
          <div v-if="addresses.length === 0" class="text-center py-8">
            <p class="text-gray-500 mb-4">No addresses saved</p>
            <button 
              @click="showAddAddress = true"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Address
            </button>
          </div>

          <div v-else class="space-y-4">
            <div v-for="address in addresses" :key="address.id" class="border border-gray-200 rounded-lg p-4">
              <div class="flex justify-between items-start">
                <div>
                  <h4 class="font-medium text-gray-900">{{ address.type }}</h4>
                  <p class="text-sm text-gray-600">{{ address.street }}, {{ address.city }}, {{ address.state }} {{ address.zipCode }}</p>
                  <p class="text-sm text-gray-600">{{ address.country }}</p>
                </div>
                <div class="flex space-x-2">
                  <button 
                    @click="editAddress(address)"
                    class="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button 
                    @click="deleteAddress(address.id)"
                    class="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
            <button 
              @click="showAddAddress = true"
              class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Add New Address
            </button>
          </div>
        </div>
      </div>

      <!-- Change Password -->
      <div class="mt-6 bg-white shadow sm:rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-6">Change Password</h3>
          
          <form @submit.prevent="changePassword" class="space-y-6">
            <div>
              <label for="currentPassword" class="block text-sm font-medium text-gray-700">Current Password</label>
              <input 
                type="password" 
                id="currentPassword" 
                v-model="passwordForm.currentPassword" 
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
            </div>

            <div>
              <label for="newPassword" class="block text-sm font-medium text-gray-700">New Password</label>
              <input 
                type="password" 
                id="newPassword" 
                v-model="passwordForm.newPassword" 
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input 
                type="password" 
                id="confirmPassword" 
                v-model="passwordForm.confirmPassword" 
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
            </div>

            <div class="flex justify-end">
              <button 
                type="submit" 
                :disabled="passwordLoading"
                class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                {{ passwordLoading ? 'Changing...' : 'Change Password' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const loading = ref(false)
const passwordLoading = ref(false)
const showAddAddress = ref(false)

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const addresses = ref([])

const loadProfile = async () => {
  try {
    const userResponse = await authAPI.getProfile()
    const user = userResponse.data.user
    form.value = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      dateOfBirth: user.dateOfBirth || ''
    }

    const addressesResponse = await authAPI.getAddresses()
    addresses.value = addressesResponse.data.addresses
  } catch (error) {
    console.error('Error loading profile:', error)
  }
}

const updateProfile = async () => {
  loading.value = true
  
  try {
    // TODO: Implement API call to update profile
    console.log('Updating profile:', form.value)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    alert('Profile updated successfully!')
  } catch (error) {
    console.error('Error updating profile:', error)
    alert('Failed to update profile. Please try again.')
  } finally {
    loading.value = false
  }
}

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('New passwords do not match')
    return
  }

  passwordLoading.value = true
  
  try {
    // TODO: Implement API call to change password
    console.log('Changing password')
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    alert('Password changed successfully!')
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    console.error('Error changing password:', error)
    alert('Failed to change password. Please try again.')
  } finally {
    passwordLoading.value = false
  }
}

const editAddress = (address) => {
  // TODO: Implement address editing
  console.log('Edit address:', address)
}

const deleteAddress = async (addressId) => {
  if (confirm('Are you sure you want to delete this address?')) {
    try {
      // TODO: Implement API call to delete address
      console.log('Delete address:', addressId)
      addresses.value = addresses.value.filter(addr => addr.id !== addressId)
    } catch (error) {
      console.error('Error deleting address:', error)
    }
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-page {
  @apply p-6;
}
</style>
