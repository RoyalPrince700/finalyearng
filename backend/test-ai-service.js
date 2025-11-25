const { callAI } = require('./services/aiService');

async function testAIService() {
  try {
    console.log('🔍 Testing AI service directly with updated prompts...');

    // Test the callAI function directly with chat review task type
    const response = await callAI(
      undefined, // use default model
      [{ role: 'user', content: 'hi lets work on my project' }],
      'CHAT_REVIEW'
    );

    console.log('✅ AI Service Response received!');
    console.log('\n📝 AI Response:');
    console.log('---');
    console.log(response);
    console.log('---');

    const asteriskCount = (response.match(/\*/g) || []).length;
    const hasWelcome = response.toLowerCase().includes('welcome');
    const hasVerboseIntro = response.toLowerCase().includes('finalyearng ai');

    console.log(`\n🔍 Analysis:`);
    console.log(`- Asterisks: ${asteriskCount}`);
    console.log(`- Contains "Welcome": ${hasWelcome}`);
    console.log(`- Contains verbose intro: ${hasVerboseIntro}`);
    console.log(`- Response length: ${response.length} characters`);

    if (asteriskCount === 0 && !hasWelcome && !hasVerboseIntro && response.length < 200) {
      console.log('🎉 SUCCESS: Clean, focused response!');
    } else {
      console.log('⚠️  Response still has issues');
    }

  } catch (error) {
    console.error('❌ AI Service test failed!');
    console.error('Error:', error.message);
  }
}

testAIService();
