<template>
  <div class="admin-component">
    <div class="p-6">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">{{ title }}</h1>
      <p class="text-gray-600 mb-6">{{ description }}</p>
      
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 class="text-lg font-semibold text-blue-900 mb-2">Coming Soon</h2>
        <p class="text-blue-800">
          This {{ componentName }} component is under development and will be available soon.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const title = computed(() => 'Create New Order')
const description = computed(() => 'Create and manage new customer orders')
const componentName = 'CreateOrder'
</script>
