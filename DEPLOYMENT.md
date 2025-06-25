# qian项目部署指南

## 项目概述
这是一个基于React + Vite的前端项目，包含积分系统、用户管理、圈子社交等功能。

## 部署前准备

### 1. 环境要求
- Node.js >= 16.0.0
- npm >= 8.0.0

### 2. 后端服务
确保后端服务（hou项目）已经部署并正常运行，前端需要连接到后端API。

## 部署步骤

### 方法一：使用部署脚本（推荐）

1. 给脚本执行权限：
```bash
chmod +x deploy.sh
```

2. 运行部署脚本：
```bash
./deploy.sh
```

### 方法二：手动部署

1. 安装依赖：
```bash
npm install
```

2. 构建项目：
```bash
npm run build
```

3. 检查构建结果：
```bash
ls -la dist/
```

## 部署配置

### 1. 修改API地址
在 `src/config/api.js` 文件中，将生产环境的API地址修改为您的实际服务器地址：

```javascript
export const API_BASE_URL = isDev 
  ? 'http://localhost:3000' 
  : 'http://your-production-server.com'; // 修改为实际地址
```

### 2. 环境变量配置
如果需要使用环境变量，可以创建 `.env.production` 文件：

```env
VITE_API_BASE_URL=http://your-production-server.com
VITE_APP_TITLE=您的应用名称
```

## 部署到不同平台

### 1. 静态文件服务器
将 `dist/` 目录的内容上传到您的Web服务器（如Nginx、Apache等）。

### 2. CDN部署
将 `dist/` 目录的内容上传到CDN服务商（如阿里云OSS、腾讯云COS等）。

### 3. 云平台部署
- **Vercel**: 直接连接Git仓库，自动部署
- **Netlify**: 拖拽 `dist/` 目录到部署区域
- **GitHub Pages**: 将 `dist/` 目录内容推送到gh-pages分支

## 服务器配置

### Nginx配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/your/dist;
    index index.html;

    # 处理React Router的history模式
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API代理（如果需要）
    location /api/ {
        proxy_pass http://your-backend-server:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 常见问题

### 1. 构建失败
- 检查Node.js版本是否符合要求
- 清除node_modules并重新安装：`rm -rf node_modules && npm install`

### 2. 页面空白
- 检查API地址配置是否正确
- 检查浏览器控制台是否有错误信息
- 确认后端服务是否正常运行

### 3. 路由问题
- 确保服务器配置了正确的history模式支持
- 检查vite.config.js中的base配置

### 4. 静态资源404
- 检查vite.config.js中的assetsDir配置
- 确认服务器正确配置了静态文件服务

## 性能优化

### 1. 代码分割
项目已配置了代码分割，将React和Antd等库分离打包。

### 2. 资源压缩
构建时会自动压缩JS、CSS文件，移除console.log等调试代码。

### 3. 缓存策略
- JS、CSS文件使用hash命名，支持长期缓存
- 图片等静态资源配置了缓存头

## 监控和维护

### 1. 错误监控
建议集成错误监控服务（如Sentry）来捕获生产环境错误。

### 2. 性能监控
可以使用Google Analytics或其他性能监控工具。

### 3. 日志分析
分析用户访问日志，了解使用情况。

## 联系支持
如有部署问题，请检查：
1. 项目文档
2. 控制台错误信息
3. 网络连接状态
4. 服务器配置 