<template>
  <div class="video-upload-container">
    <!-- Upload Type Selection -->
    <div v-if="!videoUrl && !uploading" class="upload-type-selection">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">
        📹 Upload Package Opening Video
      </h3>
      <p class="text-sm text-gray-600 mb-4">
        Choose how you'd like to provide your package opening video:
      </p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <!-- File Upload Option -->
        <button
          @click="uploadType = 'file'"
          :class="[
            'p-6 border-2 rounded-lg text-left transition-all',
            uploadType === 'file'
              ? 'border-primary-600 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'
          ]"
        >
          <div class="flex items-center mb-2">
            <svg class="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <span class="font-semibold text-gray-900">Upload File</span>
          </div>
          <p class="text-sm text-gray-600">
            Upload MP4, MOV, AVI, or WEBM (max 100 MB)
          </p>
        </button>

        <!-- Link Option -->
        <button
          @click="uploadType = 'link'"
          :class="[
            'p-6 border-2 rounded-lg text-left transition-all',
            uploadType === 'link'
              ? 'border-primary-600 bg-primary-50'
              : 'border-gray-200 hover:border-gray-300'
          ]"
        >
          <div class="flex items-center mb-2">
            <svg class="w-6 h-6 mr-2 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
            </svg>
            <span class="font-semibold text-gray-900">Provide Link</span>
          </div>
          <p class="text-sm text-gray-600">
            YouTube, Google Drive, or Vimeo link
          </p>
        </button>
      </div>

      <!-- File Upload -->
      <div v-if="uploadType === 'file'" class="upload-area">
        <label
          for="video-file"
          class="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 hover:bg-gray-50 transition-colors"
        >
          <div class="flex flex-col items-center justify-center pt-5 pb-6">
            <svg class="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
            </svg>
            <p class="mb-2 text-sm text-gray-500">
              <span class="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p class="text-xs text-gray-500">MP4, MOV, AVI, WEBM (MAX. 100MB)</p>
          </div>
          <input
            id="video-file"
            type="file"
            class="hidden"
            accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
            @change="handleFileSelect"
          />
        </label>
        
        <div v-if="selectedFile" class="mt-4 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between">
            <div class="flex items-center">
              <svg class="w-8 h-8 text-primary-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
              <div>
                <p class="text-sm font-medium text-gray-900">{{ selectedFile.name }}</p>
                <p class="text-xs text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
              </div>
            </div>
            <button
              @click="clearFile"
              class="text-red-600 hover:text-red-800"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <button
          v-if="selectedFile"
          @click="uploadFile"
          :disabled="uploading"
          class="mt-4 w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
        >
          {{ uploading ? 'Uploading...' : 'Upload Video' }}
        </button>
      </div>

      <!-- Link Input -->
      <div v-if="uploadType === 'link'" class="link-input">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Video Link
        </label>
        <input
          v-model="videoLink"
          type="url"
          placeholder="https://youtube.com/watch?v=... or https://drive.google.com/..."
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        <p class="mt-2 text-xs text-gray-500">
          Supported: YouTube, Google Drive, Vimeo
        </p>
        
        <button
          @click="submitLink"
          :disabled="!videoLink || uploading"
          class="mt-4 w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors"
        >
          {{ uploading ? 'Saving...' : 'Save Video Link' }}
        </button>
      </div>
    </div>

    <!-- Upload Progress -->
    <div v-if="uploading" class="upload-progress">
      <div class="flex flex-col items-center justify-center py-12">
        <div class="relative">
          <div class="w-24 h-24 border-8 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-2xl">📹</span>
          </div>
        </div>
        <p class="mt-6 text-lg font-semibold text-gray-900">Uploading Video...</p>
        <p class="mt-2 text-sm text-gray-600">Please wait while we process your video</p>
        <div v-if="uploadProgress > 0" class="w-full max-w-md mt-4">
          <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              class="h-full bg-primary-600 transition-all duration-300"
              :style="{ width: uploadProgress + '%' }"
            ></div>
          </div>
          <p class="text-center text-sm text-gray-600 mt-2">{{ uploadProgress }}%</p>
        </div>
      </div>
    </div>

    <!-- Video Uploaded Success -->
    <div v-if="videoUrl && !uploading" class="video-uploaded">
      <div class="bg-green-50 border-2 border-green-200 rounded-lg p-6">
        <div class="flex items-center mb-4">
          <div class="flex-shrink-0">
            <svg class="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div class="ml-4">
            <h3 class="text-lg font-semibold text-green-900">Video Uploaded Successfully!</h3>
            <p class="text-sm text-green-700 mt-1">Your package opening video has been saved.</p>
          </div>
        </div>
        
        <div class="bg-white rounded-lg p-4 mb-4">
          <p class="text-sm font-medium text-gray-700 mb-2">Video {{ videoType === 'file' ? 'File' : 'Link' }}:</p>
          <a
            :href="videoUrl"
            target="_blank"
            class="text-sm text-primary-600 hover:text-primary-800 underline break-all"
          >
            {{ videoUrl }}
          </a>
        </div>

        <button
          v-if="allowReupload"
          @click="resetUpload"
          class="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Upload Different Video
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="error-message mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <p class="text-sm text-red-800">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { videoAPI } from '@/services/api'

const props = defineProps({
  orderId: {
    type: String,
    required: true
  },
  existingVideoUrl: {
    type: String,
    default: null
  },
  existingVideoType: {
    type: String,
    default: null
  },
  allowReupload: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['uploaded', 'error'])

const uploadType = ref('file')
const selectedFile = ref(null)
const videoLink = ref('')
const uploading = ref(false)
const uploadProgress = ref(0)
const videoUrl = ref(props.existingVideoUrl)
const videoType = ref(props.existingVideoType)
const error = ref('')

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file size (100 MB)
  if (file.size > 104857600) {
    error.value = 'File size must be less than 100 MB'
    return
  }

  // Validate file type
  const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm']
  if (!allowedTypes.includes(file.type)) {
    error.value = 'Invalid file type. Please upload MP4, MOV, AVI, or WEBM'
    return
  }

  selectedFile.value = file
  error.value = ''
}

const clearFile = () => {
  selectedFile.value = null
  error.value = ''
}

const uploadFile = async () => {
  if (!selectedFile.value) return

  uploading.value = true
  uploadProgress.value = 0
  error.value = ''

  try {
    const formData = new FormData()
    formData.append('video', selectedFile.value)

    // Simulate progress (since we don't have real progress from backend)
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10
      }
    }, 500)

    const response = await videoAPI.uploadVideoFile(props.orderId, formData)

    clearInterval(progressInterval)
    uploadProgress.value = 100

    videoUrl.value = response.data.video.url
    videoType.value = 'file'

    emit('uploaded', {
      url: videoUrl.value,
      type: videoType.value
    })

    setTimeout(() => {
      uploading.value = false
    }, 500)
  } catch (err) {
    uploading.value = false
    uploadProgress.value = 0
    error.value = err.response?.data?.error || 'Failed to upload video'
    emit('error', error.value)
  }
}

const submitLink = async () => {
  if (!videoLink.value) return

  uploading.value = true
  error.value = ''

  try {
    const response = await videoAPI.saveVideoToOrder(props.orderId, {
      videoUrl: videoLink.value,
      videoType: 'link'
    })

    videoUrl.value = videoLink.value
    videoType.value = 'link'

    emit('uploaded', {
      url: videoUrl.value,
      type: videoType.value
    })

    uploading.value = false
  } catch (err) {
    uploading.value = false
    error.value = err.response?.data?.error || 'Failed to save video link'
    emit('error', error.value)
  }
}

const resetUpload = () => {
  videoUrl.value = null
  videoType.value = null
  selectedFile.value = null
  videoLink.value = ''
  uploadProgress.value = 0
  error.value = ''
  uploadType.value = 'file'
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
</script>

<style scoped>
.video-upload-container {
  width: 100%;
}
</style>

