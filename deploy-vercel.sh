#!/bin/bash

# Vercel快速部署脚本
echo "🚀 开始Vercel部署流程..."

# 检查是否安装了Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI未安装，正在安装..."
    npm install -g vercel
fi

# 检查是否已登录
if ! vercel whoami &> /dev/null; then
    echo "🔐 请先登录Vercel..."
    vercel login
fi

# 检查项目配置
echo "📋 检查项目配置..."
if [ ! -f "package.json" ]; then
    echo "❌ 未找到package.json文件"
    exit 1
fi

if [ ! -f "vite.config.js" ]; then
    echo "❌ 未找到vite.config.js文件"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 本地构建测试
echo "🔨 本地构建测试..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ 本地构建成功"
else
    echo "❌ 本地构建失败，请检查错误信息"
    exit 1
fi

# 部署到Vercel
echo "🌐 部署到Vercel..."
echo "请按照提示配置部署选项："
echo "- Framework Preset: Vite"
echo "- Build Command: npm run build"
echo "- Output Directory: dist"
echo "- Development Command: npm run dev"

vercel --prod

echo "🎉 部署完成！"
echo "📝 请记得在Vercel Dashboard中配置环境变量："
echo "   - VITE_API_BASE_URL: 您的后端服务器地址" 