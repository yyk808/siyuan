# SiYuan Third-Party Inbox

基于 Cloudflare Worker 的第三方思源笔记收件箱服务，完全兼容思源官方收件箱API格式。

## 功能特性

- ✅ **完全兼容思源API** - 无需修改思源客户端代码
- ✅ **现代化技术栈** - Cloudflare Workers + D1数据库
- ✅ **安全认证** - 支持Bearer Token和API Key认证
- ✅ **高性能** - 全球CDN加速，毫秒级响应
- ✅ **易部署** - 一键部署，自动扩展
- ✅ **数据安全** - 数据存储在Cloudflare D1中
- ✅ **开源免费** - MIT许可证

## 快速开始

### 1. 环境准备

确保已安装：
- Node.js 18+
- npm 或 yarn
- [Cloudflare Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

```bash
# 安装 Wrangler
npm install -g wrangler
# 登录 Cloudflare
wrangler auth login
```

### 2. 克隆和安装依赖

```bash
cd siyuan-third-party-inbox
npm install
```

### 3. 创建数据库

```bash
# 创建 D1 数据库
npm run d1:create

# 记下输出的 database_id，更新 wrangler.toml 中的 database_id
```

### 4. 配置项目

编辑 `wrangler.toml` 文件：

```toml
[[d1_databases]]
binding = "DB"
database_name = "siyuan-inbox"
database_id = "你的数据库ID"  # 替换为实际的ID
```

### 5. 运行数据库迁移

```bash
# 应用数据库架构
npm run d1:migrate
```

### 6. 设置认证令牌

```bash
# 生成安全令牌
node -e "console.log(crypto.randomUUID())"

# 设置认证令牌（替换为生成的令牌）
wrangler secret put BEARER_TOKEN
```

### 7. 本地开发

```bash
# 启动开发服务器
npm run dev
```

### 8. 部署到 Cloudflare

```bash
# 部署到 Cloudflare Workers
npm run deploy
```

## API 接口

### 基础接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/health` | 健康检查 |
| GET | `/api/shorthands` | 获取收件箱列表 |
| GET | `/api/shorthands/:id` | 获取单个收件箱项 |
| POST | `/api/shorthands` | 创建新收件箱项 |
| DELETE | `/api/shorthands` | 删除收件箱项 |
| GET | `/api/search` | 搜索收件箱 |

### 思源兼容接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/apis/siyuan/inbox/getCloudShorthands` | 获取收件箱列表（兼容） |
| POST | `/apis/siyuan/inbox/getCloudShorthand` | 获取单个收件箱项（兼容） |
| POST | `/apis/siyuan/inbox/removeCloudShorthands` | 删除收件箱项（兼容） |

### 认证方式

支持三种认证方式：

1. **Bearer Token** (推荐)
```bash
Authorization: Bearer YOUR_TOKEN
```

2. **API Key**
```bash
X-API-Key: YOUR_TOKEN
```

3. **查询参数** (仅开发环境)
```bash
?token=YOUR_TOKEN
```

## 在思源笔记中使用

1. 打开思源笔记设置
2. 进入 **设置 → 同步存储**
3. 切换到 **第三方收件箱** 标签
4. 配置：
   - **服务器地址**: `https://your-worker.your-subdomain.workers.dev`
   - **访问令牌**: 您设置的BEARER_TOKEN
   - **同步间隔**: 建议设置为5-30分钟
5. 保存配置并测试连接

## API 使用示例

### 获取收件箱列表

```bash
curl -X GET "https://your-worker.workers.dev/api/shorthands?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 创建收件箱项

```bash
curl -X POST "https://your-worker.workers.dev/api/shorthands" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content_md": "这是一个**测试**收件箱项",
    "title": "测试项目",
    "url": "https://example.com",
    "from_source": 0
  }'
```

### 删除收件箱项

```bash
curl -X DELETE "https://your-worker.workers.dev/api/shorthands" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["1696156800000", "1696156801000"]
  }'
```

## 配置选项

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `BEARER_TOKEN` | 认证令牌 | 必须 |
| `CORS_ORIGINS` | 允许的CORS源 | `*` |

### 分页参数

- `page`: 页码（从1开始）
- `limit`: 每页数量（1-100，默认20）

## 数据库架构

```sql
CREATE TABLE shorthands (
    id TEXT PRIMARY KEY,                    -- 唯一ID（时间戳）
    content_html TEXT NOT NULL,             -- HTML格式内容
    content_md TEXT NOT NULL,               -- Markdown格式内容
    description TEXT NOT NULL,              -- 处理过的描述
    from_source INTEGER DEFAULT 0,         -- 来源标识
    title TEXT NOT NULL,                    -- 标题
    url TEXT NOT NULL,                      -- 原始URL
    created_at INTEGER NOT NULL             -- 创建时间戳
);
```

## 开发指南

### 项目结构

```
siyuan-third-party-inbox/
├── src/
│   ├── index.ts          # 主Worker逻辑
│   ├── database.ts       # 数据库操作
│   ├── auth.ts          # 身份验证
│   ├── api.ts           # API路由处理
│   ├── types.ts         # TypeScript类型定义
│   └── utils.ts         # 工具函数
├── migrations/           # 数据库迁移文件
├── wrangler.toml        # Cloudflare配置
└── README.md           # 项目说明
```

### 本地开发

```bash
# 开发模式
npm run dev

# 构建检查
npm run build

# 代码格式化
npm run format

# 代码检查
npm run lint
```

### 查看日志

```bash
# 实时查看Worker日志
npm run tail
```

## 故障排除

### 常见问题

1. **认证失败**
   - 确保设置了正确的BEARER_TOKEN
   - 检查请求头格式是否正确

2. **数据库连接错误**
   - 确认wrangler.toml中的database_id正确
   - 运行 `npm run d1:migrate` 确保数据库架构已创建

3. **CORS错误**
   - 检查CORS_ORIGINS环境变量设置
   - 确保请求源在允许列表中

4. **部署失败**
   - 确认已登录Cloudflare (`wrangler auth login`)
   - 检查wrangler.toml配置是否正确

### 重置项目

如需完全重置项目：

```bash
# 删除数据库
wrangler d1 delete siyuan-inbox

# 重新创建
npm run d1:create
npm run d1:migrate
wrangler secret put BEARER_TOKEN
```

## 安全建议

1. **使用强令牌**: 生成随机、复杂的BEARER_TOKEN
2. **限制CORS源**: 在生产环境中设置具体的CORS_ORIGINS
3. **定期更新**: 定期更换认证令牌
4. **监控日志**: 定期检查Worker日志以发现异常活动

## 贡献

欢迎提交Issue和Pull Request！

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 支持

- 📖 [思源笔记官方文档](https://b3log.org/siyuan/)
- 🐛 [问题反馈](https://github.com/your-username/siyuan-third-party-inbox/issues)
- 💬 [讨论交流](https://github.com/your-username/siyuan-third-party-inbox/discussions)