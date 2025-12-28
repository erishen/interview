# Supabase 配置指南

## 为什么选择 Supabase？

Supabase 提供 500MB 存储空间，远超 Redis Labs 的 30MB。

## 配置步骤

### 1. 创建 Supabase 项目

1. 访问 https://supabase.com
2. 点击 "New Project"
3. 填写项目信息：
   - **Name**: interview-docs
   - **Database Password**: 设置强密码
   - **Region**: 选择离你最近的区域
4. 点击 "Create new project"（等待 2-3 分钟）

### 2. 创建数据库表

1. 进入 Supabase Dashboard
2. 点击左侧菜单的 "SQL Editor"
3. 点击 "New query"
4. 复制 `supabase-setup.sql` 文件内容并粘贴
5. 点击 "Run" 执行脚本
6. 确认看到 "✅" 成功消息

### 3. 获取环境变量

1. 在 Supabase Dashboard 中，点击 **Settings** → **API**
2. 复制以下两个值：
   - **Project URL** → `SUPABASE_URL`
   - **anon/public key** → `SUPABASE_ANON_KEY`

### 4. 添加环境变量到 Vercel

#### 方式 1：通过 Vercel 仪表板（推荐）

1. 访问 https://vercel.com/your-username/interview/settings/environment-variables
2. 点击 "Add New" 添加环境变量：

   **变量 1:**
   - **Name**: `SUPABASE_URL`
   - **Value**: `https://your-project.supabase.co`
   - **Environments**: 选择 `Production`, `Preview`, `Development`
   - 点击 "Save"

   **变量 2:**
   - **Name**: `SUPABASE_ANON_KEY`
   - **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`（你的 anon key）
   - **Environments**: 选择 `Production`, `Preview`, `Development`
   - 点击 "Save"

3. 保存后，进入 "Deployments" 标签，点击最新部署右侧的 "..." → "Redeploy"

#### 方式 2：通过 Vercel CLI

```bash
cd /Users/erishen/Workspace/CNB/individular-invest/interview/apps/admin

# 添加环境变量
vercel env add SUPABASE_URL
# 系统会提示你输入值，选择所有环境

vercel env add SUPABASE_ANON_KEY
# 系统会提示你输入值，选择所有环境

# 重新部署
vercel --prod
```

### 5. 验证配置

部署成功后，访问你的应用：
- 创建一个新文档
- 检查 Vercel 函数日志，应该看到：
  ```
  [Supabase Store] Supabase client initialized successfully
  [Supabase Store] Created doc: test-doc
  ```

- 在 Supabase Dashboard → Table Editor 中查看 `docs` 表，应该能看到创建的文档

## 存储优先级

应用会按照以下优先级选择存储后端：

1. **Supabase**（推荐）- 500MB 存储
2. **Redis** - 30MB 存储
3. **Vercel KV** - 256MB 存储
4. **文件系统** - 仅本地开发

## 表结构

### docs 表
```sql
id          BIGINT   主键
slug        TEXT     文档 URL（唯一）
title       TEXT     文档标题
description TEXT     文档描述
content     TEXT     文档内容（Markdown）
created_at  TIMESTAMP 创建时间
updated_at  TIMESTAMP 更新时间
```

### trash 表
```sql
id              BIGINT   主键
slug            TEXT     文档 URL
title           TEXT     文档标题
description     TEXT     文档描述
content         TEXT     文档内容
created_at      TIMESTAMP 原始创建时间
updated_at      TIMESTAMP 原始更新时间
trash_timestamp TEXT     删除时间戳（唯一）
```

## 故障排查

### Supabase 初始化失败

如果看到 `Failed to initialize Supabase` 错误：

1. 检查环境变量是否正确：
   ```bash
   vercel env ls
   ```

2. 确认环境变量值是否完整（没有多余的引号或空格）

3. 查看 Supabase Dashboard → Logs 检查数据库连接

### 表不存在错误

如果看到 `relation "docs" does not exist`：

1. 在 Supabase Dashboard → SQL Editor 中重新执行 `supabase-setup.sql`
2. 确认所有表都创建成功

### 权限错误

如果看到 `permission denied`：

1. 检查 Row Level Security 策略
2. 确认 anon key 有访问权限

## 性能优化

当前已优化的功能：
- ✅ 所有查询字段都有索引
- ✅ 自动更新时间戳（通过触发器）
- ✅ 行级安全控制
- ✅ 查询结果缓存（Supabase 自动处理）

## 参考资料

- [Supabase 文档](https://supabase.com/docs)
- [Supabase JavaScript 客户端](https://supabase.com/docs/reference/javascript)
- [定价页面](https://supabase.com/pricing)
