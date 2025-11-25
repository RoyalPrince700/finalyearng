const axios = require('axios');

async function quickTest() {
  try {
    console.log('🔍 Testing updated AI prompts...');

    const response = await axios.post('http://localhost:5000/api/ai/chat', {
      messages: [{ role: 'user', content: 'hi lets work on my project' }]
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test'
      },
      timeout: 15000
    });

    console.log('✅ API Response received!');
    console.log('\n📝 AI Response:');
    console.log('---');
    console.log(response.data.data.response);
    console.log('---');

    const text = response.data.data.response;
    const asteriskCount = (text.match(/\*/g) || []).length;
    const hasWelcome = text.toLowerCase().includes('welcome');
    const hasVerboseIntro = text.toLowerCase().includes('finalyearng ai');

    console.log(`\n🔍 Analysis:`);
    console.log(`- Asterisks: ${asteriskCount}`);
    console.log(`- Contains "Welcome": ${hasWelcome}`);
    console.log(`- Contains verbose intro: ${hasVerboseIntro}`);

    if (asteriskCount === 0 && !hasWelcome && !hasVerboseIntro) {
      console.log('🎉 SUCCESS: Clean, focused response!');
    } else {
      console.log('⚠️  Still has formatting issues');
    }

  } catch (error) {
    console.error('❌ Test failed!');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

quickTest();
