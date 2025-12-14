# Vercel 部署配置

## 🚀 快速部署

### 1. 一键部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/interview-monorepo)

### 2. 手动部署步骤

1. **Fork 或 Clone 项目**
   ```bash
   git clone https://github.com/your-username/interview-monorepo.git
   cd interview-monorepo
   ```

2. **安装依赖**
   ```bash
   pnpm install
   ```

3. **本地测试构建**
   ```bash
   pnpm build
   ```

4. **连接到 Vercel**
   ```bash
   npx vercel
   ```

## 📋 部署配置

### 项目设置

在 Vercel 仪表板中配置：

- **Framework Preset**: Next.js
- **Root Directory**: `/` (根目录)
- **Build Command**: `pnpm turbo build`
- **Output Directory**: `apps/web/.next`
- **Install Command**: `pnpm install`
- **Node.js Version**: 18.x

### 环境变量

```bash
# 必需的环境变量
NODE_VERSION=18
PNPM_VERSION=10.0.0

# 可选的环境变量
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_ADMIN_URL=https://your-domain.vercel.app/admin
```

## 🌐 多应用部署策略

### 策略 1: 单项目部署 (推荐)

使用 `vercel.json` 配置，将两个应用部署到同一个域名：

- **主应用**: `https://your-domain.vercel.app`
- **管理后台**: `https://your-domain.vercel.app/admin`

### 策略 2: 分别部署

为每个应用创建独立的 Vercel 项目：

#### Web App 项目
```bash
# 项目名: interview-web
# Root Directory: apps/web
# Build Command: cd ../.. && pnpm deploy:web
```

#### Admin App 项目
```bash
# 项目名: interview-admin  
# Root Directory: apps/admin
# Build Command: cd ../.. && pnpm deploy:admin
```

## 🔧 高级配置

### 自定义域名

1. 在 Vercel 项目设置中添加自定义域名
2. 配置 DNS 记录指向 Vercel
3. 更新环境变量中的 URL

### 性能优化

- 启用 Vercel Analytics
- 配置 Edge Functions (如需要)
- 使用 Image Optimization
- 启用 Incremental Static Regeneration

### 监控和日志

- 查看 Vercel Functions 日志
- 设置错误监控 (Sentry)
- 配置性能监控

## 🚨 故障排除

### 常见问题

1. **构建失败**
   - 检查 Node.js 版本 (需要 18.x)
   - 确保 pnpm 版本正确
   - 验证所有依赖已安装

2. **路径问题**
   - 检查 `tsconfig.json` 路径映射
   - 验证 workspace 依赖

3. **环境变量**
   - 确保所有必需的环境变量已设置
   - 检查变量名拼写

### 调试命令

```bash
# 本地调试构建
pnpm clean
pnpm install
pnpm build

# 检查依赖
pnpm list

# 验证 Turbo 配置
pnpm turbo build --dry-run
```

## 📊 部署状态

- ✅ Web App: 已配置
- ✅ Admin App: 已配置  
- ✅ Shared Packages: 已配置
- ✅ Build Pipeline: 已优化
- ✅ Vercel 配置: 已完成