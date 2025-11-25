const axios = require('axios');
require('dotenv').config();

async function listModels() {
  try {
    console.log('📋 Getting available Gemini models...');

    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    console.log('✅ Available models:');
    response.data.models.forEach(model => {
      console.log(`- ${model.name}: ${model.description}`);
      console.log(`  Supported methods: ${model.supportedGenerationMethods.join(', ')}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Failed to list models!');
    console.error('Error:', error.response?.data || error.message);
  }
}

listModels();
