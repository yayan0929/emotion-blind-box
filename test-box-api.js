const axios = require('axios');

const API_BASE = 'http://localhost:3001';

async function testAPI() {
  try {
    // 1. 登录获取token
    console.log('1. 登录获取token...');
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      phone: 'testuser3',
      password: '123456'
    });
    
    const token = loginResponse.data.data.tokens.accessToken;
    const userId = loginResponse.data.data.user.id;
    
    console.log('登录成功:', loginResponse.data.message);
    console.log('用户ID:', userId);
    console.log('Token:', token.substring(0, 50) + '...');
    
    // 2. 创建一个盲盒
    console.log('\n2. 创建一个盲盒...');
    const createBoxResponse = await axios.post(`${API_BASE}/api/boxes`, {
      content: '今天考试感觉压力好大，希望能找到一些支持...',
      isPublic: true,
      allowReply: true
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    const boxId = createBoxResponse.data.data.box.id;
    console.log('创建盲盒成功:', createBoxResponse.data.message);
    console.log('盲盒ID:', boxId);
    
    // 3. 获取盲盒列表
    console.log('\n3. 获取盲盒列表...');
    const boxesResponse = await axios.get(`${API_BASE}/api/boxes`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('获取盲盒列表成功，共有', boxesResponse.data.data.boxes.length, '个盲盒');
    
    // 4. 随机获取一个盲盒
    console.log('\n4. 随机获取一个盲盒...');
    try {
      const randomBoxResponse = await axios.get(`${API_BASE}/api/boxes/random/one`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('随机获取盲盒成功:', randomBoxResponse.data.message);
      console.log('盲盒内容:', randomBoxResponse.data.data.box.content);
    } catch (error) {
      console.log('随机获取盲盒失败:', error.response?.data?.message || error.message);
    }
    
    // 5. 回复盲盒
    console.log('\n5. 回复盲盒...');
    try {
      const replyResponse = await axios.post(`${API_BASE}/api/replies`, {
        boxId: boxId,
        content: '加油！考试只是人生的一小部分，不要给自己太大压力。'
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('回复盲盒成功:', replyResponse.data.message);
    } catch (error) {
      console.log('回复盲盒失败:', error.response?.data?.message || error.message);
    }
    
    // 6. 获取盲盒详情（包含回复）
    console.log('\n6. 获取盲盒详情（包含回复）...');
    const boxDetailResponse = await axios.get(`${API_BASE}/api/boxes/${boxId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('获取盲盒详情成功');
    console.log('盲盒内容:', boxDetailResponse.data.data.box.content);
    console.log('回复数量:', boxDetailResponse.data.data.box.replies.length);
    
    console.log('\n测试完成！');
  } catch (error) {
    console.error('测试过程中出错:', error.response?.data || error.message);
  }
}

testAPI();