# Vercel部署指南

## 概述
本指南将帮助您将qian项目部署到Vercel平台。Vercel提供了免费的静态网站托管服务，支持自动部署、CDN加速和全球边缘网络。

## 部署前准备

### 1. 注册Vercel账户
1. 访问 [vercel.com](https://vercel.com)
2. 使用GitHub、GitLab或Bitbucket账户注册
3. 完成邮箱验证

### 2. 准备代码仓库
确保您的项目已经推送到GitHub、GitLab或Bitbucket等Git平台。

### 3. 配置后端服务
确保您的后端服务（hou项目）已经部署并可以通过公网访问。

## 部署步骤

### 方法一：通过Vercel Dashboard部署（推荐）

1. **导入项目**
   - 登录Vercel Dashboard
   - 点击"New Project"
   - 选择您的Git仓库
   - 点击"Import"

2. **配置项目**
   - **Framework Preset**: 选择"Vite"
   - **Root Directory**: 保持默认（如果项目在根目录）
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

3. **环境变量配置**
   - 在"Environment Variables"部分添加：
     - `VITE_API_BASE_URL`: 您的后端服务器地址（如：`https://your-backend-server.com`）

4. **部署**
   - 点击"Deploy"
   - 等待构建完成

### 方法二：使用Vercel CLI部署

1. **安装Vercel CLI**
```bash
npm i -g vercel
```

2. **登录Vercel**
```bash
vercel login
```

3. **部署项目**
```bash
# 在项目根目录执行
vercel

# 或者直接部署到生产环境
vercel --prod
```

4. **配置环境变量**
```bash
vercel env add VITE_API_BASE_URL
```

## 配置说明

### vercel.json配置
项目根目录的`vercel.json`文件包含以下配置：

- **builds**: 指定构建配置
- **routes**: 配置路由规则，支持React Router的history模式
- **env**: 环境变量配置
- **headers**: 静态资源缓存配置

### 环境变量
在Vercel Dashboard中设置以下环境变量：

| 变量名 | 说明 | 示例值 |
|--------|------|--------|
| `VITE_API_BASE_URL` | 后端API地址 | `https://your-backend-server.com` |
| `VITE_APP_TITLE` | 应用标题 | `积分系统` |

## 自定义域名

### 1. 添加自定义域名
1. 在Vercel Dashboard中选择您的项目
2. 进入"Settings" > "Domains"
3. 点击"Add Domain"
4. 输入您的域名
5. 按照提示配置DNS记录

### 2. DNS配置
将域名的A记录指向Vercel提供的IP地址，或使用CNAME记录指向Vercel提供的域名。

## 自动部署

### 1. Git集成
Vercel会自动监听您的Git仓库变化：
- 推送到`main`分支 → 自动部署到生产环境
- 创建Pull Request → 自动部署预览版本

### 2. 部署钩子
您也可以使用部署钩子手动触发部署：
```bash
curl -X POST https://api.vercel.com/v1/integrations/deploy/prj_xxx
```

## 性能优化

### 1. 自动优化
Vercel会自动进行以下优化：
- 静态资源压缩
- 图片优化
- CDN分发
- 边缘缓存

### 2. 预构建
Vercel会在构建时预构建页面，提高首屏加载速度。

## 监控和分析

### 1. 访问分析
Vercel提供内置的访问分析功能：
- 页面访问量
- 地理位置分布
- 设备类型统计

### 2. 性能监控
- Core Web Vitals指标
- 加载时间分析
- 错误率监控

## 常见问题

### 1. 构建失败
**问题**: 构建过程中出现错误
**解决方案**:
- 检查Node.js版本（Vercel支持14.x、16.x、18.x）
- 确保所有依赖都正确安装
- 检查构建命令是否正确

### 2. API请求失败
**问题**: 前端无法连接到后端API
**解决方案**:
- 检查`VITE_API_BASE_URL`环境变量是否正确设置
- 确认后端服务可以正常访问
- 检查CORS配置

### 3. 路由问题
**问题**: 直接访问路由页面显示404
**解决方案**:
- 确认`vercel.json`中的路由配置正确
- 检查React Router配置

### 4. 环境变量不生效
**问题**: 环境变量在生产环境中未生效
**解决方案**:
- 确保环境变量以`VITE_`开头
- 重新部署项目
- 检查环境变量是否在正确的环境中设置

## 高级配置

### 1. 重定向规则
在`vercel.json`中添加重定向规则：
```json
{
  "redirects": [
    {
      "source": "/old-page",
      "destination": "/new-page",
      "permanent": true
    }
  ]
}
```

### 2. 头部配置
添加自定义HTTP头：
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Custom-Header",
          "value": "Custom Value"
        }
      ]
    }
  ]
}
```

### 3. 函数配置
如果需要API函数：
```json
{
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x"
    }
  }
}
```

## 维护和更新

### 1. 更新部署
- 推送代码到Git仓库即可自动触发新部署
- 或使用`vercel --prod`手动部署

### 2. 回滚部署
在Vercel Dashboard中可以查看部署历史并回滚到之前的版本。

### 3. 团队协作
- 邀请团队成员到Vercel项目
- 设置不同的权限级别
- 使用团队账户管理多个项目

## 联系支持
- Vercel官方文档: [vercel.com/docs](https://vercel.com/docs)
- Vercel社区: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- 技术支持: [vercel.com/support](https://vercel.com/support) 