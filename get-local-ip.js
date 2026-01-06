const { networkInterfaces } = require('os');

function getLocalIP() {
  const nets = networkInterfaces();
  const results = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      // 跳过内部地址和非IPv4地址
      if (net.family === 'IPv4' && !net.internal) {
        results.push(net.address);
      }
    }
  }

  return results;
}

const ips = getLocalIP();
console.log('本地网络IP地址:');
ips.forEach(ip => {
  console.log(`- ${ip}`);
});

if (ips.length > 0) {
  console.log('\n访问地址:');
  console.log(`- 前端: http://${ips[0]}:5173`);
  console.log(`- 后端API: http://${ips[0]}:3001`);
  console.log('\n其他设备可以通过以上地址访问');
} else {
  console.log('未找到可用的网络接口');
}