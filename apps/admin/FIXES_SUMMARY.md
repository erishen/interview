# Frontend 修复总结

## 问题描述

从日志中发现两个主要问题：
1. **429 Too Many Requests** - `/api/admin/fastapi-login` 接口频繁被限流
2. **403 Forbidden** - `/api/fastapi/api/docs/logs` 和 `stats` 接口无权限

## 修复内容

### 1. 创建 FastAPI 客户端封装
**文件：** `src/lib/fastapi-client.ts`

**功能：**
- ✅ 自动 Token 缓存（localStorage，60 分钟过期）
- ✅ 自动添加 Bearer token 到所有请求
- ✅ 403/401 错误时自动清除缓存
- ✅ 支持日志、统计等 API 调用
- ✅ 单例模式，全局唯一实例

### 2. 更新文档日志页面
**文件：** `src/app/[locale]/doc-logs/page.tsx`

**改进：**
- ✅ 使用新的 `fastapi` 客户端
- ✅ 移除重复的 Token 请求逻辑
- ✅ 统一的错误处理（FastAPIError 类型）
- ✅ 添加错误提示和重试按钮
- ✅ 自动识别认证错误并提示重新登录

### 3. 后端优化
**文件：** `fastapi-web/app/` 多个文件

**改进：**
- ✅ 更新 CSP 配置，允许 CDN 加载 Swagger UI 和 ReDoc
- ✅ 自定义 Swagger UI 和 ReDoc 页面
- ✅ 创建诊断脚本 `scripts/diagnose-frontend-issues.sh`
- ✅ 添加构建优化命令（`prod-rebuild`）

### 4. 文档
- ✅ `FRONTEND_FIXES.md` - 前端修复说明
- ✅ `FRONTEND_INTEGRATION.md` - 完整集成指南

## 技术细节

### Token 缓存机制
```typescript
// Token 结构
interface FastAPIToken {
  access_token: string
  token_type: string
  expires_at: number  // 过期时间戳
}

// 缓存策略
1. 首次访问或过期时：从 FastAPI 获取新 Token
2. 后续访问（未过期）：直接使用缓存的 Token
3. 提前 5 分钟刷新：防止边界情况
4. 403/401 错误：自动清除缓存
```

### API 调用优化
```typescript
// ✅ 正确方式
import { fastapi } from '@/lib/fastapi-client'

const data = await fastapi.getDocLogs()
// Token 自动添加到 Authorization 头

// ❌ 旧方式（已废弃）
const response = await fetch('/api/admin/fastapi-login', {
  headers: { 'Content-Type': 'application/json' }
})
const data = await response.json()
const token = data.access_token

// 手动添加到后续请求
const apiResponse = await fetch('/api/fastapi/api/docs/logs', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

### 错误处理
```typescript
// 统一的错误类型
export interface FastAPIError {
  error: string
  status?: number
  details?: any
}

// 自动处理不同错误
try {
  const data = await fastapi.getDocLogs()
} catch (err: any) {
  if (err instanceof FastAPIError) {
    // 认证错误：自动清除缓存
    if (err.status === 401 || err.status === 403) {
      await fastapi.clearCache()
      setError('认证失败，请重新登录')
    }
  }
}
```

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
GET /api/fastapi/api/docs/logs 200 in 38ms  ✅ (使用缓存）
```

## 测试步骤

### 1. 本地测试
```bash
cd interview/apps/admin

# 清除旧缓存
localStorage.clear()

# 启动开发服务器
npm run dev

# 访问文档日志页面
http://localhost:3003/doc-logs

# 打开浏览器控制台，查看：
# - "[FastAPI Client] 缓存未命中，请求新 Token"（首次）
# - "[FastAPI Client] 使用缓存的 Token"（后续请求）
```

### 2. 后端部署
```bash
cd /root/fastapi-web

# 重新构建并部署
make prod-down
make prod-rebuild  # 快速重启，不重建镜像

# 或完全重新构建
make prod-build-no-cache
make prod-up

# 检查健康状态
make prod-health
```

### 3. 验证修复
```bash
# 测试 API 健康检查
curl https://api.erishen.cn/health

# 测试文档日志接口（需要先登录获取 Token）
# 1. 登录获取 Token
# 2. 使用 Token 请求日志接口
```

## 配置检查清单

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

### 后端 .env.aliyun
```bash
# 生产环境配置
APP_ENV=production
SECRET_KEY=至少32字符的字符串
NEXTAUTH_SECRET=与前端一致的密钥
NEXTAUTH_ADMIN_EMAILS=包含管理员邮箱
DOC_LOG_API_KEY=用于文档日志记录

# 数据库配置
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=Ls,(8888
MYSQL_DATABASE=fastapi_web

# Redis 配置
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=Ls,(9999
REDIS_DB=0
```

## 相关文件

- `src/lib/fastapi-client.ts` - FastAPI 客户端封装
- `src/app/[locale]/doc-logs/page.tsx` - 更新后的文档日志页面
- `FRONTEND_FIXES.md` - 前端修复说明
- `FRONTEND_INTEGRATION.md` - 完整集成指南
- `fastapi-web/scripts/diagnose-frontend-issues.sh` - 诊断脚本

## 常见问题

### Q: 如何强制刷新 Token？
A: 使用客户端的 clearCache 方法：
```typescript
await fastapi.clearCache()
```

### Q: Token 缓存会过期吗？
A: 会。60 分钟后自动过期，提前 5 分钟检测过期并刷新。

### Q: 如何调试 Token 问题？
A: 打开浏览器控制台，查看 `[FastAPI Client]` 前缀的日志：
- 使用缓存的 Token
- 缓存未命中，请求新 Token
- Token 已过期
- 清除缓存

### Q: 为什么还有 403 错误？
A: 可能原因：
1. Token 已过期 - 自动清除缓存后刷新页面
2. 用户角色不是 admin - 确保使用 admin 账户
3. NEXTAUTH_ADMIN_EMAILS 未包含当前用户邮箱 - 更新配置
4. Session 失效 - 重新登录 NextAuth

## 总结

✅ **前端：** 已创建 FastAPI 客户端封装，支持 Token 缓存和自动刷新
✅ **文档日志：** 已更新使用新客户端，改进错误处理
✅ **后端：** 已优化 CSP 配置，添加诊断工具
✅ **文档：** 已创建详细的修复说明和集成指南

**下一步：**
1. 本地测试前端修改
2. 部署到生产环境
3. 验证 429 和 403 错误已修复
