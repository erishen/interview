# @interview/api-client

框架无关的 API 客户端工具包，专门用于 FastAPI 后端通信。

## 特性

- ✅ **框架无关**: 不依赖 Next.js、React 等框架
- ✅ **类型安全**: 完整的 TypeScript 类型支持
- ✅ **FastAPI 优化**: 专门为 FastAPI 后端设计
- ✅ **可重用**: 支持多个应用共享使用

## 安装

```bash
pnpm add @interview/api-client
```

## 使用方法

### 基础用法

```typescript
import { fastApiClient } from '@interview/api-client'

// GET 请求
const response = await fastApiClient.get(['items'])
console.log(response.data)

// POST 请求
const newItem = await fastApiClient.post(['items'], { name: 'New Item' })

// PUT 请求
const updatedItem = await fastApiClient.put(['items', '123'], { name: 'Updated' })

// DELETE 请求
await fastApiClient.delete(['items', '123'])
```

### 高级用法

```typescript
import { FastApiClient } from '@interview/api-client'

// 自定义配置
const client = new FastApiClient({
  baseUrl: 'https://api.example.com',
  timeout: 10000,
  enableRedirectHandling: true,
})

// 带查询参数的请求
const items = await client.get(['items'], {
  query: { page: 1, limit: 10 }
})

// 自定义请求头
const response = await client.post(['items'], data, {
  headers: { 'X-Custom-Header': 'value' }
})
```

### 工具函数

```typescript
import { buildFastApiUrl, buildHeaders } from '@interview/api-client'

// 构建 URL
const url = buildFastApiUrl(['items', '123'], {
  includeQueryParams: true,
  request: nextRequest
})

// 构建请求头
const headers = buildHeaders({
  headers: { 'Authorization': 'Bearer token' }
})
```

## API 参考

### FastApiClient 类

#### 构造函数
```typescript
new FastApiClient(options?: FastApiOptions)
```

#### 方法

##### `get<T>(pathSegments, options?)`
GET 请求

##### `post<T>(pathSegments, data?, options?)`
POST 请求

##### `put<T>(pathSegments, data?, options?)`
PUT 请求

##### `delete<T>(pathSegments, options?)`
DELETE 请求

### 工具函数

#### `buildFastApiUrl(pathSegments, options?)`
构建 FastAPI URL

#### `buildHeaders(options, strict?)`
构建请求头

#### `makeRequest(url, options)`
直接发起 HTTP 请求

#### `createProxyResponse(response, corsEnabled?)`
创建 Next.js API 响应对象（用于代理）。**注意：此函数仅在 Next.js 环境中可用。**

```typescript
import { fastApiClient, createProxyResponse } from '@interview/api-client'

// 在 Next.js API 路由中使用
export async function GET() {
  const response = await fastApiClient.get(['items'])
  return createProxyResponse(response) // 返回 NextResponse
}
```

## 类型定义

```typescript
interface ApiResponse<T> {
  data: T
  status: number
  statusText: string
  headers: Record<string, string>
}

interface FastApiOptions {
  baseUrl?: string
  timeout?: number
  headers?: Record<string, string>
  enableRedirectHandling?: boolean
  strictHeaders?: boolean
}
```

## FastAPI 特性支持

### 自动路径处理
- ✅ 自动添加/移除尾斜杠
- ✅ 特殊处理 auth 和 redis 端点
- ✅ 参数化路由支持

### 重定向处理
- ✅ 307/302 重定向自动跟随
- ✅ 本地/外部 URL 协议处理
- ✅ 保持认证头

### 请求头处理
- ✅ 严格/非严格头过滤
- ✅ 自动 Content-Type 设置
- ✅ 认证头转发

## 架构优势

### 为什么不放在 shared 目录？

1. **依赖管理**: API 客户端需要访问配置，但 shared 不能依赖 packages
2. **构建顺序**: 独立的包可以更好地控制构建顺序
3. **测试隔离**: 可以独立测试 API 客户端功能
4. **版本控制**: 可以独立版本化和发布

### 与应用代理的关系

```
应用层 (Next.js)
    ↓ 使用
@interview/api-client (通用工具)
    ↓ 调用
FastAPI 后端
```

应用中的代理路由现在变成了薄薄的一层适配器：

```typescript
// apps/admin/src/lib/proxy.ts
export async function proxyToFastApi(request, method, params, options) {
  // 应用特定的逻辑
  const headers = buildHeaders(request, options.strictHeaders)

  // 使用通用客户端
  return fastApiClient.request(method, params.path, { headers })
}
```

## 最佳实践

1. **错误处理**: 总是处理 API 响应中的错误
2. **类型安全**: 使用泛型参数确保类型安全
3. **超时设置**: 为生产环境设置合理的超时时间
4. **重试逻辑**: 考虑添加请求重试机制

## 贡献

1. 添加新功能时，请同时更新类型定义
2. 保持向后兼容性
3. 添加适当的单元测试
4. 更新此文档

## 代码重构历史

### 消除重复代码

原本 `createProxyResponse` 函数在 admin 和 web 应用的 `lib/proxy.ts` 中各有一份完全相同的实现。通过将此函数提取到 `@interview/api-client` 包中，实现了：

1. **单一源头**: 所有应用使用相同的响应处理逻辑
2. **维护简化**: 修改响应处理逻辑只需在一个地方进行
3. **类型安全**: 统一的响应处理确保类型一致性

```typescript
// 重构前：每个应用都有重复的代码
export function createProxyResponse(response: any): NextResponse {
  // 相同的实现...
}

// 重构后：共享的实现
import { createProxyResponse } from '@interview/api-client'
```
