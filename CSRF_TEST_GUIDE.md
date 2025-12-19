# CSRF 保护测试页面使用指南

## 概述

我已经为 admin 和 web 项目分别创建了 CSRF 保护测试页面，用于演示如何在新页面中正确实现 CSRF 保护。

## 创建的文件

### Admin 项目
- `/csrf-test` - 测试页面
- `/api/csrf-test` - 测试 API 路由

### Web 项目  
- `/csrf-test` - 测试页面
- `/api/csrf-test` - 测试 API 路由
- `/hooks/useCSRF.ts` - CSRF Hook（独立版本）

## 访问测试页面

### Admin 项目
```
http://localhost:3003/csrf-test
```

### Web 项目
```
http://localhost:3000/csrf-test
```

## 新页面 CSRF 集成步骤

### Admin 项目（使用 Context）

1. **导入必要的依赖**
```typescript
import { useCSRFContext } from '@/contexts/CSRFContext'
import { createCSRFHeaders, secureRequest } from '@/hooks/useCSRF'
```

2. **获取 CSRF Token**
```typescript
const { csrfToken, loading, error } = useCSRFContext()
```

3. **发送安全请求（推荐方式）**
```typescript
const response = await secureRequest('/api/endpoint', {
  method: 'POST',
  body: JSON.stringify(data),
}, csrfToken)
```

4. **或者手动创建头部**
```typescript
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: createCSRFHeaders(csrfToken),
  body: JSON.stringify(data),
  credentials: 'include',
})
```

### Web 项目（使用独立 Hook）

1. **导入 CSRF Hook**
```typescript
import { useCSRF } from '@/hooks/useCSRF'
```

2. **获取 CSRF Token**
```typescript
const { csrfToken, loading, error } = useCSRF()
```

3. **发送安全请求**
```typescript
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
  },
  body: JSON.stringify(data),
  credentials: 'include',
})
```

## API 路由保护

### 创建受保护的 API 路由

```typescript
import { withLusca } from '@/lib/lusca'

async function handler(req: NextRequest): Promise<NextResponse> {
  // 处理逻辑
}

// 只保护需要的 HTTP 方法
export const GET = handler        // 不需要 CSRF 保护
export const POST = withLusca(handler)   // 需要 CSRF 保护
export const PUT = withLusca(handler)    // 需要 CSRF 保护
export const DELETE = withLusca(handler) // 需要 CSRF 保护
```

## 测试功能

测试页面提供了以下测试场景：

1. **✅ 安全请求** - 包含正确 CSRF token 的请求（应该成功）
2. **❌ 不安全请求** - 不包含 CSRF token 的请求（应该失败）
3. **🔧 手动头部** - 使用 `createCSRFHeaders` 创建头部的请求

## 最佳实践

1. **总是检查 CSRF token 状态**
```typescript
if (csrfLoading || !csrfToken) {
  // 显示加载状态或错误信息
  return
}
```

2. **错误处理**
```typescript
try {
  const response = await secureRequest(...)
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }
} catch (error) {
  // 处理错误
}
```

3. **用户体验**
- 在 CSRF token 加载期间禁用提交按钮
- 显示适当的加载和错误状态
- 提供重新获取 token 的选项

## 安全注意事项

1. **只保护需要的方法** - 通常只有 POST、PUT、DELETE 需要 CSRF 保护
2. **始终包含 credentials** - 确保请求包含 `credentials: 'include'`
3. **验证响应** - 检查 API 响应状态和内容
4. **日志记录** - 记录安全相关事件用于监控

## 故障排除

如果 CSRF 保护不工作，检查：

1. CSRF token 是否正确获取
2. 请求头是否包含 `X-CSRF-Token`
3. API 路由是否使用了 `withLusca` 包装
4. 请求是否包含 `credentials: 'include'`
5. 浏览器控制台是否有错误信息