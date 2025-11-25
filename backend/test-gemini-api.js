const axios = require('axios');
require('dotenv').config();

async function testGeminiAPI() {
  try {
    console.log('🔍 Testing Gemini API Key...');
    console.log('API Key loaded:', !!process.env.GEMINI_API_KEY);

    if (process.env.GEMINI_API_KEY) {
      console.log('API Key preview:', process.env.GEMINI_API_KEY.substring(0, 15) + '...');
    }

    // Simple test message using Gemini format
    const testMessage = {
      contents: [{
        role: 'user',
        parts: [{ text: 'Hello! This is a test message. Please respond with exactly: "Test successful - Gemini API is working!"' }]
      }],
      generationConfig: {
        temperature: 0.1, // Low temperature for consistent response
        maxOutputTokens: 50
      }
    };

    console.log('📤 Sending request to Gemini API...');

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      testMessage,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000 // 15 second timeout
      }
    );

    console.log('✅ SUCCESS! Gemini API is working!');
    const text = response.data.candidates[0].content.parts
      .map(part => part.text)
      .join('');
    console.log('Response:', text.trim());
    console.log('Model used:', 'gemini-flash-latest');

  } catch (error) {
    console.error('❌ Gemini API Test Failed!');
    console.error('Error Type:', error.response?.status || error.code || 'Unknown');

    if (error.response) {
      console.error('Status Code:', error.response.status);
      console.error('Error Message:', error.response.data?.error?.message || 'Unknown error');
      console.error('Error Details:', JSON.stringify(error.response.data, null, 2));
    } else if (error.code === 'ENOTFOUND') {
      console.error('Network Issue: Cannot reach generativelanguage.googleapis.com');
      console.error('Check your internet connection or firewall settings.');
    } else {
      console.error('Error:', error.message);
    }

    console.log('\n🔧 Troubleshooting Tips:');
    console.log('1. Verify the API key is correct in your Google AI Studio');
    console.log('2. Check if your account has credits/balance');
    console.log('3. Ensure the API key has not expired');
    console.log('4. Try regenerating the API key in Google AI Studio');
    console.log('5. Make sure billing is enabled if required');
  }
}

testGeminiAPI();
