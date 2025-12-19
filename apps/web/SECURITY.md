# Lusca 安全防护集成文档

## 概述

本文档描述了如何在 interview web 项目中集成 Lusca 安全中间件，提供全面的 Web 安全防护。

## 安全功能

### 1. CSRF 防护
- **功能**: 防止跨站请求伪造攻击
- **实现**: 通过 CSRF Token 验证请求合法性
- **配置**: 自动生成和验证 Token，支持 Cookie 存储

### 2. XSS 防护
- **功能**: 防止跨站脚本攻击
- **实现**: 设置 X-XSS-Protection 头，输入验证和清理
- **配置**: 自动过滤危险字符和脚本

### 3. HSTS (HTTP Strict Transport Security)
- **功能**: 强制使用 HTTPS 连接
- **实现**: 设置 Strict-Transport-Security 头
- **配置**: 仅在生产环境启用，1年有效期

### 4. CSP (Content Security Policy)
- **功能**: 控制资源加载来源
- **实现**: 设置详细的内容安全策略
- **配置**: 限制脚本、样式、图片等资源来源

### 5. 其他安全头
- **X-Frame-Options**: 防止点击劫持 (SAMEORIGIN)
- **X-Content-Type-Options**: 防止 MIME 类型嗅探 (nosniff)
- **Referrer-Policy**: 控制引用信息泄露 (same-origin)
- **Permissions-Policy**: 限制浏览器功能访问

## 文件结构

```
apps/web/src/
├── lib/
│   └── lusca.ts                 # Lusca 配置和工具函数
├── app/
│   ├── api/
│   │   ├── security/
│   │   │   └── route.ts         # 安全测试 API
│   │   └── csrf/
│   │       └── route.ts         # CSRF Token API
│   └── security-test/
│       └── page.tsx             # 安全测试页面
└── middleware.ts                # Next.js 中间件
```

## 使用方法

### 1. API 路由保护

```typescript
import { withLusca } from '@/lib/lusca'

async function handler(req: NextRequest): Promise<NextResponse> {
  // 你的 API 逻辑
}

export const GET = withLusca(handler)
export const POST = withLusca(handler)
```

### 2. CSRF Token 使用

```typescript
import { CSRFProtection } from '@/lib/lusca'

// 生成 Token
const token = CSRFProtection.generateToken()

// 验证 Token
const isValid = CSRFProtection.validateToken(token)
```

### 3. 输入清理

```typescript
import { SecurityUtils } from '@/lib/lusca'

// 清理用户输入
const cleanInput = SecurityUtils.sanitizeInput(userInput)

// 验证 URL
const isValidUrl = SecurityUtils.isValidUrl(url)
```

## 测试

访问 `/security-test` 页面进行安全功能测试：

1. **CSRF Token 测试**: 验证 Token 生成和验证
2. **XSS 防护测试**: 测试脚本注入防护
3. **安全头测试**: 检查所有安全头是否正确设置
4. **API 安全测试**: 验证 API 路由安全防护

## 环境变量

```bash
# CSRF 密钥（可选，有默认值）
CSRF_SECRET=your-csrf-secret-key

# Next.js 环境
NODE_ENV=production  # 启用 HSTS
```

## 安全最佳实践

### 1. CSRF 防护
- 所有状态改变的请求都应验证 CSRF Token
- Token 应该存储在 HttpOnly Cookie 中
- Token 有效期不应超过 1 小时

### 2. XSS 防护
- 始终验证和清理用户输入
- 使用 CSP 限制脚本执行
- 避免在 HTML 中直接插入用户数据

### 3. HTTPS 强制
- 生产环境必须使用 HTTPS
- 设置 HSTS 头防止降级攻击
- 使用 secure 标志保护 Cookie

### 4. 内容安全策略
- 定期审查和更新 CSP 规则
- 避免使用 'unsafe-inline' 和 'unsafe-eval'
- 监控 CSP 违规报告

## 故障排除

### 1. CSRF Token 问题
- 检查 Cookie 设置是否正确
- 验证 Token 生成和验证逻辑
- 确保时间戳在有效期内

### 2. CSP 违规
- 检查浏览器控制台的 CSP 错误
- 调整 CSP 规则以允许必要的资源
- 使用 nonce 或 hash 允许内联脚本

### 3. 安全头缺失
- 检查中间件配置是否正确
- 验证 Next.js 中间件匹配规则
- 确保没有其他中间件覆盖安全头

## 更新和维护

1. **定期更新依赖**: 保持 Lusca 和相关依赖的最新版本
2. **安全审计**: 定期进行安全测试和代码审查
3. **监控日志**: 监控安全相关的错误和警告
4. **配置调整**: 根据应用需求调整安全配置

## 参考资源

- [Lusca 官方文档](https://github.com/krakenjs/lusca)
- [OWASP 安全指南](https://owasp.org/)
- [Next.js 安全最佳实践](https://nextjs.org/docs/advanced-features/security-headers)
- [MDN Web 安全](https://developer.mozilla.org/en-US/docs/Web/Security)