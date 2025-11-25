const axios = require('axios');

async function testAPIEndpoint() {
  try {
    console.log('🧪 Testing the actual API endpoint with updated prompts...');

    const response = await axios.post('http://localhost:5000/api/ai/chat', {
      messages: [{ role: 'user', content: 'hi lets work on my project' }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test' // Using test token for now
      }
    });

    console.log('✅ API Response received!');
    console.log('\n📝 AI Response:');
    console.log('---');
    console.log(response.data.data.response);
    console.log('---');

    // Check for asterisks and verbose content
    const text = response.data.data.response;
    const asteriskCount = (text.match(/\*/g) || []).length;
    const wordCount = text.split(' ').length;

    console.log(`\n🔍 Analysis:`);
    console.log(`- Asterisks found: ${asteriskCount}`);
    console.log(`- Word count: ${wordCount}`);
    console.log(`- Contains "Welcome": ${text.toLowerCase().includes('welcome')}`);
    console.log(`- Contains "FinalYearNG AI": ${text.toLowerCase().includes('finalyearng ai')}`);

    if (asteriskCount === 0 && wordCount < 50 && !text.toLowerCase().includes('welcome')) {
      console.log('✅ Perfect! Clean, focused response');
    } else {
      console.log('⚠️  Response still needs improvement');
    }

  } catch (error) {
    console.error('❌ API Test failed!');
    console.error('Error:', error.response?.data || error.message);
  }
}

testAPIEndpoint();
