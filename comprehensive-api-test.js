// Comprehensive API Debugging Script
// Run this in your browser console on your deployed frontend

const API_BASE = 'https://srijani-order-portal-backend.onrender.com/api';
const token = localStorage.getItem('token');

console.log('🔍 Starting comprehensive API debugging...');
console.log('🔑 Token found:', !!token);

// Test 1: Health Check
const testHealthCheck = async () => {
  try {
    console.log('\n🏥 Testing health check...');
    const response = await fetch(`${API_BASE}/orders/health`);
    const data = await response.json();
    console.log('📊 Health check result:', data);
    return data.status === 'ok';
  } catch (error) {
    console.error('❌ Health check failed:', error);
    return false;
  }
};

// Test 2: Debug Endpoint
const testDebugEndpoint = async () => {
  try {
    console.log('\n🐛 Testing debug endpoint...');
    const response = await fetch(`${API_BASE}/orders/debug`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ test: 'data' })
    });
    const data = await response.json();
    console.log('📊 Debug endpoint result:', data);
    return response.ok;
  } catch (error) {
    console.error('❌ Debug endpoint failed:', error);
    return false;
  }
};

// Test 3: Order Creation with Minimal Data
const testMinimalOrderCreation = async () => {
  try {
    console.log('\n📦 Testing minimal order creation...');
    const minimalData = {
      customer_email: 'test@example.com',
      customer_name: 'Test User',
      items: [
        {
          product_name: 'Test Product',
          quantity: 1,
          unit_price: 10
        }
      ]
    };
    
    console.log('📤 Sending minimal data:', minimalData);
    
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(minimalData)
    });

    const data = await response.json();
    console.log('📊 Response status:', response.status);
    console.log('📊 Response data:', data);
    
    if (response.ok) {
      console.log('✅ Minimal order creation successful!');
      return true;
    } else {
      console.log('❌ Minimal order creation failed');
      return false;
    }
  } catch (error) {
    console.error('💥 Minimal order creation error:', error);
    return false;
  }
};

// Test 4: Order Creation with Full Data (from your error)
const testFullOrderCreation = async () => {
  try {
    console.log('\n📦 Testing full order creation...');
    const fullData = {
      customer_email: 'raunaksarmacharya@gmail.com',
      customer_name: 'satyajit debnath',
      customer_phone: '9831691549',
      items: [
        {
          product_name: 'fhudb',
          sku: 'idsn',
          description: 'kjnjk',
          quantity: 1,
          unit_price: 100,
          size: 'kjn',
          color: 'red',
          material: 'ksm'
        }
      ],
      payment_method: '',
      currency: 'EUR',
      estimated_delivery: '2025-10-30',
      shipping_address_id: '6ACharu Chandra Avenue',
      billing_address_id: '',
      special_instructions: 'kjnfd',
      internal_notes: 'asdj'
    };
    
    console.log('📤 Sending full data:', fullData);
    
    const response = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(fullData)
    });

    const data = await response.json();
    console.log('📊 Response status:', response.status);
    console.log('📊 Response data:', data);
    
    if (response.ok) {
      console.log('✅ Full order creation successful!');
      return true;
    } else {
      console.log('❌ Full order creation failed');
      return false;
    }
  } catch (error) {
    console.error('💥 Full order creation error:', error);
    return false;
  }
};

// Run all tests
const runAllTests = async () => {
  console.log('🚀 Starting comprehensive API tests...');
  
  const results = {
    healthCheck: await testHealthCheck(),
    debugEndpoint: await testDebugEndpoint(),
    minimalOrder: await testMinimalOrderCreation(),
    fullOrder: await testFullOrderCreation()
  };
  
  console.log('\n📋 Test Results Summary:');
  console.log('🏥 Health Check:', results.healthCheck ? '✅ PASS' : '❌ FAIL');
  console.log('🐛 Debug Endpoint:', results.debugEndpoint ? '✅ PASS' : '❌ FAIL');
  console.log('📦 Minimal Order:', results.minimalOrder ? '✅ PASS' : '❌ FAIL');
  console.log('📦 Full Order:', results.fullOrder ? '✅ PASS' : '❌ FAIL');
  
  if (results.healthCheck && results.debugEndpoint && results.minimalOrder) {
    console.log('\n🎉 Basic functionality is working! The issue might be with specific data validation.');
  } else {
    console.log('\n🚨 There are fundamental issues with the API. Check Render logs for details.');
  }
  
  return results;
};

// Run the tests
runAllTests();
