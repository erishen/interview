# Shared Directory

这个目录包含整个应用共享的代码和资源。

## 目录结构

```
shared/
├── utils/          # 通用工具函数
│   ├── validation.ts   # 验证工具（邮箱、密码等）
│   ├── date.ts         # 日期处理工具
│   └── function.ts     # 函数工具（防抖、节流等）
├── types/          # TypeScript 类型定义
│   └── api.ts          # API 相关类型
├── constants/      # 应用常量
│   └── index.ts        # HTTP状态码、用户角色等
├── config/         # 配置工具
│   └── env.ts          # 环境变量处理
└── index.ts        # 统一导出
```

## 与 Packages 的关系

### 📦 Packages 目录
- `@interview/config` - 应用配置（API配置、数据库配置、样式主题）
- `@interview/types` - 通用类型定义（保持独立实现）
- `@interview/utils` - 通用工具函数（保持独立实现）
- `@interview/ui` - UI组件库
- `@interview/eslint-config` - ESLint配置

### 🔄 整合策略
由于构建顺序依赖问题，packages 保持独立实现，但 shared 目录作为新的共享代码中心：

1. **新代码优先使用 shared**
2. **packages 保持向后兼容**
3. **逐渐迁移现有代码到 shared**

## 使用指南

### 1. 导入共享工具

```typescript
// 推荐：从主入口导入
import { isEmail, USER_ROLES, ApiResponse } from '@shared'

// 或者单独导入
import { isEmail } from '@shared/utils/validation'
import { USER_ROLES } from '@shared/constants'
```

### 2. 路径映射

在应用的 `tsconfig.json` 中已经配置了路径映射：

```json
{
  "paths": {
    "@shared/*": ["../../shared/*"]
  }
}
```

### 3. 代码规范

#### ✅ 可以放的代码
- 验证函数（`isEmail`, `isValidPassword`）
- 类型定义（`User`, `ApiResponse`）
- 常量和枚举
- 环境变量处理
- 纯逻辑函数
- 日期处理工具
- 函数工具（防抖、节流、记忆化）

#### ❌ 不可以放的代码
- Next.js 特定的代码（API routes, middleware 等）
- React 组件
- 数据库连接
- 文件系统操作
- 依赖特定运行时的代码

### 4. 示例

#### 使用验证工具
```typescript
import { isEmail, isValidPassword } from '@shared'

if (!isEmail(user.email)) {
  throw new Error('Invalid email')
}
```

#### 使用日期工具
```typescript
import { formatDate, formatRelativeTime } from '@shared'

console.log(formatDate(new Date())) // "December 24, 2024"
console.log(formatRelativeTime(new Date())) // "just now"
```

#### 使用函数工具
```typescript
import { debounce, throttle, memoize } from '@shared'

const debouncedSearch = debounce(searchFunction, 300)
const throttledScroll = throttle(scrollHandler, 100)
const memoizedCalc = memoize(expensiveCalculation)
```

#### 使用类型定义
```typescript
import { ApiResponse, User, UserRole } from '@shared'

function fetchUser(id: string): Promise<ApiResponse<User>> {
  // ...
}
```

#### 使用常量
```typescript
import { USER_ROLES, HTTP_STATUS } from '@shared'

if (user.role === USER_ROLES.ADMIN) {
  // Admin logic
}
```

## 架构原则

1. **框架无关**: Shared 代码不能依赖特定的框架或运行时
2. **可重用性**: 代码应该可以在服务端和客户端使用
3. **类型安全**: 提供完整的 TypeScript 类型定义
4. **测试友好**: 代码应该易于单元测试
5. **构建独立**: 不依赖其他包的构建顺序

## 添加新代码

1. 在相应的子目录中创建文件
2. 在 `index.ts` 中导出
3. 更新这个 README（如果需要）
4. 添加适当的测试

## 迁移计划

### Phase 1 ✅ (当前阶段)
- 创建 shared 目录结构
- 实现核心工具函数
- 建立路径映射配置

### Phase 2 🔄 (进行中)
- 新功能优先使用 shared
- 保持 packages 向后兼容
- 逐步迁移现有代码

### Phase 3 🎯 (未来)
- 评估 packages 是否仍有必要
- 可能逐步废弃部分 packages
- 统一代码组织结构
