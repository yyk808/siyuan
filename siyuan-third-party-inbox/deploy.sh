#!/bin/bash

# SiYuan Third-Party Inbox 部署脚本
# 一键部署到 Cloudflare Workers

set -e

echo "🚀 开始部署 SiYuan Third-Party Inbox..."

# 检查是否已登录 Cloudflare
if ! npx wrangler whoami &>/dev/null; then
  echo "❌ 请先登录 Cloudflare: wrangler auth login"
  exit 1
fi

echo "✅ Cloudflare 认证通过"

# 检查依赖是否安装
if [ ! -d "node_modules" ]; then
  echo "📦 安装依赖..."
  npm install
fi

# 检查数据库是否已创建
echo "🗄️ 检查数据库..."
if ! npx wrangler d1 list | grep -q "siyuan-inbox"; then
  echo "📋 创建数据库..."
  npm run d1:create

  echo "⚠️  请编辑 wrangler.toml 文件，填入 database_id，然后重新运行此脚本"
  exit 1
fi

# 运行数据库迁移
echo "🔄 应用数据库迁移..."
npm run d1:migrate

# 检查认证令牌是否已设置
echo "🔐 检查认证令牌..."
# 这里我们无法直接检查 secrets，但会提醒用户

# 构建检查
echo "🔍 构建检查..."
npm run build

# 部署
echo "🚀 部署到 Cloudflare Workers..."
npm run deploy

echo ""
echo "🎉 部署成功！"
echo ""
echo "📝 接下来的步骤："
echo "1. 设置认证令牌: wrangler secret put BEARER_TOKEN"
echo "2. 配置思源笔记："
echo "   - 服务器地址: $(npx wrangler whoami | grep 'Account Name' | awk '{print $3}' | sed 's/\.$//').workers.dev"
echo "   - 访问令牌: 您设置的 BEARER_TOKEN"
echo ""
echo "📖 更多信息请查看 README.md"

