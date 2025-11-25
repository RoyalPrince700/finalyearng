const axios = require('axios');

async function testConversations() {
  try {
    console.log('🧪 Testing conversation API endpoints...\n');

    // Test 1: Create a conversation
    console.log('1. Creating new conversation...');
    const createResponse = await axios.post('http://localhost:5000/api/conversations', {
      title: 'Test Conversation',
      type: 'general'
    }, {
      headers: {
        'Authorization': 'Bearer test'
      }
    });

    console.log('✅ Conversation created:', createResponse.data.data.title);
    const conversationId = createResponse.data.data.id;

    // Test 2: Add a message
    console.log('\n2. Adding message to conversation...');
    await axios.post(`http://localhost:5000/api/conversations/${conversationId}/messages`, {
      role: 'user',
      content: 'Hello, this is a test message!'
    }, {
      headers: {
        'Authorization': 'Bearer test'
      }
    });
    console.log('✅ Message added');

    // Test 3: Get conversations
    console.log('\n3. Fetching user conversations...');
    const listResponse = await axios.get('http://localhost:5000/api/conversations', {
      headers: {
        'Authorization': 'Bearer test'
      }
    });
    console.log('✅ Found', listResponse.data.data.length, 'conversations');

    // Test 4: Get specific conversation
    console.log('\n4. Fetching specific conversation...');
    const getResponse = await axios.get(`http://localhost:5000/api/conversations/${conversationId}`, {
      headers: {
        'Authorization': 'Bearer test'
      }
    });
    console.log('✅ Conversation retrieved with', getResponse.data.data.messageCount, 'messages');

    // Test 5: Get stats
    console.log('\n5. Getting conversation stats...');
    const statsResponse = await axios.get('http://localhost:5000/api/conversations/stats', {
      headers: {
        'Authorization': 'Bearer test'
      }
    });
    console.log('✅ Stats:', statsResponse.data.data);

    console.log('\n🎉 All conversation API tests passed!');

  } catch (error) {
    console.error('❌ Test failed!');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
  }
}

testConversations();
