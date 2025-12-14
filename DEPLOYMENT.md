# Vercel Deployment Guide

## 🚀 部署到 Vercel

这个 monorepo 项目支持部署到 Vercel，包含两个 Next.js 应用：

### 📱 应用结构
- **Web App**: 主应用 (`apps/web`) - `https://your-domain.vercel.app`
- **Admin App**: 管理后台 (`apps/admin`) - `https://your-domain.vercel.app/admin`

### 🎯 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/interview-monorepo)

## 🛠️ 部署配置

### 1. 项目设置

在 Vercel 仪表板中：

1. **导入项目**: 连接你的 GitHub 仓库
2. **Framework Preset**: 选择 "Next.js"
3. **Root Directory**: 保持为根目录 (不要选择子目录)

### 2. 构建设置

```bash
# Build Command
pnpm turbo build

# Output Directory  
apps/web/.next

# Install Command
pnpm install

# Development Command
pnpm dev
```

### 3. 环境变量

在 Vercel 项目设置中添加必要的环境变量：

```bash
# 示例环境变量
NEXT_PUBLIC_API_URL=https://your-api.vercel.app
DATABASE_URL=your-database-url
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.vercel.app
```

## 🌐 多应用部署

### 方案 1: 单域名部署 (推荐)

使用路由规则将两个应用部署到同一个域名：

- **主应用**: `https://your-domain.vercel.app`
- **管理后台**: `https://your-domain.vercel.app/admin`

### 方案 2: 分别部署

为每个应用创建单独的 Vercel 项目：

#### Web App 部署
```bash
# Root Directory: apps/web
# Build Command: cd ../.. && pnpm turbo build --filter=@interview/web
# Output Directory: .next
```

#### Admin App 部署  
```bash
# Root Directory: apps/admin
# Build Command: cd ../.. && pnpm turbo build --filter=@interview/admin
# Output Directory: .next
```

## 📋 部署检查清单

- [ ] 确保所有环境变量已设置
- [ ] 检查 `package.json` 中的脚本
- [ ] 验证 `turbo.json` 配置
- [ ] 测试本地构建: `pnpm turbo build`
- [ ] 检查依赖版本兼容性

## 🔧 故障排除

### 常见问题

1. **构建失败**
   ```bash
   # 本地测试构建
   pnpm clean
   pnpm install
   pnpm turbo build
   ```

2. **依赖问题**
   - 确保 `pnpm-workspace.yaml` 配置正确
   - 检查 workspace 依赖版本

3. **路径问题**
   - 验证 `tsconfig.json` 中的路径映射
   - 检查相对路径引用

## 🚀 自动部署

推送到主分支时自动部署：

```yaml
# .github/workflows/deploy.yml (可选)
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: corepack enable
      - run: pnpm install
      - run: pnpm turbo build
```

## 📊 性能优化

- 启用 Vercel Analytics
- 配置 ISR (Incremental Static Regeneration)
- 使用 Vercel Edge Functions (如需要)
- 优化图片和静态资源

## 🔗 有用链接

- [Vercel Monorepo 文档](https://vercel.com/docs/concepts/git/monorepos)
- [Next.js 部署文档](https://nextjs.org/docs/deployment)
- [Turborepo 部署指南](https://turbo.build/repo/docs/handbook/deploying-with-docker)