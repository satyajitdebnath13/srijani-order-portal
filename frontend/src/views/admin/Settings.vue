<template>
  <div class="admin-component">
    <div class="p-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

      <!-- Tabs -->
      <div class="border-b border-gray-200 mb-6">
        <nav class="-mb-px flex space-x-8">
          <button
            @click="activeTab = 'statuses'"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'statuses'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Order Statuses
          </button>
          <button
            @click="activeTab = 'legal'"
            :class="[
              'py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === 'legal'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            ]"
          >
            Legal Pages
          </button>
        </nav>
      </div>

      <!-- Order Statuses Tab -->
      <div v-if="activeTab === 'statuses'" class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-semibold text-gray-900">Order Statuses</h2>
            <p class="text-gray-600 mt-1">Manage order status options that appear in dropdowns</p>
          </div>
          <button @click="showAddStatusModal = true" class="btn btn-primary">
            + Add Status
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loadingStatuses" class="text-center py-12">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>

        <!-- Statuses List -->
        <div v-else class="card">
          <div class="p-6">
            <div class="space-y-3">
              <div
                v-for="status in statuses"
                :key="status.id"
                class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div class="flex items-center space-x-4 flex-1">
                  <div class="flex items-center space-x-2">
                    <span
                      :class="getStatusColorClass(status.color)"
                      class="px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {{ status.label }}
                    </span>
                  </div>
                  <div class="flex-1">
                    <p class="text-sm text-gray-600">{{ status.description }}</p>
                    <p class="text-xs text-gray-400 mt-1">Value: {{ status.value }}</p>
                  </div>
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    @click="editStatus(status)"
                    class="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button
                    @click="toggleStatusActive(status)"
                    :class="status.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'"
                    class="p-2 rounded"
                    :title="status.is_active ? 'Deactivate' : 'Activate'"
                  >
                    <svg v-if="status.is_active" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"></path>
                    </svg>
                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Legal Pages Tab -->
      <div v-if="activeTab === 'legal'" class="space-y-6">
        <div>
          <h2 class="text-xl font-semibold text-gray-900">Legal Pages</h2>
          <p class="text-gray-600 mt-1">Edit Terms & Conditions and Privacy Policy content</p>
        </div>

        <!-- Legal Page Selector -->
        <div class="flex space-x-4">
          <button
            @click="selectedLegalPage = 'terms_and_conditions'"
            :class="[
              'px-4 py-2 rounded-lg font-medium',
              selectedLegalPage === 'terms_and_conditions'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
          >
            Terms & Conditions
          </button>
          <button
            @click="selectedLegalPage = 'privacy_policy'"
            :class="[
              'px-4 py-2 rounded-lg font-medium',
              selectedLegalPage === 'privacy_policy'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            ]"
          >
            Privacy Policy
          </button>
        </div>

        <!-- Editor -->
        <div class="card">
          <div class="p-6">
            <div v-if="loadingLegalContent" class="text-center py-12">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
            <div v-else>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                {{ selectedLegalPage === 'terms_and_conditions' ? 'Terms & Conditions' : 'Privacy Policy' }} Content
              </label>
              <textarea
                v-model="legalContent"
                rows="20"
                class="form-textarea font-mono text-sm"
                placeholder="Enter HTML content..."
              ></textarea>
              <div class="mt-4 flex justify-between items-center">
                <p class="text-sm text-gray-500">
                  You can use HTML tags for formatting
                </p>
                <button
                  @click="saveLegalContent"
                  :disabled="savingLegalContent"
                  class="btn btn-primary"
                >
                  <span v-if="savingLegalContent">Saving...</span>
                  <span v-else>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Preview -->
        <div class="card">
          <div class="p-6 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">Preview</h3>
          </div>
          <div class="p-6 prose max-w-none" v-html="legalContent"></div>
        </div>
      </div>

      <!-- Add/Edit Status Modal -->
      <div v-if="showAddStatusModal || editingStatus" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
        <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
          <h3 class="text-xl font-bold text-gray-900 mb-4">
            {{ editingStatus ? 'Edit Status' : 'Add New Status' }}
          </h3>
          
          <form @submit.prevent="saveStatus" class="space-y-4">
            <div v-if="!editingStatus">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Status Value (lowercase, no spaces) *
              </label>
              <input
                v-model="statusForm.value"
                type="text"
                required
                pattern="[a-z_]+"
                class="form-input"
                placeholder="e.g., in_production"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Display Label *
              </label>
              <input
                v-model="statusForm.label"
                type="text"
                required
                class="form-input"
                placeholder="e.g., In Production"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                v-model="statusForm.description"
                rows="3"
                class="form-textarea"
                placeholder="Describe what this status means..."
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <select v-model="statusForm.color" class="form-select">
                <option value="gray">Gray</option>
                <option value="red">Red</option>
                <option value="yellow">Yellow</option>
                <option value="green">Green</option>
                <option value="blue">Blue</option>
                <option value="indigo">Indigo</option>
                <option value="purple">Purple</option>
                <option value="pink">Pink</option>
              </select>
            </div>

            <div class="flex space-x-3 pt-4">
              <button
                type="button"
                @click="closeStatusModal"
                class="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                :disabled="savingStatus"
                class="flex-1 btn btn-primary"
              >
                <span v-if="savingStatus">Saving...</span>
                <span v-else>{{ editingStatus ? 'Update' : 'Create' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'

const activeTab = ref('statuses')
const loadingStatuses = ref(false)
const statuses = ref([])
const showAddStatusModal = ref(false)
const editingStatus = ref(null)
const savingStatus = ref(false)

const statusForm = ref({
  value: '',
  label: '',
  description: '',
  color: 'gray'
})

const selectedLegalPage = ref('terms_and_conditions')
const legalContent = ref('')
const loadingLegalContent = ref(false)
const savingLegalContent = ref(false)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api'

// Fetch statuses
const fetchStatuses = async () => {
  loadingStatuses.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get(`${API_URL}/settings/order-statuses`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    statuses.value = response.data.statuses
  } catch (error) {
    console.error('Error fetching statuses:', error)
    alert('Failed to load statuses')
  } finally {
    loadingStatuses.value = false
  }
}

// Edit status
const editStatus = (status) => {
  editingStatus.value = status
  statusForm.value = {
    label: status.label,
    description: status.description || '',
    color: status.color || 'gray'
  }
}

// Save status
const saveStatus = async () => {
  savingStatus.value = true
  try {
    const token = localStorage.getItem('token')
    
    if (editingStatus.value) {
      // Update existing
      await axios.put(
        `${API_URL}/settings/order-statuses/${editingStatus.value.id}`,
        statusForm.value,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('Status updated successfully!')
    } else {
      // Create new
      await axios.post(
        `${API_URL}/settings/order-statuses`,
        statusForm.value,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('Status created successfully!')
    }
    
    closeStatusModal()
    await fetchStatuses()
  } catch (error) {
    console.error('Error saving status:', error)
    alert(error.response?.data?.error || 'Failed to save status')
  } finally {
    savingStatus.value = false
  }
}

// Toggle status active/inactive
const toggleStatusActive = async (status) => {
  try {
    const token = localStorage.getItem('token')
    await axios.put(
      `${API_URL}/settings/order-statuses/${status.id}`,
      { is_active: !status.is_active },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    await fetchStatuses()
  } catch (error) {
    console.error('Error toggling status:', error)
    alert('Failed to update status')
  }
}

// Close modal
const closeStatusModal = () => {
  showAddStatusModal.value = false
  editingStatus.value = null
  statusForm.value = {
    value: '',
    label: '',
    description: '',
    color: 'gray'
  }
}

// Fetch legal content
const fetchLegalContent = async () => {
  loadingLegalContent.value = true
  try {
    const response = await axios.get(`${API_URL}/settings/site/${selectedLegalPage.value}`)
    legalContent.value = response.data.setting.setting_value || ''
  } catch (error) {
    console.error('Error fetching legal content:', error)
    legalContent.value = ''
  } finally {
    loadingLegalContent.value = false
  }
}

// Save legal content
const saveLegalContent = async () => {
  savingLegalContent.value = true
  try {
    const token = localStorage.getItem('token')
    await axios.put(
      `${API_URL}/settings/site/${selectedLegalPage.value}`,
      { value: legalContent.value },
      { headers: { Authorization: `Bearer ${token}` } }
    )
    alert('Content saved successfully!')
  } catch (error) {
    console.error('Error saving legal content:', error)
    alert('Failed to save content')
  } finally {
    savingLegalContent.value = false
  }
}

// Get status color class
const getStatusColorClass = (color) => {
  const colors = {
    gray: 'bg-gray-100 text-gray-800',
    red: 'bg-red-100 text-red-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    indigo: 'bg-indigo-100 text-indigo-800',
    purple: 'bg-purple-100 text-purple-800',
    pink: 'bg-pink-100 text-pink-800'
  }
  return colors[color] || colors.gray
}

// Watch for legal page changes
watch(selectedLegalPage, () => {
  fetchLegalContent()
})

onMounted(() => {
  fetchStatuses()
  fetchLegalContent()
})
</script>

<style scoped>
.admin-component {
  @apply min-h-screen bg-gray-50;
}

.card {
  @apply bg-white shadow rounded-lg;
}

.form-input,
.form-select,
.form-textarea {
  @apply block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm;
}

.btn {
  @apply inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2;
}

.btn-primary {
  @apply text-white bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply text-gray-700 bg-white border-gray-300 hover:bg-gray-50 focus:ring-primary-500;
}

.prose {
  @apply text-gray-700;
}

.prose h1 {
  @apply text-2xl font-bold mb-4;
}

.prose h2 {
  @apply text-xl font-bold mb-3 mt-6;
}

.prose p {
  @apply mb-4;
}

.prose ul {
  @apply list-disc pl-6 mb-4;
}
</style>

