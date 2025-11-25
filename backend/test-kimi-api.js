const axios = require('axios');
require('dotenv').config();

async function testKimiAPI() {
  try {
    console.log('🔍 Testing Kimi API Key...');
    console.log('API Key loaded:', !!process.env.KIMI_API_KEY);
    console.log('Base URL:', process.env.KIMI_BASE_URL || 'https://api.moonshot.cn/v1');

    if (process.env.KIMI_API_KEY) {
      console.log('API Key preview:', process.env.KIMI_API_KEY.substring(0, 15) + '...');
    }

    // Simple test message
    const testMessage = {
      model: 'kimi-free',
      messages: [
        { role: 'user', content: 'Hello! This is a test message. Please respond with exactly: "Test successful - API is working!"' }
      ],
      temperature: 0.1, // Low temperature for consistent response
      max_tokens: 50
    };

    console.log('📤 Sending request to Kimi API...');

    const response = await axios.post(
      `${process.env.KIMI_BASE_URL || 'https://api.moonshot.cn/v1'}/chat/completions`,
      testMessage,
      {
        headers: {
          'Authorization': `Bearer ${process.env.KIMI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 15000 // 15 second timeout
      }
    );

    console.log('✅ SUCCESS! API is working!');
    console.log('Response:', response.data.choices[0].message.content.trim());
    console.log('Model used:', response.data.model);
    console.log('Tokens used:', response.data.usage?.total_tokens || 'N/A');

  } catch (error) {
    console.error('❌ API Test Failed!');
    console.error('Error Type:', error.response?.status || error.code || 'Unknown');

    if (error.response) {
      console.error('Status Code:', error.response.status);
      console.error('Error Message:', error.response.data?.error?.message || 'Unknown error');
      console.error('Error Type:', error.response.data?.error?.type || 'Unknown type');
    } else if (error.code === 'ENOTFOUND') {
      console.error('Network Issue: Cannot reach api.moonshot.cn');
      console.error('Check your internet connection or firewall settings.');
    } else {
      console.error('Error:', error.message);
    }

    console.log('\n🔧 Troubleshooting Tips:');
    console.log('1. Verify the API key is correct in your Moonshot AI dashboard');
    console.log('2. Check if your account has credits/balance');
    console.log('3. Ensure the API key has not expired');
    console.log('4. Try regenerating the API key in your dashboard');
  }
}

testKimiAPI();