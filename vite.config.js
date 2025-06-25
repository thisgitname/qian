import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import postcssImport from 'postcss-import'
import autoprefixer from 'autoprefixer'
import postcssPxToRem from 'postcss-pxtorem'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // 使用相对路径，适合部署到子目录
  server: {
    proxy: {
      '/wsj': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false
      }
    },
    historyApiFallback: true,
  },
  css: {
    postcss: {
      plugins: [
        postcssImport(),
        autoprefixer(),
        postcssPxToRem({
          rootValue: 37.5, // 根据设计稿宽度计算，使用amfe-flexible的标准
          propList: ['*'], // 需要转换的属性，*表示所有属性
          selectorBlackList: [], // 忽略的选择器
          replace: true,
          mediaQuery: false,
          minPixelValue: 0,
          exclude: /node_modules/i // 忽略包文件转换rem
        })
      ]
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // 生产环境不生成sourcemap
    minify: 'terser', // 使用terser进行代码压缩
    terserOptions: {
      compress: {
        drop_console: true, // 移除console.log
        drop_debugger: true, // 移除debugger
      },
    },
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        manualChunks: {
          vendor: ['react', 'react-dom'],
          antd: ['antd', 'antd-mobile'],
        },
      },
    },
  },
})
