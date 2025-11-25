const { callAI } = require('./services/aiService');

async function testProjectTopic() {
  try {
    console.log('🔍 Testing AI response with project topic...');

    const response = await callAI(
      undefined, // use default model
      [{ role: 'user', content: 'my project topic is post harvest management practices among maize farmers in oyo state' }],
      'CHAT_REVIEW'
    );

    console.log('✅ AI Response received!');
    console.log('\n📝 AI Response:');
    console.log('---');
    console.log(response);
    console.log('---');

    const wordCount = response.split(' ').length;
    const hasQuestions = response.includes('?');
    const hasChapter = response.toLowerCase().includes('chapter');
    const hasReference = response.toLowerCase().includes('apa') || response.toLowerCase().includes('reference');

    console.log(`\n🔍 Analysis:`);
    console.log(`- Word count: ${wordCount}`);
    console.log(`- Contains questions: ${hasQuestions}`);
    console.log(`- Mentions chapters: ${hasChapter}`);
    console.log(`- Mentions referencing: ${hasReference}`);
    console.log(`- Comprehensive response: ${wordCount > 200 && hasChapter && hasReference}`);

  } catch (error) {
    console.error('❌ Test failed!');
    console.error('Error:', error.message);
  }
}

testProjectTopic();
