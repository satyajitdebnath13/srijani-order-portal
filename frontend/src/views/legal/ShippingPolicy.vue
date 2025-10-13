<template>
  <div class="shipping-policy-page">
    <div class="max-w-4xl mx-auto px-4 py-8">
      <h1 class="text-4xl font-bold text-gray-900 mb-8">Shipping Policy</h1>
      
      <div class="prose prose-lg max-w-none">
        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Overview</h2>
          <p class="text-gray-700 mb-4">
            At Srijani, we are committed to delivering your orders safely and on time. 
            We offer various shipping options to meet your needs and ensure your satisfaction.
          </p>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Shipping Options</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Standard Shipping</h3>
              <ul class="space-y-2 text-gray-700">
                <li>• 5-7 business days</li>
                <li>• Free on orders over $50</li>
                <li>• $9.99 for orders under $50</li>
                <li>• Tracking included</li>
              </ul>
            </div>
            
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Express Shipping</h3>
              <ul class="space-y-2 text-gray-700">
                <li>• 2-3 business days</li>
                <li>• $19.99 flat rate</li>
                <li>• Priority handling</li>
                <li>• Tracking included</li>
              </ul>
            </div>
            
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Overnight Shipping</h3>
              <ul class="space-y-2 text-gray-700">
                <li>• Next business day</li>
                <li>• $29.99 flat rate</li>
                <li>• Available Mon-Fri</li>
                <li>• Signature required</li>
              </ul>
            </div>
            
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">International Shipping</h3>
              <ul class="space-y-2 text-gray-700">
                <li>• 7-14 business days</li>
                <li>• Rates vary by country</li>
                <li>• Customs fees may apply</li>
                <li>• Tracking included</li>
              </ul>
            </div>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Processing Times</h2>
          <div class="bg-gray-50 rounded-lg p-6">
            <div class="space-y-4">
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="flex items-center justify-center h-8 w-8 rounded-full bg-green-100 text-green-600 font-semibold">1</div>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">Order Processing</h3>
                  <p class="text-gray-700">Orders are processed within 1-2 business days after payment confirmation.</p>
                </div>
              </div>
              
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600 font-semibold">2</div>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">Packaging</h3>
                  <p class="text-gray-700">Items are carefully packaged to ensure safe delivery.</p>
                </div>
              </div>
              
              <div class="flex items-center">
                <div class="flex-shrink-0">
                  <div class="flex items-center justify-center h-8 w-8 rounded-full bg-purple-100 text-purple-600 font-semibold">3</div>
                </div>
                <div class="ml-4">
                  <h3 class="text-lg font-medium text-gray-900">Shipping</h3>
                  <p class="text-gray-700">Packages are handed over to our shipping partners for delivery.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Delivery Information</h2>
          <div class="space-y-6">
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Delivery Attempts</h3>
              <p class="text-gray-700 mb-3">
                We make up to 3 delivery attempts. If no one is available to receive the package:
              </p>
              <ul class="list-disc list-inside text-gray-700 space-y-1">
                <li>The package will be left at your door (if safe to do so)</li>
                <li>A delivery notice will be left with pickup instructions</li>
                <li>The package will be held at the local delivery facility</li>
                <li>You'll receive a notification with pickup details</li>
              </ul>
            </div>
            
            <div class="bg-white border border-gray-200 rounded-lg p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-3">Signature Requirements</h3>
              <p class="text-gray-700 mb-3">
                Signature is required for:
              </p>
              <ul class="list-disc list-inside text-gray-700 space-y-1">
                <li>All overnight deliveries</li>
                <li>Orders over $200</li>
                <li>International shipments</li>
                <li>When specifically requested by the customer</li>
              </ul>
            </div>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">International Shipping</h2>
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 class="text-lg font-semibold text-blue-900 mb-3">Important Information</h3>
            <ul class="space-y-2 text-blue-800">
              <li>• Delivery times may vary due to customs processing</li>
              <li>• Additional customs duties and taxes may apply</li>
              <li>• These fees are the responsibility of the recipient</li>
              <li>• We cannot control customs delays or fees</li>
              <li>• Some items may be restricted in certain countries</li>
            </ul>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Tracking Your Order</h2>
          <div class="space-y-4">
            <p class="text-gray-700">
              Once your order ships, you'll receive a tracking number via email. You can use this number to:
            </p>
            <ul class="list-disc list-inside text-gray-700 space-y-1">
              <li>Track your package in real-time</li>
              <li>See estimated delivery date</li>
              <li>View delivery status updates</li>
              <li>Request delivery preferences</li>
            </ul>
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <p class="text-green-800">
                <strong>Pro Tip:</strong> You can also track your order by logging into your account 
                and visiting the "My Orders" section.
              </p>
            </div>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Shipping Issues</h2>
          <div class="space-y-4">
            <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 class="text-lg font-medium text-yellow-800 mb-2">Delayed Shipments</h3>
              <p class="text-yellow-700">
                If your order is delayed, we'll notify you immediately and provide updated delivery estimates. 
                We'll also offer compensation options when appropriate.
              </p>
            </div>
            
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 class="text-lg font-medium text-red-800 mb-2">Lost or Damaged Packages</h3>
              <p class="text-red-700">
                If your package is lost or damaged during shipping, please contact us immediately. 
                We'll work with our shipping partners to resolve the issue and ensure you receive 
                a replacement or full refund.
              </p>
            </div>
          </div>
        </section>

        <section class="mb-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p class="text-gray-700 mb-4">
            If you have any questions about shipping or need assistance with your order, 
            please contact our customer support team.
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-white border border-gray-200 rounded-lg p-4">
              <h3 class="font-medium text-gray-900 mb-2">Email Support</h3>
              <p class="text-gray-600">shipping@srijani.com</p>
              <p class="text-sm text-gray-500">Response within 24 hours</p>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg p-4">
              <h3 class="font-medium text-gray-900 mb-2">Phone Support</h3>
              <p class="text-gray-600">+1 (555) 123-4567</p>
              <p class="text-sm text-gray-500">Mon-Fri, 9 AM - 6 PM EST</p>
            </div>
          </div>
        </section>

        <section class="text-sm text-gray-500 border-t pt-6">
          <p>Last updated: {{ new Date().toLocaleDateString() }}</p>
          <p class="mt-2">
            This shipping policy is subject to change without notice. Please check back periodically 
            for updates.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
// No additional logic needed for this static page
</script>

<style scoped>
.shipping-policy-page {
  @apply min-h-screen bg-gray-50;
}
</style>
