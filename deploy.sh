#!/bin/bash

# 部署脚本
echo "开始部署qian项目..."

# 1. 安装依赖
echo "安装依赖..."
npm install

# 2. 构建项目
echo "构建项目..."
npm run build

# 3. 检查构建结果
if [ -d "dist" ]; then
    echo "构建成功！"
    echo "构建文件位于 dist/ 目录"
    
    # 4. 显示构建文件大小
    echo "构建文件大小："
    du -sh dist/
    
    # 5. 列出主要文件
    echo "主要文件："
    ls -la dist/
    
    echo "部署完成！"
    echo "请将 dist/ 目录的内容上传到您的Web服务器"
    echo "或者将 dist/ 目录复制到您的服务器目录中"
else
    echo "构建失败！请检查错误信息"
    exit 1
fi 