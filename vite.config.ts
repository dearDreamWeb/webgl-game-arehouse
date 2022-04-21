import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const { resolve } = require('path');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8422
  },
  css: {
    //* css模块化
    modules: { // css模块化 文件以.module.[css|less|scss]结尾
      generateScopedName: '[name]__[local]___[hash:base64:5]',
      hashPrefix: 'prefix',
    },
    //* 预编译支持less
    preprocessorOptions: {
      less: {
        // 支持内联 JavaScript
        javascriptEnabled: true,
      },
    },
  },
  resolve: {
    // 配置路径 别名
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, 'src'),
      },
    ],
  },
})
