const axios = require('axios');
require('dotenv').config();

async function testChatFormatting() {
  try {
    console.log('🧪 Testing chat formatting with updated prompts...');

    // Test message simulating a chat review scenario
    const testMessage = {
      contents: [{
        role: 'user',
        parts: [{ text: 'Can you help me with my project introduction? Here is what I have written: "This project is about developing a web application for student management. It will help schools manage their students better."' }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
        topP: 0.9,
        responseMimeType: "text/plain"
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_ONLY_HIGH"
        }
      ]
    };

    // Add system prompt for chat review
    const systemPrompt = `
You are FinalYearNG AI, a specialized assistant for Nigerian university students writing final year projects.

Focus strictly on helping with academic project writing. Provide direct, concise feedback and suggestions. Use plain text without markdown formatting or asterisks. Be helpful but brief.

When reviewing writing:
- Give specific feedback on content and structure
- Suggest improvements in clarity and academic tone
- Help with APA formatting when needed
- Focus on project writing standards
- Keep responses focused and actionable
`;

    testMessage.contents.unshift({
      role: 'user',
      parts: [{ text: systemPrompt }]
    });

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      testMessage,
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 15000
      }
    );

    console.log('✅ Chat formatting test completed!');
    const text = response.data.candidates[0].content.parts
      .map(part => part.text)
      .join('');

    console.log('\n📝 AI Response:');
    console.log('---');
    console.log(text);
    console.log('---');

    // Check for asterisks
    const asteriskCount = (text.match(/\*/g) || []).length;
    console.log(`\n🔍 Formatting check: ${asteriskCount} asterisks found`);

    if (asteriskCount === 0) {
      console.log('✅ Clean formatting - no asterisks!');
    } else {
      console.log('⚠️  Still contains asterisks');
    }

  } catch (error) {
    console.error('❌ Test failed!');
    console.error('Error:', error.response?.data || error.message);
  }
}

testChatFormatting();
