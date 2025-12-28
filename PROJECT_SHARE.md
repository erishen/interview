# 从零构建全栈技术知识库平台

> 基于 Turborepo + Next.js 14 + FastAPI 的现代化全栈实践分享

## 项目背景与定位

作为一个全栈开发者，技术成长需要系统化的知识沉淀。我决定构建一个完整的技术知识库平台，将零散的知识点整合成结构化的学习资源。这不仅是对自己技术的梳理，也是一份能够帮助更多开发者的共享项目。

**项目定位**：
- **全栈技术实践平台**：展示现代化前后端工程化最佳实践
- **知识资源库**：系统化整理技术面试高频考点
- **学习辅助工具**：提供实用的算法练习和问题解答
- **文档管理系统**：优雅的 Markdown 编辑与展示
- **全栈演示系统**：前端+后端完整的技术实现

## 技术选型与架构设计

### 为什么选择 Monorepo？

在项目初期，我面临一个关键决策：是采用传统的多仓库（Multi-repo）架构，还是选择 Monorepo？

最终选择 **Turborepo + Monorepo** 架构，主要基于以下考量：

| 维度 | Multi-repo | Monorepo |
|------|------------|----------|
| 代码共享 | 需要发布 npm 包 | workspace 直接引用 |
| 版本管理 | 各仓库独立版本 | 统一版本控制 |
| CI/CD | 多个流水线 | 单一构建流程 |
| 依赖管理 | 容易版本冲突 | 统一依赖管理 |
| 跨包测试 | 困难 | 简单直接 |

### 核心技术栈

```
├── 前端框架层
│   ├── Next.js 14 (App Router)          # React 全栈框架
│   ├── React 18                          # UI 库
│   └── TypeScript 5                     # 类型安全
│
├── 后端框架层
│   ├── FastAPI                           # Python 异步 Web 框架
│   ├── Python 3.10+                      # 运行时
│   ├── Pydantic                          # 数据验证
│   ├── SQLAlchemy                        # ORM
│   ├── Alembic                           # 数据库迁移
│   └── Uvicorn                           # ASGI 服务器
│
├── 数据存储
│   ├── MySQL 8.0                         # 关系型数据库
│   ├── Redis                             # 缓存与会话
│   └── Supabase                          # 云数据库 + 认证
│
├── 内容渲染
│   ├── next-mdx-remote                  # MDX/Markdown 渲染
│   └── @tailwindcss/typography         # 文档样式插件
│
├── 构建工具
│   ├── Turborepo                         # Monorepo 构建工具
│   ├── pnpm 10                           # 高效的包管理器
│   └── Docker                            # 容器化部署
│
├── 样式方案
│   ├── Tailwind CSS                      # 原子化 CSS
│   └── styled-components                 # CSS-in-JS
│
├── 开发工具
│   ├── ESLint + Prettier                # 代码规范
│   ├── Storybook                        # 组件开发
│   └── Changeset                        # 版本管理
│
└── 部署平台
    ├── Vercel                           # Serverless 前端部署
    ├── Docker + Linux                    # 后端容器化部署
    └── Nginx                            # 反向代理
```

### 项目架构

```
┌─────────────────────────────────────────────────────────────┐
│                    用户访问层                              │
│  web.erishen.cn (前端)  │  admin.erishen.cn (后台)       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    API 网关层                             │
│              api.erishen.cn (FastAPI)                     │
│  - RESTful API 接口                                         │
│  - WebSocket 实时推送                                      │
│  - 认证授权服务                                             │
└─────────────────────────────────────────────────────────────┘
                           ↓
        ┌──────────────────┴──────────────────┐
        ↓                                     ↓
┌──────────────────┐              ┌──────────────────┐
│   MySQL 8.0     │              │     Redis       │
│   用户/商品数据   │              │  缓存/会话      │
└──────────────────┘              └──────────────────┘
```

### 项目结构

```
┌─────────────────────────────────────────────────────────────┐
│              Interview (前端 Monorepo)                       │
├─────────────────────────────────────────────────────────────┤
│  apps/                                                     │
│  ├── web/              # 主应用 (端口 3000)              │
│  │   └── src/                                            │
│  │       ├── app/                                           │
│  │       │   ├── docs/                 # 文档展示系统     │
│  │       │   │   ├── page.tsx         # 文档列表         │
│  │       │   │   └── [slug]/page.tsx  # 文档详情        │
│  │       │   ├── api-integration/     # API 集成演示     │
│  │       │   └── ...                                         │
│  │       └── lib/                                           │
│  │           └── docs.ts              # 文档加载工具     │
│  └── admin/            # 管理后台 (端口 3003)          │
│                                                             │
│  packages/                                                  │
│  ├── ui/               # 共享 UI 组件库                  │
│  ├── api-client/       # API 客户端                      │
│  ├── utils/            # 工具函数                         │
│  ├── types/            # 类型定义                         │
│  ├── config/           # 配置文件                         │
│  └── constants/        # 常量定义                        │
│                                                             │
│  docs/                 # 知识库文档 (Markdown 源文件)      │
│  ├── README.md                      # 文档导航           │
│  ├── frontend.md                    # 前端基础知识       │
│  ├── frontend-extended.md           # 前端扩展知识       │
│  ├── dynamic-programming.md         # 动态规划           │
│  ├── case1.md                      # 综合题库           │
│  └── ...                                                       │
│                                                             │
│  scripts/              # 工具脚本                          │
│  turbo.json           # Turborepo 配置                    │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              fastapi-web (后端服务)                           │
├─────────────────────────────────────────────────────────────┤
│  app/                                                       │
│  ├── main.py                 # FastAPI 应用入口             │
│  ├── api/                    # API 路由层                 │
│  │   ├── routers/            # 路由定义                   │
│  │   │   ├── products.py    # 商品 API                   │
│  │   │   ├── cart.py        # 购物车 API                 │
│  │   │   └── docs.py        # 文档 API                   │
│  │   └── deps.py            # 依赖注入                   │
│  ├── core/                   # 核心配置层                  │
│  │   ├── config.py          # 配置管理                   │
│  │   ├── security.py        # 安全工具                   │
│  │   └── deps.py           # 全局依赖                   │
│  ├── models/                 # 数据模型层 (SQLAlchemy)       │
│  │   ├── user.py            # 用户模型                    │
│  │   ├── product.py         # 商品模型                   │
│  │   └── cart.py           # 购物车模型                 │
│  ├── services/               # 业务逻辑层                  │
│  │   ├── auth_service.py    # 认证服务                   │
│  │   ├── cache_service.py   # 缓存服务                   │
│  │   └── doc_service.py    # 文档服务                   │
│  └── middleware/            # 中间件                     │
│      ├── security.py        # 安全中间件                  │
│      ├── logging.py         # 日志中间件                  │
│      └── rate_limit.py     # 速率限制                    │
│                                                             │
│  alembic/                # 数据库迁移                       │
│  tests/                  # 测试用例                        │
│  requirements.txt         # Python 依赖                     │
│  Dockerfile              # 容器构建配置                    │
│  docker-compose.yml      # Docker Compose 配置              │
└─────────────────────────────────────────────────────────────┘
```

## 核心功能模块

### 1. Web 应用（前端知识库）

Web 应用是项目的主入口，提供完整的面试知识库浏览和搜索功能：

- **知识库导航**：结构化的文档分类展示
- **文档渲染**：基于 `next-mdx-remote` 的 Markdown 实时渲染
- **自动加载**：从 `docs/` 目录自动读取和解析 Markdown 文件
- **代码高亮**：优雅的代码块展示和语法高亮
- **搜索功能**：基于关键词的快速检索
- **响应式设计**：适配移动端和桌面端

### 文档展示系统实现

#### 自动文档加载

```typescript
// src/lib/docs.ts
import fs from 'fs';
import path from 'path';

export interface Doc {
  slug: string;
  title: string;
  description?: string;
}

const DOCS_DIR = path.join(process.cwd(), '../../docs');

export function getAllDocs(): Doc[] {
  const files = fs.readdirSync(DOCS_DIR);
  return files
    .filter(file => file.endsWith('.md'))
    .map(file => {
      const slug = file.replace(/\.md$/, '');
      const content = fs.readFileSync(path.join(DOCS_DIR, file), 'utf-8');
      const titleMatch = content.match(/^#\s+(.+)$/m);
      return {
        slug,
        title: titleMatch ? titleMatch[1] : slug,
        description: content.match(/^> (.+)$/m)?.[1]
      };
    });
}

export function getDocBySlug(slug: string): string | null {
  const filePath = path.join(DOCS_DIR, `${slug}.md`);
  return fs.existsSync(filePath) 
    ? fs.readFileSync(filePath, 'utf-8') 
    : null;
}
```

#### 文档列表页面

```typescript
// src/app/docs/page.tsx
import { getAllDocs } from '@/lib/docs';
import Link from 'next/link';

export default function DocsPage() {
  const docs = getAllDocs();

  // 按分类展示
  const coreDocs = docs.filter(doc => ['frontend', 'frontend-extended'].includes(doc.slug));
  const algorithmDocs = docs.filter(doc => 
    ['dynamic-programming', 'min-path-sum-explained'].includes(doc.slug)
  );

  return (
    <div className="container mx-auto">
      <h1>📚 前端面试知识库</h1>
      
      {/* 核心基础知识 */}
      <section>
        <h2>🎯 核心基础知识</h2>
        {coreDocs.map(doc => (
          <Link key={doc.slug} href={`/docs/${doc.slug}`}>
            <Card title={doc.title} description={doc.description} />
          </Link>
        ))}
      </section>

      {/* 算法与数据结构 */}
      <section>
        <h2>🧮 算法与数据结构</h2>
        {algorithmDocs.map(doc => (
          <Link key={doc.slug} href={`/docs/${doc.slug}`}>
            <Card title={doc.title} description={doc.description} />
          </Link>
        ))}
      </section>
    </div>
  );
}
```

#### 文档详情页面

```typescript
// src/app/docs/[slug]/page.tsx
import { getDocBySlug } from '@/lib/docs';
import { MDXRemote } from 'next-mdx-remote/rsc';

export default function DocDetailPage({ params }: { params: { slug: string } }) {
  const content = getDocBySlug(params.slug);

  if (!content) return <div>文档未找到</div>;

  return (
    <article className="prose prose-slate prose-lg max-w-none">
      <MDXRemote source={content} />
    </article>
  );
}
```

### 2. Admin 应用（技术演示平台）

Admin 应用是一个企业级技术演示平台，用于展示和验证多种前端/后端技术：

- **文档编辑器**：在线编辑 `docs/` 目录下的 Markdown 文档（/docs-editor）
  - 实时文档列表展示
  - 在线 Markdown 编辑
  - 创建新文档
  - 实时预览效果
- **双认证系统**：NextAuth.js 和 Passport.js 两种认证方式对比演示
- **安全验证**：CSRF 保护、Lusca 安全中间件
- **缓存演示**：Redis 连接和缓存操作
- **API 集成**：FastAPI 服务代理和跨服务通信
- **管理后台模板**：Dashboard UI 和统计数据展示

### 3. FastAPI 后端服务

FastAPI 后端提供完整的 RESTful API 服务和实时通信能力：

- **商品管理 API**：完整的 CRUD 操作
  - 商品列表查询（分页、筛选、搜索）
  - 商品详情获取
  - 商品创建和更新
  - 商品删除和批量操作
- **购物车 API**：用户购物车管理
  - 添加/删除商品
  - 数量修改
  - 清空购物车
  - 实时同步（WebSocket）
- **文档 API**：知识库文档服务
  - 文档列表和详情
  - 文档操作日志
  - 编辑权限控制
  - 实时预览
- **实时通信**：WebSocket 支持
  - 购物车实时同步
  - 健康度评分系统
  - 在线状态推送
- **安全机制**：
  - JWT 令牌认证
  - 速率限制（防止 DDoS）
  - 可疑访问检测和告警
  - CORS 跨域配置
- **性能优化**：
  - Redis 缓存层
  - 数据库连接池
  - 异步 I/O 处理
  - Gzip 压缩响应

### FastAPI 实现代码示例

#### 路由定义（商品 API）

```python
# app/api/routers/products.py
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse
from app.core.deps import get_db, get_current_user

router = APIRouter(prefix="/products", tags=["Products"])

@router.get("", response_model=List[ProductResponse])
async def get_products(
    skip: int = 0,
    limit: int = 10,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """获取商品列表，支持分页、分类筛选和搜索"""
    query = db.query(Product)

    if category:
        query = query.filter(Product.category == category)

    if search:
        query = query.filter(
            Product.name.contains(search) |
            Product.description.contains(search)
        )

    products = await query.offset(skip).limit(limit).all()
    return products

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    """获取商品详情"""
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="商品不存在")
    return product

@router.post("", response_model=ProductResponse, status_code=201)
async def create_product(
    product: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """创建新商品（需要认证）"""
    db_product = Product(**product.dict())
    db.add(db_product)
    await db.commit()
    await db.refresh(db_product)
    return db_product
```

#### WebSocket 实时同步

```python
# app/api/routers/websocket.py
from fastapi import WebSocket, WebSocketDisconnect
import json

@app.websocket("/ws/cart/{user_id}")
async def websocket_cart(websocket: WebSocket, user_id: int):
    """实时购物车同步"""
    await websocket.accept()
    active_connections[user_id] = websocket

    try:
        while True:
            # 接收客户端消息
            data = await websocket.receive_text()
            message = json.loads(data)

            # 广播给同一用户的其他连接
            for connection in active_connections.get(user_id, []):
                if connection != websocket:
                    await connection.send_json(message)
    except WebSocketDisconnect:
        # 清理连接
        if user_id in active_connections:
            del active_connections[user_id]
```

#### Pydantic 数据验证

```python
# app/schemas/product.py
from pydantic import BaseModel, Field
from decimal import Decimal

class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    price: Decimal = Field(..., gt=0)
    stock: int = Field(default=0, ge=0)
    category: Optional[str] = Field(None, max_length=50)

    class Config:
        json_schema_extra = {
            "example": {
                "name": "示例商品",
                "description": "商品描述",
                "price": 99.99,
                "stock": 100,
                "category": "电子数码"
            }
        }
```

### 3. 共享组件库（packages/ui）

在 Monorepo 架构中，共享组件库是提升开发效率的关键：

```typescript
// 任意应用中导入共享组件
import { Button, Card, Input } from "@interview/ui";

// 带类型提示和自动补全
<Button variant="primary" size="large">
  点击我
</Button>
```

## 知识库内容体系

### 文档结构

整个知识库文档按难度和领域进行分类，形成完整的学习路径：

```
docs/
├── README.md                      # 导航索引
├── frontend.md                    # 基础知识 (70KB)
├── frontend-extended.md           # 扩展知识 (46KB)
├── dynamic-programming.md         # 动态规划 (18KB)
├── min-path-sum-explained.md      # 最小路径和详解
├── frontend-algorithms-practical.md  # 实际工作算法
├── case1.md                      # 综合题库 (优化版)
├── styled-components-guide.md     # styled-components 指南
├── REDIS_USAGE.md                 # Redis 使用指南
└── PACKAGES_VS_SHARED.md          # 包与共享代码
```

### 最新优化内容

**case1.md 综合题库优化亮点：**

1. **格式修正**：修正编号错误，统一的文档结构
2. **代码示例**：每个问题都添加了详细的 TypeScript 代码
3. **对比表格**：多种技术方案的横向对比（如 LRU vs LFU、gRPC vs REST）
4. **实战案例**：第 8 题提供 3 个完整的 STAR 法则案例
5. **完整实现**：LRU/LFU 缓存的完整 TypeScript 实现
6. **质量监控**：WebSocket 健康度评分系统

### 学习路径推荐

#### 初学者路径
```
前端基础知识 → 实际工作中的算法 → 动态规划入门
```

#### 进阶开发者路径
```
前端扩展知识 → 最小路径和详解 → 深入特定技术栈
```

#### 面试冲刺路径
```
核心知识点 → 算法基础 → 深度拓展 → 实战经验 → 综合题库
```

## 技术亮点与最佳实践

### 1. 前端：Turborepo 构建优化

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**优势**：
- 智能缓存机制，避免重复构建
- 并行执行任务，提升构建速度
- 依赖关系自动分析

### 2. 后端：FastAPI 异步架构

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import products, cart, docs

app = FastAPI(
    title="FastAPI Web API",
    description="全栈演示平台后端服务",
    version="1.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 路由注册
app.include_router(products.router, prefix="/api/products", tags=["Products"])
app.include_router(cart.router, prefix="/api/cart", tags=["Cart"])
app.include_router(docs.router, prefix="/api/docs", tags=["Docs"])

# WebSocket 支持
@app.websocket("/ws/cart/{user_id}")
async def websocket_cart(websocket: WebSocket, user_id: int):
    await websocket.accept()
    # 实时购物车同步逻辑
    ...
```

**优势**：
- 原生异步支持，高并发性能
- 自动生成 OpenAPI 文档（Swagger）
- 类型注解驱动的数据验证（Pydantic）
- 内置依赖注入系统

### 3. 后端：分层架构设计

```
app/
├── api/            # API 路由层（处理 HTTP 请求）
├── core/           # 核心配置层（配置、安全、依赖）
├── models/         # 数据模型层（数据库表结构）
├── services/       # 业务逻辑层（核心业务处理）
└── middleware/     # 中间件层（日志、认证、限流）
```

**优势**：
- 职责分离，易于维护和测试
- 业务逻辑独立于 API 接口
- 可复用的服务层
- 灵活的中间件扩展

### 4. 安全机制：多层级防护

```python
# app/middleware/security.py
from fastapi import Request, Response
from app.core.security import is_suspicious_request

@app.middleware("http")
async def security_middleware(request: Request, call_next):
    # 1. 可疑访问检测
    if is_suspicious_request(request):
        logger.warning(f"⚠️  可疑访问检测: IP={request.client.host}")
        return Response(status_code=403)

    # 2. 速率限制
    if await rate_limiter.is_exceeded(request):
        logger.warning(f"🚫  速率限制: IP={request.client.host}")
        return Response(
            content="Too many requests",
            status_code=429
        )

    # 3. 日志记录
    logger.info(f"{request.method} {request.url.path}")

    response = await call_next(request)
    return response
```

**防护措施**：
- ✅ JWT 令牌认证
- ✅ 速率限制（防止滥用）
- ✅ 可疑访问检测
- ✅ CORS 跨域控制
- ✅ SQL 注入防护（ORM）
- ✅ XSS 防护（输入验证）

### 2. MDX/Markdown 渲染方案

使用 `next-mdx-remote` + `@tailwindcss/typography` 实现优雅的文档渲染：

```typescript
// 安装依赖
pnpm add next-mdx-remote @tailwindcss/typography

// Tailwind 配置
// tailwind.config.js
module.exports = {
  plugins: [require('@tailwindcss/typography')],
};

// 使用 Tailwind Typography 类
<article className="prose prose-slate prose-lg max-w-none">
  <MDXRemote source={content} />
</article>
```

**支持的 Markdown 特性：**
- ✅ 标题（H1-H6）
- ✅ 代码块和语法高亮
- ✅ 表格
- ✅ 引用块
- ✅ 列表（有序/无序）
- ✅ 粗体、斜体
- ✅ 链接和图片
- ✅ 分隔线

### 3. Workspace 协议

```json
{
  "dependencies": {
    "@interview/ui": "workspace:*",
    "@interview/utils": "workspace:*"
  }
}
```

使用 `workspace:*` 协议可以实现：
- 开发时实时引用源码
- 构建时自动链接
- 版本统一管理

### 4. 环境变量管理

项目支持多环境配置：

```bash
# .env.example          # 模板文件
# .env.local            # 本地开发（不提交）
# .env.vercel           # Vercel 部署
```

### 5. 组件开发流程

使用 Storybook 进行组件开发：

```bash
# 启动 Storybook
pnpm storybook

# 构建静态文档
pnpm build-storybook
```

**优势**：
- 组件独立开发
- 实时预览效果
- 文档自动生成

## 开发体验优化

### 1. 统一的代码规范

```json
// .eslintrc.js
module.exports = {
  extends: ["@interview/eslint-config"]
}
```

### 2. 类型安全保障

TypeScript 配置支持路径别名：

```json
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@interview/ui": ["./packages/ui/src"]
    }
  }
}
```

### 3. 实用工具脚本

```bash
# 清理端口占用
pnpm kill-ports

# 清理数据库连接
pnpm clean-connections
```

## 部署与运维

### 前端部署：Vercel

项目配置了 Vercel 自动部署：

```json
// vercel.json
{
  "buildCommand": "pnpm build",
  "installCommand": "pnpm install"
}
```

**部署环境**：
- Web 应用：https://web.erishen.cn
- Admin 应用：https://admin.erishen.cn

**部署特点**：
- ✅ 自动化 CI/CD（Git 推送自动部署）
- ✅ Serverless 函数（按需付费）
- ✅ 全球 CDN 加速
- ✅ 自动 HTTPS 证书

### 后端部署：Docker + Linux

FastAPI 后端采用 Docker 容器化部署到 Linux 服务器：

```yaml
# docker-compose.prod.yml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: fastapi-web-app
    network_mode: host
    restart: always
    environment:
      - APP_ENV=production
      - PORT=8086
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    volumes:
      - ./app:/app/app
      - ./logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8086/health"]
      interval: 30s
      retries: 3
```

**部署环境**：
- FastAPI 服务：https://api.erishen.cn

**部署特点**：
- ✅ Docker 容器化（环境一致性）
- ✅ 容器自动重启（`restart: always`）
- ✅ 健康检查（自动恢复）
- ✅ Nginx 反向代理
- ✅ SSL/TLS 加密通信

### 数据库设计

#### MySQL 关系型数据库

```sql
-- 商品表
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 购物车表
CREATE TABLE cart_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- 索引优化
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_cart_items_user ON cart_items(user_id);
```

#### Redis 缓存策略

```python
# app/services/cache_service.py
from redis import Redis
from json import dumps, loads

class CacheService:
    def __init__(self):
        self.redis = Redis(
            host="localhost",
            port=6380,
            password="redispassword",
            decode_responses=True
        )

    # 缓存商品列表（TTL 5 分钟）
    async def cache_products(self, products: list):
        await self.redis.setex(
            "products:list",
            300,
            dumps(products)
        )

    # 缓存用户会话（TTL 30 分钟）
    async def cache_session(self, user_id: int, session: dict):
        await self.redis.setex(
            f"session:{user_id}",
            1800,
            dumps(session)
        )

    # 缓存文档内容（TTL 10 分钟）
    async def cache_doc(self, slug: str, content: str):
        await self.redis.setex(
            f"doc:{slug}",
            600,
            content
        )
```

**缓存策略**：
- 商品列表：5 分钟（热点数据）
- 用户会话：30 分钟
- 文档内容：10 分钟
- 购物车数据：实时同步

### 开发环境启动

```bash
# 安装依赖
pnpm install

# 启动所有应用
pnpm dev

# 启动单个应用
pnpm dev --filter=@interview/web

# 访问文档列表
open http://localhost:3000/docs
```

## 项目收益与反思

### 收益

1. **全栈技术沉淀**：系统梳理了前后端知识体系
2. **工程化实践**：掌握了 Monorepo + Docker 完整架构
3. **学习效率**：快速查找技术相关知识点
4. **分享价值**：帮助他人学习成长
5. **文档系统**：优雅的 Markdown 展示体验
6. **实战经验**：完成完整的产品开发流程

### 反思与改进

1. **文档维护成本**：内容更新需要持续投入
2. **性能优化**：大文档加载体验有待优化（可考虑分块加载）
3. **社区参与**：缺乏互动机制和用户反馈
4. **搜索功能**：可以增加全文搜索和智能推荐
5. **后端监控**：需要添加性能监控和告警系统
6. **容器编排**：未来可考虑 Kubernetes 集群部署

### 未来规划

#### 前端优化
- [ ] 添加全文搜索功能（ElasticSearch）
- [ ] 支持文档评论和互动
- [ ] 实现深色模式
- [ ] 添加阅读进度和书签功能
- [ ] 支持导出 PDF

#### 后端优化
- [ ] 添加性能监控（Prometheus + Grafana）
- [ ] 实现分布式追踪（Jaeger）
- [ ] 添加消息队列（RabbitMQ/Celery）
- [ ] 优化数据库查询（读写分离）
- [ ] 实现 GraphQL API

#### 运维优化
- [ ] CI/CD 自动化流程优化
- [ ] 容器编排迁移到 Kubernetes
- [ ] 自动化测试覆盖率提升
- [ ] 灰度发布和回滚机制

## 总结

这个项目不仅是技术的实践，更是学习方法的沉淀。通过构建全栈知识库，我深刻理解了：

- **系统性学习**的重要性：将零散知识点结构化
- **全栈思维**的价值：前后端协同，构建完整产品
- **工程化思维**的价值：用最佳实践提升开发效率
- **分享的力量**：知识越分享越丰富
- **用户体验**的细节：从简单渲染到优雅展示

最新添加的文档展示系统和 FastAPI 后端服务，让知识库的维护和使用变得更加便捷。Markdown 文件只需放入 `docs/` 目录，即可自动在 Web 应用中展示；API 层面提供了完整的 CRUD 操作和实时通信能力，大大降低了内容更新和功能扩展的门槛。

希望这个项目能够成为更多开发者的技术参考和学习助手。如果你对项目有任何建议或想要贡献内容，欢迎参与共建！

---

**项目地址**：
- 前端项目：https://github.com/erishen/interview
- 后端项目：https://github.com/erishen/fastapi-web

**在线体验**：
- 🌐 Web 应用：https://web.erishen.cn
- 🛠️ 管理后台：https://admin.erishen.cn
- 📚 文档列表：https://web.erishen.cn/docs
- 🔌 API 服务：https://api.erishen.cn
- 📖 API 文档：https://api.erishen.cn/docs

**技术栈**：
- 前端：Next.js 14 + React 18 + TypeScript 5 + Turborepo
- 后端：FastAPI + Python 3.10 + Pydantic + SQLAlchemy
- 数据库：MySQL 8.0 + Redis
- 部署：Vercel + Docker + Nginx

> "授人以鱼不如授人以渔"，希望这个全栈知识库能够帮助更多开发者成长！
