#!/bin/bash

# API 测试脚本
# 用于测试 Cloudflare Worker API 功能

set -e

# 配置
WORKER_URL="https://your-worker.your-subdomain.workers.dev"
TOKEN="your-bearer-token"

echo "🧪 测试 SiYuan Third-Party Inbox API"
echo "Worker URL: $WORKER_URL"
echo ""

# 测试健康检查
echo "1️⃣ 测试健康检查..."
curl -s "$WORKER_URL/api/health" | jq .
echo ""

# 测试获取收件箱列表
echo "2️⃣ 测试获取收件箱列表..."
curl -s -X GET "$WORKER_URL/api/shorthands?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# 测试创建收件箱项
echo "3️⃣ 测试创建收件箱项..."
CREATE_RESPONSE=$(curl -s -X POST "$WORKER_URL/api/shorthands" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content_md": "这是一个**测试**收件箱项\n\n包含一些内容。",
    "title": "测试项目",
    "url": "https://example.com/test",
    "from_source": 0
  }')

echo "$CREATE_RESPONSE" | jq .

# 提取创建的ID
ID=$(echo "$CREATE_RESPONSE" | jq -r '.data.oId')
echo "创建的 ID: $ID"
echo ""

# 测试获取单个收件箱项
if [ "$ID" != "null" ] && [ "$ID" != "" ]; then
    echo "4️⃣ 测试获取单个收件箱项..."
    curl -s -X GET "$WORKER_URL/api/shorthands/$ID" \
      -H "Authorization: Bearer $TOKEN" | jq .
    echo ""

    # 测试删除收件箱项
    echo "5️⃣ 测试删除收件箱项..."
    curl -s -X DELETE "$WORKER_URL/api/shorthands" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d "{\"ids\": [\"$ID\"]}" | jq .
    echo ""
fi

# 测试搜索功能
echo "6️⃣ 测试搜索功能..."
curl -s -X GET "$WORKER_URL/api/search?q=测试&page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# 测试思源兼容接口
echo "7️⃣ 测试思源兼容接口..."
curl -s -X POST "$WORKER_URL/apis/siyuan/inbox/getCloudShorthands" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"p": 1}' | jq .
echo ""

echo "✅ 所有测试完成！"