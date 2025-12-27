# 前端修复说明

## 修复内容

### 1. 创建 FastAPI 客户端封装
**文件：** `src/lib/fastapi-client.ts`

**功能：**
- Token 自动缓存（60 分钟过期）
- 自动添加 Bearer token 到所有请求
- 403/401 错误时自动清除缓存并提示
- 支持日志、统计等 API 调用

### 2. 更新文档日志页面
**文件：** `src/app/[locale]/doc-logs/page.tsx`

**改进：**
- 使用新的 `fastapi` 客户端
- 移除重复的 Token 请求逻辑
- 添加错误处理和重试按钮
- 统一 Token 管理和刷新

### 3. 后端已优化
**已完成：**
- CSP 配置更新（允许 CDN）
- 自定义 Swagger UI 和 ReDoc 页面
- 诊断脚本 `scripts/diagnose-frontend-issues.sh`
- 优化构建速度支持

## 使用方式

### 1. 前端开发
```bash
cd interview/apps/admin

# 启动开发服务器
npm run dev

# 访问文档日志页面
http://localhost:3003/doc-logs
```

### 2. Token 缓存机制

前端现在使用 `localStorage` 缓存 FastAPI Token：
- Token 有效期：60 分钟
- 自动过期检测（提前 5 分钟过期）
- 403/401 错误时自动清除缓存
- 无需手动刷新 Token

### 3. API 调用方式

#### 旧方式（已废弃）
```typescript
// ❌ 错误：每次都请求新 Token
const response = await fetch('/api/admin/fastapi-login', {
  headers: { 'Content-Type': 'application/json' }
});
```

#### 新方式（推荐）
```typescript
// ✅ 正确：使用客户端封装
import { fastapi } from '@/lib/fastapi-client'

// 自动处理 Token 缓存和刷新
const data = await fastapi.getDocLogs()

// Token 自动添加到所有请求
const stats = await fastapi.getDocStats()
```

### 4. 错误处理

#### 403 Forbidden 错误
- **原因：** Token 无效或过期
- **自动处理：** 客户端自动清除缓存并提示
- **用户操作：** 点击"重试"按钮重新获取 Token

#### 401 Unauthorized 错误
- **原因：** 未登录或 Session 失效
- **自动处理：** 提示用户前往登录页面
- **用户操作：** 返回 `/dashboard` 重新登录

#### 网络错误
- **自动处理：** 显示友好的错误提示
- **重试机制：** 提供"重试"按钮自动重试

## 预期效果

### 修复前
```
POST /api/admin/fastapi-login 200 in 316ms
POST /api/admin/fastapi-login 429 in 67ms  ❌
POST /api/admin/fastapi-login 429 in 68ms  ❌
GET /api/fastapi/api/docs/logs 403 in 36ms  ❌
GET /api/fastapi/api/docs/stats 403 in 30ms  ❌
```

### 修复后
```
POST /api/admin/fastapi-login 200 in 316ms
GET /api/fastapi/api/docs/logs 200 in 45ms  ✅
GET /api/fastapi/api/docs/stats 200 in 32ms  ✅
GET /api/fastapi/api/docs/logs 200 in 38ms  ✅ (使用缓存，不请求）
```

## 完整示例

### 使用 FastAPI 客户端
```typescript
import { fastapi } from '@/lib/fastapi-client'

// 1. 获取日志列表
const logsResponse = await fastapi.getDocLogs({
  limit: 1000, // 加载所有数据，前端进行筛选
  doc_slug: 'frontend', // 可选：按文档筛选
  action: 'create' // 可选：按操作类型筛选
})

if (logsResponse.success) {
  console.log('日志数据:', logsResponse.logs)
}

// 2. 获取统计数据
const statsResponse = await fastapi.getDocStats()

if (statsResponse.success) {
  console.log('统计数据:', statsResponse.stats)
}

// 3. 记录文档操作（可选，需要 DOC_LOG_API_KEY）
const logResponse = await fastapi.logDocAction({
  action: 'view',
  doc_slug: 'getting-started',
  user_id: 'user123',
  user_email: 'user@example.com',
  user_name: 'User Name',
  auth_method: 'nextauth',
  details: 'User viewed getting-started doc'
})

if (logResponse.success) {
  console.log('日志记录成功')
}
```

### 错误处理
```typescript
try {
  const data = await fastapi.getDocLogs()
  
  if (!data.success) {
    throw new Error('API 返回错误')
  }
  
  console.log('获取到', data.logs.length, '条日志')
  
} catch (error: any) {
  if (error instanceof FastAPIError) {
    console.error('FastAPI 错误:', error.message)
    console.error('状态码:', error.status)
    
    // 认证错误
    if (error.status === 401 || error.status === 403) {
      // 自动清除缓存
      await fastapi.clearCache()
      
      // 显示错误提示（由组件处理）
      throw error
    }
  }
  
  // 网络错误
  console.error('请稍后重试')
}
```

## 配置检查

### 前端 .env.local
```bash
# 确保 FastAPI URL 正确
FASTAPI_URL=https://api.erishen.cn

# 确保 DOC_LOG_API_KEY 已配置（如果需要记录日志）
DOC_LOG_API_KEY=15ac5d71a278344bff026449ee12a1b70fe3c8b807cde285b88cbf292f1303cb

# NextAuth 配置
NEXTAUTH_SECRET=yjkK0AFtz341Ph+FYK1AIhLQsxjWlczCwKsRMLS36us=
NEXTAUTH_ADMIN_EMAILS=admin@example.com
```

### 后端 .env
```bash
# 检查配置一致性
APP_ENV=production
SECRET_KEY=52f8d154d5ebf7c29fb9ea4e38826a5406b028d198b70ddb4d31839e2fd93fd8
NEXTAUTH_SECRET=7c8a9e3d5f2b1c4a6e9d7f8e3a5b2c1d4e6f9a8b7c3d5e1f2a9b4e6

# 确保 DOC_LOG_API_KEY 一致
DOC_LOG_API_KEY=15ac5d71a278344bff026449ee12a1b70fe3c8b807cde285b88cbf292f1303cb
```

## 测试步骤

### 1. 本地测试
```bash
cd interview/apps/admin

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 浏览器访问
# http://localhost:3003/doc-logs

# 打开浏览器控制台，查看：
# - "[FastAPI Client] 使用缓存的 Token" （首次之后）
# - "[FastAPI Client] 缓存未命中，请求新 Token" （首次加载或过期后）
```

### 2. 后端测试
```bash
cd /root/fastapi-web

# 检查健康状态
make prod-health

# 查看日志
make prod-logs

# 运行诊断
make diagnose-frontend
```

## 关键改进点

### 1. Token 管理
- ✅ 自动缓存，避免重复请求
- ✅ 自动过期检测和刷新
- ✅ 403/401 错误时自动清除缓存
- ✅ 无需手动管理 Token 生命周期

### 2. 错误处理
- ✅ 统一的错误类型（FastAPIError）
- ✅ 友好的错误提示
- ✅ 自动重试机制
- ✅ 区分认证错误和网络错误

### 3. 性能优化
- ✅ 减少不必要的 API 请求
- ✅ 前端分页（减少数据加载）
- ✅ 前端筛选（避免后端重复请求）

## 常见问题

### Q: Token 缓存会过期吗？
A: 会。60 分钟后自动过期，提前 5 分钟检测过期并刷新。

### Q: 如何强制刷新 Token？
A: 使用客户端提供的 clearCache 方法：
```typescript
await fastapi.clearCache()
```

### Q: Token 在 localStorage 的 Key 是什么？
A: `fastapi:admin:token`

### Q: 如何调试 Token 管理问题？
A: 打开浏览器控制台，查看 `[FastAPI Client]` 前缀的日志：
- 使用缓存的 Token
- 缓存未命中，请求新 Token
- Token 已过期
- 清除缓存

## 相关文档

- FastAPI 后端集成：`../fastapi-web/FRONTEND_INTEGRATION.md`
- 问题修复详情：`../fastapi-web/FRONTEND_ISSUES_FIX.md`
- API 使用文档：后端的 `/docs` 端点
