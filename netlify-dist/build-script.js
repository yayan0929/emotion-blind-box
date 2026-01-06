const { build } = require('vite');
const path = require('path');

// 自定义构建配置
const config = {
  configFile: path.resolve(__dirname, 'vite.config.ts'),
  mode: 'production'
};

// 运行构建
build(config).catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});