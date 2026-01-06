// 测试验证码发送
const axios = require('axios');

async function testVerificationCode() {
  try {
    console.log('测试验证码发送...');
    const response = await axios.post('http://localhost:3001/api/auth/send-verification-code', {
      phone: '13800138000',
      type: 'REGISTER'
    });
    
    console.log('响应:', response.data);
    if (response.data.code) {
      console.log(`验证码是: ${response.data.code}`);
    }
  } catch (error) {
    console.error('错误:', error.response?.data || error.message);
  }
}

testVerificationCode();